import { from as arrayFrom } from './array';
import { hasWindowSupport, hasDocumentSupport } from './env';
import { isFunction, isNull } from './inspect';
import { toFloat } from './number'; // --- Constants ---

var TABABLE_SELECTOR = ['button', '[href]:not(.disabled)', 'input', 'select', 'textarea', '[tabindex]', '[contenteditable]'].map(function (s) {
  return "".concat(s, ":not(:disabled):not([disabled])");
}).join(', ');
var w = hasWindowSupport ? window : {};
var d = hasDocumentSupport ? document : {};
var elProto = typeof Element !== 'undefined' ? Element.prototype : {}; // --- Normalization utils ---
// See: https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill

/* istanbul ignore next */

export var matchesEl = elProto.matches || elProto.msMatchesSelector || elProto.webkitMatchesSelector; // See: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest

/* istanbul ignore next */

export var closestEl = elProto.closest || function (sel)
/* istanbul ignore next */
{
  var el = this;

  do {
    // Use our "patched" matches function
    if (matches(el, sel)) {
      return el;
    }

    el = el.parentElement || el.parentNode;
  } while (!isNull(el) && el.nodeType === Node.ELEMENT_NODE);

  return null;
}; // `requestAnimationFrame()` convenience method

/* istanbul ignore next: JSDOM always returns the first option */

export var requestAF = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.mozRequestAnimationFrame || w.msRequestAnimationFrame || w.oRequestAnimationFrame || // Fallback, but not a true polyfill
// Only needed for Opera Mini

/* istanbul ignore next */
function (cb) {
  return setTimeout(cb, 16);
};
export var MutationObs = w.MutationObserver || w.WebKitMutationObserver || w.MozMutationObserver || null; // --- Utils ---
// Remove a node from DOM

export var removeNode = function removeNode(el) {
  return el && el.parentNode && el.parentNode.removeChild(el);
}; // Determine if an element is an HTML element

export var isElement = function isElement(el) {
  return !!(el && el.nodeType === Node.ELEMENT_NODE);
}; // Determine if an HTML element is visible - Faster than CSS check

export var isVisible = function isVisible(el) {
  if (!isElement(el) || !el.parentNode || !contains(d.body, el)) {
    // Note this can fail for shadow dom elements since they
    // are not a direct descendant of document.body
    return false;
  }

  if (el.style.display === 'none') {
    // We do this check to help with vue-test-utils when using v-show

    /* istanbul ignore next */
    return false;
  } // All browsers support getBoundingClientRect(), except JSDOM as it returns all 0's for values :(
  // So any tests that need isVisible will fail in JSDOM
  // Except when we override the getBCR prototype in some tests


  var bcr = getBCR(el);
  return !!(bcr && bcr.height > 0 && bcr.width > 0);
}; // Determine if an element is disabled

export var isDisabled = function isDisabled(el) {
  return !isElement(el) || el.disabled || hasAttr(el, 'disabled') || hasClass(el, 'disabled');
}; // Cause/wait-for an element to reflow its content (adjusting its height/width)

export var reflow = function reflow(el) {
  // Requesting an elements offsetHight will trigger a reflow of the element content

  /* istanbul ignore next: reflow doesn't happen in JSDOM */
  return isElement(el) && el.offsetHeight;
}; // Select all elements matching selector. Returns `[]` if none found

export var selectAll = function selectAll(selector, root) {
  return arrayFrom((isElement(root) ? root : d).querySelectorAll(selector));
}; // Select a single element, returns `null` if not found

export var select = function select(selector, root) {
  return (isElement(root) ? root : d).querySelector(selector) || null;
}; // Determine if an element matches a selector

export var matches = function matches(el, selector) {
  return isElement(el) ? matchesEl.call(el, selector) : false;
}; // Finds closest element matching selector. Returns `null` if not found

export var closest = function closest(selector, root) {
  var includeRoot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (!isElement(root)) {
    return null;
  }

  var el = closestEl.call(root, selector); // Native closest behaviour when `includeRoot` is truthy,
  // else emulate jQuery closest and return `null` if match is
  // the passed in root element when `includeRoot` is falsey

  return includeRoot ? el : el === root ? null : el;
}; // Returns true if the parent element contains the child element

export var contains = function contains(parent, child) {
  return parent && isFunction(parent.contains) ? parent.contains(child) : false;
}; // Get an element given an ID

