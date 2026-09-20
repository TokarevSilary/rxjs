export function createElement(tagName, attrs = {}, ...children) {
  const el = document.createElement(tagName);
  Object.assign(el, attrs);
  el.append(...children);
  return el;
}
