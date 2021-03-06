import Vue from '../../utils/vue';
import { mergeData } from 'vue-functional-data-merge';
export var props = {
  id: {
    type: String // default: null

  },
  tag: {
    type: String,
    default: 'div'
  },
  tooltip: {
    type: Boolean,
    default: false
  },
  forceShow: {
    type: Boolean,
    default: false
  },
  state: {
    // Tri-state prop: `true`, `false`, or `null`
    type: Boolean,
    default: null
  },
  ariaLive: {
    type: String // default: null

  },
  role: {
    type: String // default: null

  }
}; // @vue/component

export var BFormValidFeedback = /*#__PURE__*/Vue.extend({
  name: 'BFormValidFeedback',
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;
    var show = props.forceShow === true || props.state === true;
    return h(props.tag, mergeData(data, {
      class: {
        'valid-feedback': !props.tooltip,
        'valid-tooltip': props.tooltip,
        'd-block': show
      },
      attrs: {
        id: props.id || null,
        role: props.role || null,
        'aria-live': props.ariaLive || null,
        'aria-atomic': props.ariaLive ? 'true' : null
      }
    }), children);
  }
});