export var getById = function getById(id) {
  return d.getElementById(/^#/.test(id) ? id.slice(1) : id) || null;
}; // Add a class to an element

export var addClass = function addClass(el, className) {
  // We are checking for `el.classList` existence here since IE 11
  // returns `undefined` for some elements (e.g. SVG elements)
  // See https://github.com/bootstrap-vue/bootstrap-vue/issues/2713
  if (className && isElement(el) && el.classList) {
    el.classList.add(className);
  }
}; // Remove a class from an element

export var removeClass = function removeClass(el, className) {
  // We are checking for `el.classList` existence here since IE 11
  // returns `undefined` for some elements (e.g. SVG elements)
  // See https://github.com/bootstrap-vue/bootstrap-vue/issues/2713
  if (className && isElement(el) && el.classList) {
    el.classList.remove(className);
  }
}; // Test if an element has a class

export var hasClass = function hasClass(el, className) {
  // We are checking for `el.classList` existence here since IE 11
  // returns `undefined` for some elements (e.g. SVG elements)
  // See https://github.com/bootstrap-vue/bootstrap-vue/issues/2713
  if (className && isElement(el) && el.classList) {
    return el.classList.contains(className);
  }

  return false;
}; // Set an attribute on an element

export var setAttr = function setAttr(el, attr, val) {
  if (attr && isElement(el)) {
    el.setAttribute(attr, val);
  }
}; // Remove an attribute from an element

export var removeAttr = function removeAttr(el, attr) {
  if (attr && isElement(el)) {
    el.removeAttribute(attr);
  }
}; // Get an attribute value from an element
// Returns `null` if not found

export var getAttr = function getAttr(el, attr) {
  return attr && isElement(el) ? el.getAttribute(attr) : null;
}; // Determine if an attribute exists on an element
// Returns `true` or `false`, or `null` if element not found

export var hasAttr = function hasAttr(el, attr) {
  return attr && isElement(el) ? el.hasAttribute(attr) : null;
}; // Return the Bounding Client Rect of an element
// Returns `null` if not an element

/* istanbul ignore next: getBoundingClientRect() doesn't work in JSDOM */

export var getBCR = function getBCR(el) {
  return isElement(el) ? el.getBoundingClientRect() : null;
}; // Get computed style object for an element

/* istanbul ignore next: getComputedStyle() doesn't work in JSDOM */

export var getCS = function getCS(el) {
  return hasWindowSupport && isElement(el) ? w.getComputedStyle(el) : {};
}; // Returns a `Selection` object representing the range of text selected
// Returns `null` if no window support is given

/* istanbul ignore next: getSelection() doesn't work in JSDOM */

export var getSel = function getSel() {
  return hasWindowSupport && w.getSelection ? w.getSelection() : null;
}; // Return an element's offset with respect to document element
// https://j11y.io/jquery/#v=git&fn=jQuery.fn.offset

export var offset = function offset(el)
/* istanbul ignore next: getBoundingClientRect(), getClientRects() doesn't work in JSDOM */
{
  var _offset = {
    top: 0,
    left: 0
  };

  if (!isElement(el) || el.getClientRects().length === 0) {
    return _offset;
  }

  var bcr = getBCR(el);

  if (bcr) {
    var win = el.ownerDocument.defaultView;
    _offset.top = bcr.top + win.pageYOffset;
    _offset.left = bcr.left + win.pageXOffset;
  }

  return _offset;
}; // Return an element's offset with respect to to its offsetParent
// https://j11y.io/jquery/#v=git&fn=jQuery.fn.position

export var position = function position(el)
/* istanbul ignore next: getBoundingClientRect() doesn't work in JSDOM */
{
  var _offset = {
    top: 0,
    left: 0
  };

  if (!isElement(el)) {
    return _offset;
  }

  var parentOffset = {
    top: 0,
    left: 0
  };
  var elStyles = getCS(el);

  if (elStyles.position === 'fixed') {
    _offset = getBCR(el) || _offset;
  } else {
    _offset = offset(el);
    var doc = el.ownerDocument;
    var offsetParent = el.offsetParent || doc.documentElement;

    while (offsetParent && (offsetParent === doc.body || offsetParent === doc.documentElement) && getCS(offsetParent).position === 'static') {
      offsetParent = offsetParent.parentNode;
    }

    if (offsetParent && offsetParent !== el && offsetParent.nodeType === Node.ELEMENT_NODE) {
      parentOffset = offset(offsetParent);
      var offsetParentStyles = getCS(offsetParent);
      parentOffset.top += toFloat(offsetParentStyles.borderTopWidth, 0);
      parentOffset.left += toFloat(offsetParentStyles.borderLeftWidth, 0);
    }
  }

  return {
    top: _offset.top - parentOffset.top - toFloat(elStyles.marginTop, 0),
    left: _offset.left - parentOffset.left - toFloat(elStyles.marginLeft, 0)
  };
}; // Find all tabable elements in the given element
// Assumes users have not used `tabindex` > `0` on elements

export var getTabables = function getTabables() {
  var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  return selectAll(TABABLE_SELECTOR, el).filter(isVisible).filter(function (i) {
    return i.tabIndex > -1 && !i.disabled;
  });
};