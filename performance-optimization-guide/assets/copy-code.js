(function () {
  var languageLabels = {
    bash: "Bash",
    shell: "Bash",
    sh: "Bash",
    sql: "SQL",
    plsql: "PL/SQL",
    json: "JSON",
    java: "Java",
    text: "Text"
  };

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  function getLanguage(pre) {
    var code = pre.querySelector("code");
    var className = code ? code.className : "";
    var match = className.match(/(?:^|\s)language-([a-z0-9_-]+)/i);
    return match ? match[1].toLowerCase() : "text";
  }

  function getCodeClass(language) {
    if (language === "sql" || language === "plsql") {
      return "code-sql";
    }
    if (language === "bash" || language === "shell" || language === "sh") {
      return "code-bash";
    }
    if (language === "java") {
      return "code-java";
    }
    if (language === "json") {
      return "code-text";
    }
    return "code-text";
  }

  function getLabel(language) {
    return languageLabels[language] || language.toUpperCase();
  }

  function getObjective(pre) {
    if (pre.dataset && pre.dataset.objective) {
      return "Objective: " + pre.dataset.objective.replace(/\.$/, "") + ".";
    }

    var text = (pre.textContent || "").trim();
    var firstLine = text.split(/\r?\n/)[0] || "";
    var comment = firstLine
      .replace(/^--\s*/, "")
      .replace(/^#\s*/, "")
      .replace(/^\/\/\s*/, "")
      .trim();

    if (!comment || comment === firstLine.trim() || comment.length > 120) {
      return "";
    }

    return "Objective: " + comment.replace(/\.$/, "") + ".";
  }

  function wrapSnippet(pre, index) {
    if (pre.closest(".code-card")) {
      return;
    }

    var code = pre.querySelector("code");
    var language = getLanguage(pre);
    var card = document.createElement("div");
    var toolbar = document.createElement("div");
    var label = document.createElement("span");
    var button = document.createElement("button");
    var objective = getObjective(pre);

    card.className = "code-card " + getCodeClass(language);
    toolbar.className = "code-toolbar";
    label.textContent = getLabel(language);

    button.type = "button";
    button.className = "copy-btn";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code snippet " + (index + 1));

    pre.parentNode.insertBefore(card, pre);
    toolbar.appendChild(label);
    toolbar.appendChild(button);
    card.appendChild(toolbar);

    if (objective) {
      var description = document.createElement("div");
      description.className = "code-description";
      description.textContent = objective;
      card.appendChild(description);
    }

    pre.setAttribute("tabindex", "0");
    card.appendChild(pre);

    button.addEventListener("click", function () {
      var text = code ? code.textContent : pre.textContent;

      copyText(text.trim()).then(function () {
        button.textContent = "Copied";
        button.classList.add("is-copied");
        window.setTimeout(function () {
          button.textContent = "Copy";
          button.classList.remove("is-copied");
        }, 1400);
      }).catch(function () {
        button.textContent = "Selected";
        window.setTimeout(function () {
          button.textContent = "Copy";
        }, 1400);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("pre"), wrapSnippet);
  });
})();
