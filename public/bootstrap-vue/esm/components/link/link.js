function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Vue from '../../utils/vue';
import normalizeSlotMixin from '../../mixins/normalize-slot';
import { concat } from '../../utils/array';
import { isEvent, isFunction, isUndefined } from '../../utils/inspect';
import { computeHref, computeRel, computeTag, isRouterLink as _isRouterLink } from '../../utils/router';
/**
 * The Link component is used in many other BV components.
 * As such, sharing its props makes supporting all its features easier.
 * However, some components need to modify the defaults for their own purpose.
 * Prefer sharing a fresh copy of the props to ensure mutations
 * do not affect other component references to the props.
 *
 * https://github.com/vuejs/vue-router/blob/dev/src/components/link.js
 * @return {{}}
 */

export var propsFactory = function propsFactory() {
  return {
    href: {
      type: String,
      default: null
    },
    rel: {
      type: String,
      // Must be `null` if no value provided
      default: null
    },
    target: {
      type: String,
      default: '_self'
    },
    active: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // router-link specific props
    to: {
      type: [String, Object],
      default: null
    },
    append: {
      type: Boolean,
      default: false
    },
    replace: {
      type: Boolean,
      default: false
    },
    event: {
      type: [String, Array],
      default: 'click'
    },
    activeClass: {
      type: String // default: undefined

    },
    exact: {
      type: Boolean,
      default: false
    },
    exactActiveClass: {
      type: String // default: undefined

    },
    routerTag: {
      type: String,
      default: 'a'
    },
    // nuxt-link specific prop(s)
    noPrefetch: {
      type: Boolean,
      default: false
    }
  };
};
export var props = propsFactory(); // @vue/component

export var BLink = /*#__PURE__*/Vue.extend({
  name: 'BLink',
  mixins: [normalizeSlotMixin],
  inheritAttrs: false,
  props: propsFactory(),
  computed: {
    computedTag: function computedTag() {
      // We don't pass `this` as the first arg as we need reactivity of the props
      return computeTag({
        to: this.to,
        disabled: this.disabled
      }, this);
    },
    isRouterLink: function isRouterLink() {
      return _isRouterLink(this.computedTag);
    },
    computedRel: function computedRel() {
      // We don't pass `this` as the first arg as we need reactivity of the props
      return computeRel({
        target: this.target,
        rel: this.rel
      });
    },
    computedHref: function computedHref() {
      // We don't pass `this` as the first arg as we need reactivity of the props
      return computeHref({
        to: this.to,
        href: this.href
      }, this.computedTag);
    },
    computedProps: function computedProps() {
      return this.isRouterLink ? _objectSpread(_objectSpread({}, this.$props), {}, {
        tag: this.routerTag
      }) : {};
    }
  },
  methods: {
    onClick: function onClick(evt) {
      var _arguments = arguments;
      var evtIsEvent = isEvent(evt);
      var isRouterLink = this.isRouterLink;
      var suppliedHandler = this.$listeners.click;

      if (evtIsEvent && this.disabled) {
        // Stop event from bubbling up
        evt.stopPropagation(); // Kill the event loop attached to this specific `EventTarget`
        // Needed to prevent `vue-router` for doing its thing

        evt.stopImmediatePropagation();
      } else {
        /* istanbul ignore next: difficult to test, but we know it works */
        if (isRouterLink && evt.currentTarget.__vue__) {
          // Router links do not emit instance `click` events, so we
          // add in an `$emit('click', evt)` on its Vue instance
          evt.currentTarget.__vue__.$emit('click', evt);
        } // Call the suppliedHandler(s), if any provided


        concat(suppliedHandler).filter(function (h) {
          return isFunction(h);
        }).forEach(function (handler) {
          handler.apply(void 0, _toConsumableArray(_arguments));
        }); // Emit the global `$root` click event

        this.$root.$emit('clicked::link', evt);
      } // Stop scroll-to-top behavior or navigation on
      // regular links when href is just '#'


      if (evtIsEvent && (this.disabled || !isRouterLink && this.computedHref === '#')) {
        evt.preventDefault();
      }
    },
    focus: function focus() {
      if (this.$el && this.$el.focus) {
        this.$el.focus();
      }
    },
    blur: function blur() {
      if (this.$el && this.$el.blur) {
        this.$el.blur();
      }
    }
  },
  render: function render(h) {
    var active = this.active,
        disabled = this.disabled,
        target = this.target,
        routerTag = this.routerTag,
        isRouterLink = this.isRouterLink;
    var tag = this.computedTag;
    var rel = this.computedRel;
    var href = this.computedHref;
    var componentData = {
      class: {
        active: active,
        disabled: disabled
      },
      attrs: _objectSpread(_objectSpread(_objectSpread({}, this.$attrs), isRouterLink && routerTag !== 'a' && routerTag !== 'area' ? {} : {
        rel: rel,
        target: target
      }), {}, {
        tabindex: disabled ? '-1' : isUndefined(this.$attrs.tabindex) ? null : this.$attrs.tabindex,
        'aria-disabled': disabled ? 'true' : null
      }),
      props: this.computedProps
    }; // Add the event handlers. We must use `nativeOn` for
    // `<router-link>`/`<nuxt-link>` instead of `on`

    componentData[isRouterLink ? 'nativeOn' : 'on'] = _objectSpread(_objectSpread({}, this.$listeners), {}, {
      // We want to overwrite any click handler since our callback
      // will invoke the user supplied handler(s) if `!this.disabled`
      click: this.onClick
    }); // If href attribute exists on <router-link> (even undefined or null) it fails working on
    // SSR, so we explicitly add it here if needed (i.e. if computedHref() is truthy)

    if (href) {
      componentData.attrs.href = href;
    } else {
      // Ensure the prop HREF does not exist for router links
      delete componentData.props.href;
    }

    return h(tag, componentData, this.normalizeSlot('default'));
  }
});