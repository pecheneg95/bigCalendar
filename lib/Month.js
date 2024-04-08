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
var _reactDom = require('react-dom')
var _clsx = _interopRequireDefault(require('clsx'))
var dates = _interopRequireWildcard(require('./utils/dates'))
var _chunk = _interopRequireDefault(require('lodash/chunk'))
var _constants = require('./utils/constants')
var _helpers = require('./utils/helpers')
var _position = _interopRequireDefault(require('dom-helpers/position'))
var animationFrame = _interopRequireWildcard(
  require('dom-helpers/animationFrame')
)
var _Popup = _interopRequireDefault(require('./Popup'))
var _Overlay = _interopRequireDefault(require('react-overlays/Overlay'))
var _DateContentRow = _interopRequireDefault(require('./DateContentRow'))
var _Header = _interopRequireDefault(require('./Header'))
var _DateHeader = _interopRequireDefault(require('./DateHeader'))
var _eventLevels = require('./utils/eventLevels')
const _excluded = ['date', 'className']
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
let eventsForWeek = (evts, start, end, accessors) =>
  evts.filter(e => (0, _eventLevels.inRange)(e, start, end, accessors))
class MonthView extends _react.default.Component {
  constructor() {
    var _this
    super(...arguments)
    _this = this
    this.getContainer = () => {
      return (0, _reactDom.findDOMNode)(this)
    }
    this.renderWeek = (week, weekIdx) => {
      let {
        events,
        components,
        selectable,
        getNow,
        selected,
        date,
        localizer,
        longPressThreshold,
        accessors,
        getters,
      } = this.props
      const { needLimitMeasure, rowLimit } = this.state
      events = eventsForWeek(events, week[0], week[week.length - 1], accessors)
      events.sort((a, b) => (0, _eventLevels.sortEvents)(a, b, accessors))
      return /*#__PURE__*/ _react.default.createElement(
        _DateContentRow.default,
        {
          key: weekIdx,
          ref: weekIdx === 0 ? this.slotRowRef : undefined,
          container: this.getContainer,
          className: 'rbc-month-row',
          getNow: getNow,
          date: date,
          range: week,
          events: events,
          maxRows: rowLimit,
          selected: selected,
          selectable: selectable,
          components: components,
          accessors: accessors,
          getters: getters,
          localizer: localizer,
          renderHeader: this.readerDateHeading,
          renderForMeasure: needLimitMeasure,
          onShowMore: this.handleShowMore,
          onSelect: this.handleSelectEvent,
          onDoubleClick: this.handleDoubleClickEvent,
          onKeyPress: this.handleKeyPressEvent,
          onSelectSlot: this.handleSelectSlot,
          longPressThreshold: longPressThreshold,
          rtl: this.props.rtl,
        }
      )
    }
    this.readerDateHeading = _ref => {
      let { date, className } = _ref,
        props = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded)
      let { date: currentDate, getDrilldownView, localizer } = this.props
      let isOffRange = dates.month(date) !== dates.month(currentDate)
      let isCurrent = dates.eq(date, currentDate, 'day')
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, 'dateFormat')
      let DateHeaderComponent =
        this.props.components.dateHeader || _DateHeader.default
      return /*#__PURE__*/ _react.default.createElement(
        'div',
        (0, _extends2.default)({}, props, {
          className: (0, _clsx.default)(
            className,
            isOffRange && 'rbc-off-range',
            isCurrent && 'rbc-current'
          ),
        }),
        /*#__PURE__*/ _react.default.createElement(DateHeaderComponent, {
          label: label,
          date: date,
          drilldownView: drilldownView,
          isOffRange: isOffRange,
          onDrillDown: e => this.handleHeadingClick(date, drilldownView, e),
        })
      )
    }
    this.handleSelectSlot = (range, slotInfo) => {
      this._pendingSelection = this._pendingSelection.concat(range)
      clearTimeout(this._selectTimer)
      this._selectTimer = setTimeout(() => this.selectDates(slotInfo))
    }
    this.handleHeadingClick = (date, view, e) => {
      e.preventDefault()
      this.clearSelection()
      ;(0, _helpers.notify)(this.props.onDrillDown, [date, view])
    }
    this.handleSelectEvent = function() {
      _this.clearSelection()
      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }
      ;(0, _helpers.notify)(_this.props.onSelectEvent, args)
    }
    this.handleDoubleClickEvent = function() {
      _this.clearSelection()
      for (
        var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2] = arguments[_key2]
      }
      ;(0, _helpers.notify)(_this.props.onDoubleClickEvent, args)
    }
    this.handleKeyPressEvent = function() {
      _this.clearSelection()
      for (
        var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3]
      }
      ;(0, _helpers.notify)(_this.props.onKeyPressEvent, args)
    }
    this.handleShowMore = (events, date, cell, slot, target) => {
      const { popup, onDrillDown, onShowMore, getDrilldownView } = this.props
      //cancel any pending selections so only the event click goes through.
      this.clearSelection()
      if (popup) {
        let position = (0, _position.default)(
          cell,
          (0, _reactDom.findDOMNode)(this)
        )
        this.setState({
          overlay: {
            date,
            events,
            position,
            target,
          },
        })
      } else {
        ;(0, _helpers.notify)(onDrillDown, [
          date,
          getDrilldownView(date) || _constants.views.DAY,
        ])
      }
      ;(0, _helpers.notify)(onShowMore, [events, date, slot])
    }
    this.overlayDisplay = () => {
      this.setState({
        overlay: null,
      })
    }
    this._bgRows = []
    this._pendingSelection = []
    this.slotRowRef = /*#__PURE__*/ _react.default.createRef()
    this.state = {
      rowLimit: 5,
      needLimitMeasure: true,
    }
  }
  UNSAFE_componentWillReceiveProps(_ref2) {
    let { date } = _ref2
    this.setState({
      needLimitMeasure: !dates.eq(date, this.props.date, 'month'),
    })
  }
  componentDidMount() {
    let running
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props)
    window.addEventListener(
      'resize',
      (this._resizeListener = () => {
        if (!running) {
          animationFrame.request(() => {
            running = false
            this.setState({
              needLimitMeasure: true,
            }) //eslint-disable-line
          })
        }
      }),
      false
    )
  }
  componentDidUpdate() {
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeListener, false)
  }
  render() {
    let { date, localizer, className } = this.props,
      month = dates.visibleDays(date, localizer),
      weeks = (0, _chunk.default)(month, 7)
    this._weekCount = weeks.length
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: (0, _clsx.default)('rbc-month-view', className),
      },
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: 'rbc-row rbc-month-header',
        },
        this.renderHeaders(weeks[0])
      ),
      weeks.map(this.renderWeek),
      this.props.popup && this.renderOverlay()
    )
  }
  renderHeaders(row) {
    let { localizer, components } = this.props
    let first = row[0]
    let last = row[row.length - 1]
    let HeaderComponent = components.header || _Header.default
    return dates.range(first, last, 'day').map((day, idx) =>
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          key: 'header_' + idx,
          className: 'rbc-header',
        },
        /*#__PURE__*/ _react.default.createElement(HeaderComponent, {
          date: day,
          localizer: localizer,
          label: localizer.format(day, 'weekdayFormat'),
        })
      )
    )
  }
  renderOverlay() {
    let overlay = (this.state && this.state.overlay) || {}
    let {
      accessors,
      localizer,
      components,
      getters,
      selected,
      popupOffset,
    } = this.props
    return /*#__PURE__*/ _react.default.createElement(
      _Overlay.default,
      {
        rootClose: true,
        placement: 'bottom',
        show: !!overlay.position,
        onHide: () =>
          this.setState({
            overlay: null,
          }),
        target: () => overlay.target,
      },
      _ref3 => {
        let { props } = _ref3
        return /*#__PURE__*/ _react.default.createElement(
          _Popup.default,
          (0, _extends2.default)({}, props, {
            popupOffset: popupOffset,
            accessors: accessors,
            getters: getters,
            selected: selected,
            components: components,
            localizer: localizer,
            position: overlay.position,
            show: this.overlayDisplay,
            events: overlay.events,
            slotStart: overlay.date,
            slotEnd: overlay.end,
            onSelect: this.handleSelectEvent,
            onDoubleClick: this.handleDoubleClickEvent,
            onKeyPress: this.handleKeyPressEvent,
            handleDragStart: this.props.handleDragStart,
          })
        )
      }
    )
  }
  measureRowLimit() {
    this.setState({
      needLimitMeasure: false,
      rowLimit: this.slotRowRef.current.getRowLimit(),
    })
  }
  selectDates(slotInfo) {
    let slots = this._pendingSelection.slice()
    this._pendingSelection = []
    slots.sort((a, b) => +a - +b)
    ;(0, _helpers.notify)(this.props.onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
      bounds: slotInfo.bounds,
      box: slotInfo.box,
    })
  }
  clearSelection() {
    clearTimeout(this._selectTimer)
    this._pendingSelection = []
  }
}
MonthView.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        events: _propTypes.default.array.isRequired,
        date: _propTypes.default.instanceOf(Date),
        min: _propTypes.default.instanceOf(Date),
        max: _propTypes.default.instanceOf(Date),
        step: _propTypes.default.number,
        getNow: _propTypes.default.func.isRequired,
        scrollToTime: _propTypes.default.instanceOf(Date),
        rtl: _propTypes.default.bool,
        width: _propTypes.default.number,
        accessors: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object.isRequired,
        localizer: _propTypes.default.object.isRequired,
        selected: _propTypes.default.object,
        selectable: _propTypes.default.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: _propTypes.default.number,
        onNavigate: _propTypes.default.func,
        onSelectSlot: _propTypes.default.func,
        onSelectEvent: _propTypes.default.func,
        onDoubleClickEvent: _propTypes.default.func,
        onKeyPressEvent: _propTypes.default.func,
        onShowMore: _propTypes.default.func,
        onDrillDown: _propTypes.default.func,
        getDrilldownView: _propTypes.default.func.isRequired,
        popup: _propTypes.default.bool,
        handleDragStart: _propTypes.default.func,
        popupOffset: _propTypes.default.oneOfType([
          _propTypes.default.number,
          _propTypes.default.shape({
            x: _propTypes.default.number,
            y: _propTypes.default.number,
          }),
        ]),
      }
    : {}
MonthView.range = (date, _ref4) => {
  let { localizer } = _ref4
  let start = dates.firstVisibleDay(date, localizer)
  let end = dates.lastVisibleDay(date, localizer)
  return {
    start,
    end,
  }
}
MonthView.navigate = (date, action) => {
  switch (action) {
    case _constants.navigate.PREVIOUS:
      return dates.add(date, -1, 'month')
    case _constants.navigate.NEXT:
      return dates.add(date, 1, 'month')
    default:
      return date
  }
}
MonthView.title = (date, _ref5) => {
  let { localizer } = _ref5
  return localizer.format(date, 'monthHeaderFormat')
}
var _default = MonthView
exports.default = _default
module.exports = exports.default
