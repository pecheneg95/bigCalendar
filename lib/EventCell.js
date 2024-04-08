'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectWithoutPropertiesLoose')
)
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireDefault(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var dates = _interopRequireWildcard(require('./utils/dates'))
const _excluded = [
  'style',
  'className',
  'event',
  'selected',
  'isAllDay',
  'onSelect',
  'onDoubleClick',
  'onKeyPress',
  'localizer',
  'continuesPrior',
  'continuesAfter',
  'accessors',
  'getters',
  'children',
  'components',
  'slotStart',
  'slotEnd',
]
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== 'function') return null
  var cacheBabelInterop = new WeakMap()
  var cacheNodeInterop = new WeakMap()
  return (_getRequireWildcardCache = function(nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop
  })(nodeInterop)
}
function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj }
  }
  var cache = _getRequireWildcardCache(nodeInterop)
  if (cache && cache.has(obj)) {
    return cache.get(obj)
  }
  var newObj = {}
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor
  for (var key in obj) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc)
      } else {
        newObj[key] = obj[key]
      }
    }
  }
  newObj.default = obj
  if (cache) {
    cache.set(obj, newObj)
  }
  return newObj
}
class EventCell extends _react.default.Component {
  render() {
    let _this$props = this.props,
      {
        style,
        className,
        event,
        selected,
        isAllDay,
        onSelect,
        onDoubleClick,
        onKeyPress,
        localizer,
        continuesPrior,
        continuesAfter,
        accessors,
        getters,
        children,
        components: { event: Event, eventWrapper: EventWrapper },
        slotStart,
        slotEnd,
      } = _this$props,
      props = (0, _objectWithoutPropertiesLoose2.default)(
        _this$props,
        _excluded
      )
    let title = accessors.title(event)
    let tooltip = accessors.tooltip(event)
    let end = accessors.end(event)
    let start = accessors.start(event)
    let allDay = accessors.allDay(event)
    let showAsAllDay =
      isAllDay || allDay || dates.diff(start, dates.ceil(end, 'day'), 'day') > 1
    let userProps = getters.eventProp(event, start, end, selected)
    const content = /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: 'rbc-event-content',
        title: tooltip || undefined,
      },
      Event
        ? /*#__PURE__*/ _react.default.createElement(Event, {
            event: event,
            continuesPrior: continuesPrior,
            continuesAfter: continuesAfter,
            title: title,
            isAllDay: allDay,
            localizer: localizer,
            slotStart: slotStart,
            slotEnd: slotEnd,
          })
        : title
    )
    return /*#__PURE__*/ _react.default.createElement(
      EventWrapper,
      (0, _extends2.default)({}, this.props, {
        type: 'date',
      }),
      /*#__PURE__*/ _react.default.createElement(
        'div',
        (0, _extends2.default)({}, props, {
          tabIndex: 0,
          style: (0, _extends2.default)({}, userProps.style, style),
          className: (0, _clsx.default)(
            'rbc-event',
            className,
            userProps.className,
            {
              'rbc-selected': selected,
              'rbc-event-allday': showAsAllDay,
              'rbc-event-continues-prior': continuesPrior,
              'rbc-event-continues-after': continuesAfter,
            }
          ),
          onClick: e => onSelect && onSelect(event, e),
          onDoubleClick: e => onDoubleClick && onDoubleClick(event, e),
          onKeyPress: e => onKeyPress && onKeyPress(event, e),
        }),
        typeof children === 'function' ? children(content) : content
      )
    )
  }
}
EventCell.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        event: _propTypes.default.object.isRequired,
        slotStart: _propTypes.default.instanceOf(Date),
        slotEnd: _propTypes.default.instanceOf(Date),
        selected: _propTypes.default.bool,
        isAllDay: _propTypes.default.bool,
        continuesPrior: _propTypes.default.bool,
        continuesAfter: _propTypes.default.bool,
        accessors: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object.isRequired,
        localizer: _propTypes.default.object,
        onSelect: _propTypes.default.func,
        onDoubleClick: _propTypes.default.func,
        onKeyPress: _propTypes.default.func,
      }
    : {}
var _default = EventCell
exports.default = _default
module.exports = exports.default
