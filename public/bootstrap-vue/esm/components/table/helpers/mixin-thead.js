function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import identity from '../../../utils/identity';
import KeyCodes from '../../../utils/key-codes';
import startCase from '../../../utils/startcase';
import { getComponentConfig } from '../../../utils/config';
import { htmlOrText } from '../../../utils/html';
import { isUndefinedOrNull } from '../../../utils/inspect';
import filterEvent from './filter-event';
import textSelectionActive from './text-selection-active';
import { BThead } from '../thead';
import { BTfoot } from '../tfoot';
import { BTr } from '../tr';
import { BTh } from '../th';
export default {
  props: {
    headVariant: {
      type: String,
      // 'light', 'dark' or `null` (or custom)
      default: function _default() {
        return getComponentConfig('BTable', 'headVariant');
      }
    },
    headRowVariant: {
      // Any Bootstrap theme variant (or custom)
      type: String // default: null

    },
    theadClass: {
      type: [String, Array, Object] // default: undefined

    },
    theadTrClass: {
      type: [String, Array, Object] // default: undefined

    }
  },
  methods: {
    fieldClasses: function fieldClasses(field) {
      // Header field (<th>) classes
      return [field.class ? field.class : '', field.thClass ? field.thClass : ''];
    },
    headClicked: function headClicked(evt, field, isFoot) {
      if (this.stopIfBusy && this.stopIfBusy(evt)) {
        // If table is busy (via provider) then don't propagate
        return;
      } else if (filterEvent(evt)) {
        // Clicked on a non-disabled control so ignore
        return;
      } else if (textSelectionActive(this.$el)) {
        // User is selecting text, so ignore

        /* istanbul ignore next: JSDOM doesn't support getSelection() */
        return;
      }

      evt.stopPropagation();
      evt.preventDefault();
      this.$emit('head-clicked', field.key, field, evt, isFoot);
    },
    renderThead: function renderThead() {
      var _this = this;

      var isFoot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var h = this.$createElement;
      var fields = this.computedFields || [];

      if (this.isStackedAlways || fields.length === 0) {
        // In always stacked mode, we don't bother rendering the head/foot
        // Or if no field headings (empty table)
        return h();
      } // Reference to `selectAllRows` and `clearSelected()`, if table is selectable


      var selectAllRows = this.isSelectable ? this.selectAllRows : function () {};
      var clearSelected = this.isSelectable ? this.clearSelected : function () {}; // Helper function to generate a field <th> cell

      var makeCell = function makeCell(field, colIndex) {
        var ariaLabel = null;

        if (!field.label.trim() && !field.headerTitle) {
          // In case field's label and title are empty/blank
          // We need to add a hint about what the column is about for non-sighted users

          /* istanbul ignore next */
          ariaLabel = startCase(field.key);
        }

        var hasHeadClickListener = _this.hasListener('head-clicked') || _this.isSortable;

        var handlers = {};

        if (hasHeadClickListener) {
          handlers.click = function (evt) {
            _this.headClicked(evt, field, isFoot);
          };

          handlers.keydown = function (evt) {
            var keyCode = evt.keyCode;

            if (keyCode === KeyCodes.ENTER || keyCode === KeyCodes.SPACE) {
              _this.headClicked(evt, field, isFoot);
            }
          };
        }

        var sortAttrs = _this.isSortable ? _this.sortTheadThAttrs(field.key, field, isFoot) : {};
        var sortClass = _this.isSortable ? _this.sortTheadThClasses(field.key, field, isFoot) : null;
        var sortLabel = _this.isSortable ? _this.sortTheadThLabel(field.key, field, isFoot) : null;
        var data = {
          key: field.key,
          class: [_this.fieldClasses(field), sortClass],
          props: {
            variant: field.variant,
            stickyColumn: field.stickyColumn
          },
          style: field.thStyle || {},
          attrs: _objectSpread(_objectSpread({
            // We only add a tabindex of 0 if there is a head-clicked listener
            tabindex: hasHeadClickListener ? '0' : null,
            abbr: field.headerAbbr || null,
            title: field.headerTitle || null,
            'aria-colindex': colIndex + 1,
            'aria-label': ariaLabel
          }, _this.getThValues(null, field.key, field.thAttr, isFoot ? 'foot' : 'head', {})), sortAttrs),
          on: handlers
        }; // Handle edge case where in-document templates are used with new
        // `v-slot:name` syntax where the browser lower-cases the v-slot's
        // name (attributes become lower cased when parsed by the browser)
        // We have replaced the square bracket syntax with round brackets
        // to prevent confusion with dynamic slot names

        var slotNames = ["head(".concat(field.key, ")"), "head(".concat(field.key.toLowerCase(), ")"), 'head()'];

        if (isFoot) {
          // Footer will fallback to header slot names
          slotNames = ["foot(".concat(field.key, ")"), "foot(".concat(field.key.toLowerCase(), ")"), 'foot()'].concat(_toConsumableArray(slotNames));
        }

        var scope = {
          label: field.label,
          column: field.key,
          field: field,
          isFoot: isFoot,
          // Add in row select methods
          selectAllRows: selectAllRows,
          clearSelected: clearSelected
        };
        var content = _this.normalizeSlot(slotNames, scope) || (field.labelHtml ? h('div', {
          domProps: htmlOrText(field.labelHtml)
        }) : field.label);
        var srLabel = sortLabel ? h('span', {
          staticClass: 'sr-only'
        }, " (".concat(sortLabel, ")")) : null; // Return the header cell

        return h(BTh, data, [content, srLabel].filter(identity));
      }; // Generate the array of <th> cells


      var $cells = fields.map(makeCell).filter(identity); // Generate the row(s)

      var $trs = [];

      if (isFoot) {
        var trProps = {
          variant: isUndefinedOrNull(this.footRowVariant) ? this.headRowVariant :
          /* istanbul ignore next */
          this.footRowVariant
        };
        $trs.push(h(BTr, {
          class: this.tfootTrClass,
          props: trProps
        }, $cells));
      } else {
        var scope = {
          columns: fields.length,
          fields: fields,
          // Add in row select methods
          selectAllRows: selectAllRows,
          clearSelected: clearSelected
        };
        $trs.push(this.normalizeSlot('thead-top', scope) || h());
        $trs.push(h(BTr, {
          class: this.theadTrClass,
          props: {
            variant: this.headRowVariant
          }
        }, $cells));
      }

      return h(isFoot ? BTfoot : BThead, {
        key: isFoot ? 'bv-tfoot' : 'bv-thead',
        class: (isFoot ? this.tfootClass : this.theadClass) || null,
        props: isFoot ? {
          footVariant: this.footVariant || this.headVariant || null
        } : {
          headVariant: this.headVariant || null
        }
      }, $trs);
    }
  }
};