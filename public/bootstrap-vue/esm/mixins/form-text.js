import { attemptBlur, attemptFocus } from '../utils/dom';
import { isFunction } from '../utils/inspect';
import { mathMax } from '../utils/math';
import { toInteger, toFloat } from '../utils/number';
import { toString } from '../utils/string'; // @vue/component

export default {
  model: {
    prop: 'value',
    event: 'update'
  },
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    ariaInvalid: {
      type: [Boolean, String],
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    plaintext: {
      type: Boolean,
      default: false
    },
    autocomplete: {
      type: String // default: null

    },
    placeholder: {
      type: String // default: null

    },
    formatter: {
      type: Function // default: null

    },
    lazyFormatter: {
      type: Boolean,
      default: false
    },
    trim: {
      type: Boolean,
      default: false
    },
    number: {
      type: Boolean,
      default: false
    },
    lazy: {
      // Only update the `v-model` on blur/change events
      type: Boolean,
      default: false
    },
    debounce: {
      // Debounce timeout (in ms). Not applicable with `lazy` prop
      type: [Number, String],
      default: 0
    }
  },
  data: function data() {
    return {
      localValue: toString(this.value),
      vModelValue: this.value
    };
  },
  computed: {
    computedClass: function computedClass() {
      return [{
        // Range input needs class `custom-range`
        'custom-range': this.type === 'range',
        // `plaintext` not supported by `type="range"` or `type="color"`
        'form-control-plaintext': this.plaintext && this.type !== 'range' && this.type !== 'color',
        // `form-control` not used by `type="range"` or `plaintext`
        // Always used by `type="color"`
        'form-control': !this.plaintext && this.type !== 'range' || this.type === 'color'
      }, this.sizeFormClass, this.stateClass];
    },
    computedAriaInvalid: function computedAriaInvalid() {
      if (!this.ariaInvalid || this.ariaInvalid === 'false') {
        // `this.ariaInvalid` is `null` or `false` or 'false'
        return this.computedState === false ? 'true' : null;
      }

      if (this.ariaInvalid === true) {
        // User wants explicit `:aria-invalid="true"`
        return 'true';
      } // Most likely a string value (which could be the string 'true')


      return this.ariaInvalid;
    },
    computedDebounce: function computedDebounce() {
      // Ensure we have a positive number equal to or greater than 0
      return mathMax(toInteger(this.debounce, 0), 0);
    },
    hasFormatter: function hasFormatter() {
      return isFunction(this.formatter);
    }
  },
  watch: {
    value: function value(newVal) {
      var stringifyValue = toString(newVal);

      if (stringifyValue !== this.localValue && newVal !== this.vModelValue) {
        // Clear any pending debounce timeout, as we are overwriting the user input
        this.clearDebounce(); // Update the local values

        this.localValue = stringifyValue;
        this.vModelValue = newVal;
      }
    }
  },
  mounted: function mounted() {
    // Create non-reactive property and set up destroy handler
    this.$_inputDebounceTimer = null;
    this.$on('hook:beforeDestroy', this.clearDebounce); // Preset the internal state

    var value = this.value;
    var stringifyValue = toString(value);
    /* istanbul ignore next */

    if (stringifyValue !== this.localValue && value !== this.vModelValue) {
      this.localValue = stringifyValue;
      this.vModelValue = value;
    }
  },
  methods: {
    clearDebounce: function clearDebounce() {
      clearTimeout(this.$_inputDebounceTimer);
      this.$_inputDebounceTimer = null;
    },
    formatValue: function formatValue(value, evt) {
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      value = toString(value);

      if (this.hasFormatter && (!this.lazyFormatter || force)) {
        value = this.formatter(value, evt);
      }

      return value;
    },
    modifyValue: function modifyValue(value) {
      // Emulate `.trim` modifier behaviour
      if (this.trim) {
        value = value.trim();
      } // Emulate `.number` modifier behaviour


      if (this.number) {
        value = toFloat(value, value);
      }

      return value;
    },
    updateValue: function updateValue(value) {
      var _this = this;

      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var lazy = this.lazy;

      if (lazy && !force) {
        return;
      }

      value = this.modifyValue(value);

      if (value !== this.vModelValue) {
        this.clearDebounce();

        var doUpdate = function doUpdate() {
          _this.vModelValue = value;

          _this.$emit('update', value);
        };

        var debounce = this.computedDebounce; // Only debounce the value update when a value greater than `0`
        // is set and we are not in lazy mode or this is a forced update

        if (debounce > 0 && !lazy && !force) {
          this.$_inputDebounceTimer = setTimeout(doUpdate, debounce);
        } else {
          // Immediately update the v-model
          doUpdate();
        }
      } else if (this.hasFormatter) {
        // When the `vModelValue` hasn't changed but the actual input value
        // is out of sync, make sure to change it to the given one
        // Usually caused by browser autocomplete and how it triggers the
        // change or input event, or depending on the formatter function
        // https://github.com/bootstrap-vue/bootstrap-vue/issues/2657
        // https://github.com/bootstrap-vue/bootstrap-vue/issues/3498

        /* istanbul ignore next: hard to test */
        var $input = this.$refs.input;
        /* istanbul ignore if: hard to test out of sync value */

        if ($input && value !== $input.value) {
          $input.value = value;
        }
      }
    },
    onInput: function onInput(evt) {
      // `evt.target.composing` is set by Vue
      // https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/directives/model.js
      // TODO: Is this needed now with the latest Vue?

      /* istanbul ignore if: hard to test composition events */
      if (evt.target.composing) {
        return;
      }

      var value = evt.target.value;
      var formattedValue = this.formatValue(value, evt); // Exit when the `formatter` function strictly returned `false`
      // or prevented the input event

      /* istanbul ignore next */

      if (formattedValue === false || evt.defaultPrevented) {
        evt.preventDefault();
        return;
      }

      this.localValue = formattedValue;
      this.updateValue(formattedValue);
      this.$emit('input', formattedValue);
    },
    onChange: function onChange(evt) {
      var value = evt.target.value;
      var formattedValue = this.formatValue(value, evt); // Exit when the `formatter` function strictly returned `false`
      // or prevented the input event

      /* istanbul ignore next */

      if (formattedValue === false || evt.defaultPrevented) {
        evt.preventDefault();
        return;
      }

      this.localValue = formattedValue;
      this.updateValue(formattedValue, true);
      this.$emit('change', formattedValue);
    },
    onBlur: function onBlur(evt) {
      // Apply the `localValue` on blur to prevent cursor jumps
      // on mobile browsers (e.g. caused by autocomplete)
      var value = evt.target.value;
      var formattedValue = this.formatValue(value, evt, true);

      if (formattedValue !== false) {
        // We need to use the modified value here to apply the
        // `.trim` and `.number` modifiers properly
        this.localValue = toString(this.modifyValue(formattedValue)); // We pass the formatted value here since the `updateValue` method
        // handles the modifiers itself

        this.updateValue(formattedValue, true);
      } // Emit native blur event


      this.$emit('blur', evt);
    },
    focus: function focus() {
      // For external handler that may want a focus method
      if (!this.disabled) {
        attemptFocus(this.$el);
      }
    },
    blur: function blur() {
      // For external handler that may want a blur method
      if (!this.disabled) {
        attemptBlur(this.$el);
      }
    }
  }
};