const variablesMap = new Map();

class CreateVar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const varName = this.getAttribute("varName");
    const varValue = this.getAttribute("varValue");
    const value = evaluateText(varValue);
    variablesMap.set(varName, value);
  }
}

customElements.define("create-var", CreateVar);

class Eval extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const text = this.innerHTML.trim();
    const evaluatedText = evaluation(text);
    this.innerHTML = evaluatedText;
  }
}

customElements.define("jamstl-eval", Eval);

function evaluation(text) {
  const variableRegex = /\{([a-zA-Z]+)\}/g;
  let match = variableRegex.exec(text);
  while (match !== null) {
    const variableName = match[1];
    const variableValue = variablesMap.get(variableName);

    if (variableValue) {
      text = text.replace(`{{${variableName.trim()}}}`, variableValue);
    }

    match = variableRegex.exec(text);
  }

  const mathRegex = /(\d+)(\s*)([+\-*/])(\s*)(\d+)/g;
  match = mathRegex.exec(text);
  while (match !== null) {
    const expr = match[0];
    const value = eval(expr);
    text = text.replace(expr, value);

    match = mathRegex.exec(text);
  }

  return text;
}

class Paragraph extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const text = this.innerHTML.trim();
    const evaluatedText = evaluateText(text);
    this.innerHTML = `<p>${evaluatedText}</p>`;
  }
}

customElements.define("jamstl-p", Paragraph);

function evaluateText(text) {
  const variableRegex = /\{([a-zA-Z]+)\}/g;
  let match = variableRegex.exec(text);
  while (match !== null) {
    const variableName = match[1];
    const variableValue = variablesMap.get(variableName);

    if (variableValue) {
      text = text.replace(`{{${variableName}}}`, variableValue);
    }

    match = variableRegex.exec(text);
  }

  text = text.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) =>
    match.replace(/['"]/g, "")
  );

  return text;
}

class IfStatement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const condition = this.getAttribute("condition");

    const isTrue = evaluateCondition(condition);

    const ifContent = this.querySelector(":not(else-statement)")?.innerHTML.trim();
    const elseContent = this.querySelector("else-statement")?.innerHTML.trim();
    console.log(ifContent)
    console.log(elseContent)

    if (isTrue && ifContent) {
      this.innerHTML = evaluateText(ifContent);
    } else if (!isTrue && elseContent) {
      this.innerHTML = evaluateText(elseContent);
    } else {
      this.innerHTML = "";
    }
  }
}


class ElseStatement extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("if-statement", IfStatement);
customElements.define("else-statement", ElseStatement);

function evaluateCondition(condition) {
  const variableRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  let match = variableRegex.exec(condition);
  while (match !== null) {
    const variableName = match[1];
    const variableValue = variablesMap.get(variableName);

    if (variableValue) {
      condition = condition.replace(`{{${variableName}}}`, variableValue);
    }

    match = variableRegex.exec(condition);
  }

  const booleanValue = eval(condition);
  return Boolean(booleanValue);
}


class ForLoop extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const varName = this.getAttribute("varName");
    const start = parseInt(this.getAttribute("start"));
    const end = parseInt(this.getAttribute("end"));
    const content = this.innerHTML.trim();

    let evaluatedContent = "";

    for (let i = start; i < end; i++) {
      let currentContent = content.replace(
        new RegExp(`{{${varName}}}`, "g"),
        i.toString()
      );
      evaluatedContent += currentContent;
    }

    this.insertAdjacentHTML("beforebegin", evaluatedContent);
    this.remove();
  }
}

function evaluateFor(text) {
  const template = document.createElement("template");
  template.innerHTML = text;

  const forLoops = template.content.querySelectorAll("for-loop");

  for (let i = 0; i < forLoops.length; i++) {
    const forLoop = forLoops[i];
    forLoop.remove();
    document.body.appendChild(forLoop);
  }

  const result = template.innerHTML.trim();

  for (let i = 0; i < forLoops.length; i++) {
    const forLoop = forLoops[i];
    const varName = forLoop.getAttribute("varName");
    const start = parseInt(forLoop.getAttribute("start"));
    const end = parseInt(forLoop.getAttribute("end"));
    const content = forLoop.innerHTML.trim();

    let evaluatedContent = "";

    for (let i = start; i < end; i++) {
      let currentContent = content.replace(
        new RegExp(`{{${varName}}}`, "g"),
        i.toString()
      );
      evaluatedContent += currentContent;
    }

    const parent = forLoop.parentNode;
    parent.insertAdjacentHTML("beforebegin", evaluatedContent);
    parent.removeChild(forLoop);
  }

  return result;
}

customElements.define("for-loop", ForLoop);
