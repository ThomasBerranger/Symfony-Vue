import { contains } from '../utils/dom';
import { EVENT_OPTIONS_NO_CAPTURE, eventOn, eventOff } from '../utils/events'; // @vue/component

export default {
  data: function data() {
    return {
      listenForClickOut: false
    };
  },
  watch: {
    listenForClickOut: function listenForClickOut(newValue, oldValue) {
      if (newValue !== oldValue) {
        eventOff(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, EVENT_OPTIONS_NO_CAPTURE);

        if (newValue) {
          eventOn(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, EVENT_OPTIONS_NO_CAPTURE);
        }
      }
    }
  },
  beforeCreate: function beforeCreate() {
    // Declare non-reactive properties
    this.clickOutElement = null;
    this.clickOutEventName = null;
  },
  mounted: function mounted() {
    if (!this.clickOutElement) {
      this.clickOutElement = document;
    }

    if (!this.clickOutEventName) {
      this.clickOutEventName = 'click';
    }

    if (this.listenForClickOut) {
      eventOn(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, EVENT_OPTIONS_NO_CAPTURE);
    }
  },
  beforeDestroy: function beforeDestroy()
  /* istanbul ignore next */
  {
    eventOff(this.clickOutElement, this.clickOutEventName, this._clickOutHandler, EVENT_OPTIONS_NO_CAPTURE);
  },
  methods: {
    isClickOut: function isClickOut(evt) {
      return !contains(this.$el, evt.target);
    },
    _clickOutHandler: function _clickOutHandler(evt) {
      if (this.clickOutHandler && this.isClickOut(evt)) {
        this.clickOutHandler(evt);
      }
    }
  }
};