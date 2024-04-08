'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _clsx = _interopRequireDefault(require('clsx'))
var _react = _interopRequireDefault(require('react'))
function stringifyPercent(v) {
  return typeof v === 'string' ? v : v + '%'
}

/* eslint-disable react/prop-types */
function TimelineEvent(props) {
  const {
    style,
    className,
    event,
    accessors,
    selected,
    label,
    continuesEarlier,
    continuesLater,
    getters,
    onClick,
    onDoubleClick,
    onKeyPress,
    components: { event: Event, timelineEventWrapper: TimelineEventWrapper },
  } = props
  let title = accessors.title(event)
  let tooltip = accessors.tooltip(event)
  let end = accessors.end(event)
  let start = accessors.start(event)
  let userProps = getters.eventProp(event, start, end, selected)
  let { top, height } = style
  const inner = [
    /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        key: '1',
        className: 'rbc-event-label',
      },
      label
    ),
    /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        key: '2',
        className: 'rbc-event-content',
      },
      Event
        ? /*#__PURE__*/ _react.default.createElement(Event, {
            event: event,
            title: title,
          })
        : title
    ),
  ]
  return /*#__PURE__*/ _react.default.createElement(
    TimelineEventWrapper,
    (0, _extends2.default)(
      {
        type: 'time',
      },
      props
    ),
    /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        onClick: onClick,
        onDoubleClick: onDoubleClick,
        onKeyPress: onKeyPress,
        style: (0, _extends2.default)({}, userProps.style, {
          top: '2rem',
          left: stringifyPercent(top),
          width: stringifyPercent(height),
        }),
        title: tooltip
          ? (typeof label === 'string' ? label + ': ' : '') + tooltip
          : undefined,
        className: (0, _clsx.default)(
          'rbc-event',
          'rbc-event--hr',
          className,
          userProps.className,
          {
            'rbc-selected': selected,
            'rbc-event-continues-earlier': continuesEarlier,
            'rbc-event-continues-later': continuesLater,
          }
        ),
      },
      inner
    )
  )
}
var _default = TimelineEvent
exports.default = _default
module.exports = exports.default
