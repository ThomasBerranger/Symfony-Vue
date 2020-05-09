function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Vue from '../../utils/vue';
import normalizeSlotMixin from '../../mixins/normalize-slot';
export var props = {
  footVariant: {
    type: String,
    // supported values: 'lite', 'dark', or null
    default: null
  }
}; // TODO:
//   In Bootstrap v5, we won't need "sniffing" as table element variants properly inherit
//   to the child elements, so this can be converted to a functional component
// @vue/component

export var BTfoot = /*#__PURE__*/Vue.extend({
  name: 'BTfoot',
  mixins: [normalizeSlotMixin],
  inheritAttrs: false,
  provide: function provide() {
    return {
      bvTableRowGroup: this
    };
  },
  inject: {
    bvTable: {
      // Sniffed by <b-tr> / <b-td> / <b-th>

      /* istanbul ignore next */
      default: function _default()
      /* istanbul ignore next */
      {
        return {};
      }
    }
  },
  props: props,
  computed: {
    isTfoot: function isTfoot() {
      // Sniffed by <b-tr> / <b-td> / <b-th>
      return true;
    },
    isDark: function isDark() {
      // Sniffed by <b-tr> / <b-td> / <b-th>
      return this.bvTable.dark;
    },
    isStacked: function isStacked() {
      // Sniffed by <b-tr> / <b-td> / <b-th>
      return this.bvTable.isStacked;
    },
    isResponsive: function isResponsive() {
      // Sniffed by <b-tr> / <b-td> / <b-th>
      return this.bvTable.isResponsive;
    },
    isStickyHeader: function isStickyHeader() {
      // Sniffed by <b-tr> / <b-td> / <b-th>
      // Sticky headers are only supported in thead
      return false;
    },
    hasStickyHeader: function hasStickyHeader() {
      // Sniffed by <b-tr> / <b-td> / <b-th>
      // Needed to handle header background classes, due to lack of
      // background color inheritance with Bootstrap v4 table CSS
      return !this.isStacked && this.bvTable.stickyHeader;
    },
    tableVariant: function tableVariant() {
      // Sniffed by <b-tr> / <b-td> / <b-th>
      return this.bvTable.tableVariant;
    },
    tfootClasses: function tfootClasses() {
      return [this.footVariant ? "thead-".concat(this.footVariant) : null];
    },
    tfootAttrs: function tfootAttrs() {
      return _objectSpread({
        role: 'rowgroup'
      }, this.$attrs);
    }
  },
  render: function render(h) {
    return h('tfoot', {
      class: this.tfootClasses,
      attrs: this.tfootAttrs,
      // Pass down any native listeners
      on: this.$listeners
    }, this.normalizeSlot('default'));
  }
});