'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _clsx = _interopRequireDefault(require('clsx'))
var _height = _interopRequireDefault(require('dom-helpers/height'))
var _querySelectorAll = _interopRequireDefault(
  require('dom-helpers/querySelectorAll')
)
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireDefault(require('react'))
var _reactDom = require('react-dom')
var dates = _interopRequireWildcard(require('./utils/dates'))
var _BackgroundCells = _interopRequireDefault(require('./BackgroundCells'))
var _EventRow = _interopRequireDefault(require('./EventRow'))
var _EventEndingRow = _interopRequireDefault(require('./EventEndingRow'))
var DateSlotMetrics = _interopRequireWildcard(
  require('./utils/DateSlotMetrics')
)
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
class DateContentRow extends _react.default.Component {
  constructor() {
    super(...arguments)
    this.handleSelectSlot = slot => {
      const { range, onSelectSlot } = this.props
      onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
    }
    this.handleShowMore = (slot, target) => {
      const { range, onShowMore } = this.props
      let metrics = this.slotMetrics(this.props)
      let row = (0, _querySelectorAll.default)(
        (0, _reactDom.findDOMNode)(this),
        '.rbc-row-bg'
      )[0]
      let cell
      if (row) cell = row.children[slot - 1]
      let events = metrics.getEventsForSlot(slot)
      onShowMore(events, range[slot - 1], cell, slot, target)
    }
    this.createHeadingRef = r => {
      this.headingRow = r
    }
    this.createEventRef = r => {
      this.eventRow = r
    }
    this.getContainer = () => {
      const { container } = this.props
      return container ? container() : (0, _reactDom.findDOMNode)(this)
    }
    this.renderHeadingCell = (date, index) => {
      let { renderHeader, getNow } = this.props
      return renderHeader({
        date,
        key: 'header_' + index,
        className: (0, _clsx.default)(
          'rbc-date-cell',
          dates.eq(date, getNow(), 'day') && 'rbc-now'
        ),
      })
    }
    this.renderDummy = () => {
      let { className, range, renderHeader } = this.props
      return /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: className,
        },
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-row-content',
          },
          renderHeader &&
            /*#__PURE__*/ _react.default.createElement(
              'div',
              {
                className: 'rbc-row',
                ref: this.createHeadingRef,
              },
              range.map(this.renderHeadingCell)
            ),
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-row',
              ref: this.createEventRef,
            },
            /*#__PURE__*/ _react.default.createElement(
              'div',
              {
                className: 'rbc-row-segment',
              },
              /*#__PURE__*/ _react.default.createElement(
                'div',
                {
                  className: 'rbc-event',
                },
                /*#__PURE__*/ _react.default.createElement(
                  'div',
                  {
                    className: 'rbc-event-content',
                  },
                  '\xA0'
                )
              )
            )
          )
        )
      )
    }
    this.slotMetrics = DateSlotMetrics.getSlotMetrics()
  }
  getRowLimit() {
    let eventHeight = (0, _height.default)(this.eventRow)
    let headingHeight = this.headingRow
      ? (0, _height.default)(this.headingRow)
      : 0
    let eventSpace =
      (0, _height.default)((0, _reactDom.findDOMNode)(this)) - headingHeight
    return Math.max(Math.floor(eventSpace / eventHeight), 1)
  }
  render() {
    const {
      date,
      rtl,
      range,
      className,
      selected,
      selectable,
      renderForMeasure,
      accessors,
      getters,
      components,
      getNow,
      renderHeader,
      onSelect,
      localizer,
      onSelectStart,
      onSelectEnd,
      onDoubleClick,
      onKeyPress,
      resourceId,
      longPressThreshold,
      isAllDay,
      isTimeline,
    } = this.props
    if (renderForMeasure) return this.renderDummy()
    let metrics = this.slotMetrics(this.props)
    let { levels, extra } = metrics
    let WeekWrapper = components.weekWrapper
    const eventRowProps = {
      selected,
      accessors,
      getters,
      localizer,
      components,
      onSelect,
      onDoubleClick,
      onKeyPress,
      resourceId,
      slotMetrics: metrics,
    }
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: className,
      },
      /*#__PURE__*/ _react.default.createElement(_BackgroundCells.default, {
        date: date,
        getNow: getNow,
        rtl: rtl,
        range: range,
        selectable: selectable,
        container: this.getContainer,
        getters: getters,
        onSelectStart: onSelectStart,
        onSelectEnd: onSelectEnd,
        onSelectSlot: this.handleSelectSlot,
        components: components,
        longPressThreshold: longPressThreshold,
        resourceId: resourceId,
      }),
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: 'rbc-row-content',
        },
        renderHeader &&
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className: 'rbc-row ',
              ref: this.createHeadingRef,
            },
            range.map(this.renderHeadingCell)
          ),
        /*#__PURE__*/ _react.default.createElement(
          WeekWrapper,
          (0, _extends2.default)(
            {
              isAllDay: isAllDay,
              isTimeline: isTimeline,
            },
            eventRowProps
          ),
          levels.map((segs, idx) =>
            /*#__PURE__*/ _react.default.createElement(
              _EventRow.default,
              (0, _extends2.default)(
                {
                  key: idx,
                  segments: segs,
                },
                eventRowProps
              )
            )
          ),
          !!extra.length &&
            /*#__PURE__*/ _react.default.createElement(
              _EventEndingRow.default,
              (0, _extends2.default)(
                {
                  segments: extra,
                  onShowMore: this.handleShowMore,
                },
                eventRowProps
              )
            )
        )
      )
    )
  }
}
DateContentRow.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        date: _propTypes.default.instanceOf(Date),
        events: _propTypes.default.array.isRequired,
        range: _propTypes.default.array.isRequired,
        rtl: _propTypes.default.bool,
        resourceId: _propTypes.default.any,
        renderForMeasure: _propTypes.default.bool,
        renderHeader: _propTypes.default.func,
        container: _propTypes.default.func,
        selected: _propTypes.default.object,
        selectable: _propTypes.default.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: _propTypes.default.number,
        onShowMore: _propTypes.default.func,
        onSelectSlot: _propTypes.default.func,
        onSelect: _propTypes.default.func,
        onSelectEnd: _propTypes.default.func,
        onSelectStart: _propTypes.default.func,
        onDoubleClick: _propTypes.default.func,
        onKeyPress: _propTypes.default.func,
        dayPropGetter: _propTypes.default.func,
        getNow: _propTypes.default.func.isRequired,
        isAllDay: _propTypes.default.bool,
        isTimeline: _propTypes.default.bool,
        accessors: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object.isRequired,
        localizer: _propTypes.default.object.isRequired,
        minRows: _propTypes.default.number.isRequired,
        maxRows: _propTypes.default.number.isRequired,
      }
    : {}
DateContentRow.defaultProps = {
  minRows: 0,
  maxRows: Infinity,
  isTimeline: false,
}
var _default = DateContentRow
exports.default = _default
module.exports = exports.default
