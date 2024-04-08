'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireWildcard(require('react'))
var _addClass = _interopRequireDefault(require('dom-helpers/addClass'))
var _removeClass = _interopRequireDefault(require('dom-helpers/removeClass'))
var _width = _interopRequireDefault(require('dom-helpers/width'))
var _scrollbarSize = _interopRequireDefault(
  require('dom-helpers/scrollbarSize')
)
var dates = _interopRequireWildcard(require('./utils/dates'))
var _constants = require('./utils/constants')
var _eventLevels = require('./utils/eventLevels')
var _selection = require('./utils/selection')
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
function Agenda(_ref) {
  let {
    selected,
    getters,
    accessors,
    localizer,
    components,
    length,
    date,
    events,
  } = _ref
  const headerRef = (0, _react.useRef)(null)
  const dateColRef = (0, _react.useRef)(null)
  const timeColRef = (0, _react.useRef)(null)
  const contentRef = (0, _react.useRef)(null)
  const tbodyRef = (0, _react.useRef)(null)
  ;(0, _react.useEffect)(() => {
    _adjustHeader()
  })
  const renderDay = (day, events, dayKey) => {
    const { event: Event, date: AgendaDate } = components
    events = events.filter(e =>
      (0, _eventLevels.inRange)(
        e,
        dates.startOf(day, 'day'),
        dates.endOf(day, 'day'),
        accessors
      )
    )
    return events.map((event, idx) => {
      let title = accessors.title(event)
      let end = accessors.end(event)
      let start = accessors.start(event)
      const userProps = getters.eventProp(
        event,
        start,
        end,
        (0, _selection.isSelected)(event, selected)
      )
      let dateLabel = idx === 0 && localizer.format(day, 'agendaDateFormat')
      let first =
        idx === 0
          ? /*#__PURE__*/ _react.default.createElement(
              'td',
              {
                rowSpan: events.length,
                className: 'rbc-agenda-date-cell',
              },
              AgendaDate
                ? /*#__PURE__*/ _react.default.createElement(AgendaDate, {
                    day: day,
                    label: dateLabel,
                  })
                : dateLabel
            )
          : false
      return /*#__PURE__*/ _react.default.createElement(
        'tr',
        {
          key: dayKey + '_' + idx,
          className: userProps.className,
          style: userProps.style,
        },
        first,
        /*#__PURE__*/ _react.default.createElement(
          'td',
          {
            className: 'rbc-agenda-time-cell',
          },
          timeRangeLabel(day, event)
        ),
        /*#__PURE__*/ _react.default.createElement(
          'td',
          {
            className: 'rbc-agenda-event-cell',
          },
          Event
            ? /*#__PURE__*/ _react.default.createElement(Event, {
                event: event,
                title: title,
              })
            : title
        )
      )
    }, [])
  }
  const timeRangeLabel = (day, event) => {
    let labelClass = '',
      TimeComponent = components.time,
      label = localizer.messages.allDay
    let end = accessors.end(event)
    let start = accessors.start(event)
    if (!accessors.allDay(event)) {
      if (dates.eq(start, end)) {
        label = localizer.format(start, 'agendaTimeFormat')
      } else if (dates.eq(start, end, 'day')) {
        label = localizer.format(
          {
            start,
            end,
          },
          'agendaTimeRangeFormat'
        )
      } else if (dates.eq(day, start, 'day')) {
        label = localizer.format(start, 'agendaTimeFormat')
      } else if (dates.eq(day, end, 'day')) {
        label = localizer.format(end, 'agendaTimeFormat')
      }
    }
    if (dates.gt(day, start, 'day')) labelClass = 'rbc-continues-prior'
    if (dates.lt(day, end, 'day')) labelClass += ' rbc-continues-after'
    return /*#__PURE__*/ _react.default.createElement(
      'span',
      {
        className: labelClass.trim(),
      },
      TimeComponent
        ? /*#__PURE__*/ _react.default.createElement(TimeComponent, {
            event: event,
            day: day,
            label: label,
          })
        : label
    )
  }
  const _adjustHeader = () => {
    if (!tbodyRef.current) return
    let header = headerRef.current
    let firstRow = tbodyRef.current.firstChild
    if (!firstRow) return
    let isOverflowing =
      contentRef.current.scrollHeight > contentRef.current.clientHeight
    let _widths = []
    let widths = _widths
    _widths = [
      (0, _width.default)(firstRow.children[0]),
      (0, _width.default)(firstRow.children[1]),
    ]
    if (widths[0] !== _widths[0] || widths[1] !== _widths[1]) {
      dateColRef.current.style.width = _widths[0] + 'px'
      timeColRef.current.style.width = _widths[1] + 'px'
    }
    if (isOverflowing) {
      ;(0, _addClass.default)(header, 'rbc-header-overflowing')
      header.style.marginRight = (0, _scrollbarSize.default)() + 'px'
    } else {
      ;(0, _removeClass.default)(header, 'rbc-header-overflowing')
    }
  }
  let { messages } = localizer
  let end = dates.add(date, length, 'day')
  let range = dates.range(date, end, 'day')
  events = events.filter(event =>
    (0, _eventLevels.inRange)(event, date, end, accessors)
  )
  events.sort((a, b) => +accessors.start(a) - +accessors.start(b))
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      className: 'rbc-agenda-view',
    },
    events.length !== 0
      ? /*#__PURE__*/ _react.default.createElement(
          _react.default.Fragment,
          null,
          /*#__PURE__*/ _react.default.createElement(
            'table',
            {
              ref: headerRef,
              className: 'rbc-agenda-table',
            },
            /*#__PURE__*/ _react.default.createElement(
              'thead',
              null,
              /*#__PURE__*/ _react.default.createElement(
                'tr',
                null,
                /*#__PURE__*/ _react.default.createElement(
                  'th',
                  {
                    className: 'rbc-header',
                    ref: dateColRef,
                  },
                  messages.date
                ),
                /*#__PURE__*/ _react.default.createElement(
                  'th',
                  {
                    className: 'rbc-header',
                    ref: timeColRef,
                  },
                  messages.time
                ),
                /*#__PURE__*/ _react.default.createElement(
                  'th',
                  {
                    className: 'rbc-header',
                  },
                  messages.event
                )
              )
            )
          ),
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-agenda-content',
              ref: contentRef,
            },
            /*#__PURE__*/ _react.default.createElement(
              'table',
              {
                className: 'rbc-agenda-table',
              },
              /*#__PURE__*/ _react.default.createElement(
                'tbody',
                {
                  ref: tbodyRef,
                },
                range.map((day, idx) => renderDay(day, events, idx))
              )
            )
          )
        )
      : /*#__PURE__*/ _react.default.createElement(
          'span',
          {
            className: 'rbc-agenda-empty',
          },
          messages.noEventsInRange
        )
  )
}
Agenda.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        events: _propTypes.default.array,
        date: _propTypes.default.instanceOf(Date),
        length: _propTypes.default.number.isRequired,
        selected: _propTypes.default.object,
        accessors: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object.isRequired,
        localizer: _propTypes.default.object.isRequired,
      }
    : {}
Agenda.defaultProps = {
  length: 30,
}
Agenda.range = (start, _ref2) => {
  let { length = Agenda.defaultProps.length } = _ref2
  let end = dates.add(start, length, 'day')
  return {
    start,
    end,
  }
}
Agenda.navigate = (date, action, _ref3) => {
  let { length = Agenda.defaultProps.length } = _ref3
  switch (action) {
    case _constants.navigate.PREVIOUS:
      return dates.add(date, -length, 'day')
    case _constants.navigate.NEXT:
      return dates.add(date, length, 'day')
    default:
      return date
  }
}
Agenda.title = (start, _ref4) => {
  let { length = Agenda.defaultProps.length, localizer } = _ref4
  let end = dates.add(start, length, 'day')
  return localizer.format(
    {
      start,
      end,
    },
    'agendaHeaderFormat'
  )
}
var _default = Agenda
exports.default = _default
module.exports = exports.default
