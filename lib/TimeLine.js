'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _propTypes = _interopRequireDefault(require('prop-types'))
var _clsx = _interopRequireDefault(require('clsx'))
var animationFrame = _interopRequireWildcard(
  require('dom-helpers/animationFrame')
)
var _react = _interopRequireWildcard(require('react'))
var _reactDom = require('react-dom')
var _memoizeOne = _interopRequireDefault(require('memoize-one'))
var dates = _interopRequireWildcard(require('./utils/dates'))
var _DayColumnHr = _interopRequireDefault(require('./DayColumnHr'))
var _TimeGutterHr = _interopRequireDefault(require('./TimeGutterHr'))
var _width = _interopRequireDefault(require('dom-helpers/width'))
var _TimeGridHeaderHr = _interopRequireDefault(require('./TimeGridHeaderHr'))
var _helpers = require('./utils/helpers')
var _eventLevels = require('./utils/eventLevels')
var _Resources = _interopRequireDefault(require('./utils/Resources'))
var _propTypes2 = require('./utils/propTypes')
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
class TimeLine extends _react.Component {
  constructor(props) {
    var _this
    super(props)
    _this = this
    this.handleScroll = e => {
      if (this.scrollRef.current) {
        this.scrollRef.current.scrollLeft = e.target.scrollLeft
      }
    }
    this.handleResize = () => {
      animationFrame.cancel(this.rafHandle)
      this.rafHandle = animationFrame.request(this.checkOverflow)
    }
    this.gutterRef = ref => {
      this.gutter = ref && (0, _reactDom.findDOMNode)(ref)
    }
    this.handleSelectAlldayEvent = function() {
      //cancel any pending selections so only the event click goes through.
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
    this.handleSelectAllDaySlot = (slots, slotInfo) => {
      const { onSelectSlot } = this.props
      ;(0, _helpers.notify)(onSelectSlot, {
        slots,
        start: slots[0],
        end: slots[slots.length - 1],
        action: slotInfo.action,
        resourceId: slotInfo.resourceId,
      })
    }
    this.checkOverflow = () => {
      if (this._updatingOverflow) return
      const content = this.contentRef.current
      let isOverflowing = content.scrollHeight > content.clientHeight
      if (this.state.isOverflowing !== isOverflowing) {
        this._updatingOverflow = true
        this.setState(
          {
            isOverflowing,
          },
          () => {
            this._updatingOverflow = false
          }
        )
      }
    }
    this.memoizedResources = (0, _memoizeOne.default)((resources, accessors) =>
      (0, _Resources.default)(resources, accessors)
    )
    this.state = {
      gutterWidth: undefined,
      isOverflowing: null,
    }
    this.scrollRef = /*#__PURE__*/ _react.default.createRef()
    this.contentRef = /*#__PURE__*/ _react.default.createRef()
    this._scrollRatio = null
  }
  UNSAFE_componentWillMount() {
    this.calculateScroll()
  }
  componentDidMount() {
    this.checkOverflow()
    if (this.props.width == null) {
      this.measureGutter()
    }
    this.applyScroll()
    window.addEventListener('resize', this.handleResize)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    animationFrame.cancel(this.rafHandle)
    if (this.measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest)
    }
  }
  componentDidUpdate() {
    if (this.props.width == null) {
      this.measureGutter()
    }
    this.applyScroll()
    //this.checkOverflow()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { range, scrollToTime } = this.props
    // When paginating, reset scroll
    if (
      !dates.eq(nextProps.range[0], range[0], 'minute') ||
      !dates.eq(nextProps.scrollToTime, scrollToTime, 'minute')
    ) {
      this.calculateScroll(nextProps)
    }
  }
  renderEvents(range, events, alldayEvents, now) {
    let {
      min,
      max,
      components,
      accessors,
      localizer,
      dayLayoutAlgorithm,
      getNow,
      selectable,
    } = this.props
    const resources = this.memoizedResources(this.props.resources, accessors)
    const groupedEvents = resources.groupEvents(events)
    return resources.map((_ref, i) => {
      let [id, resource] = _ref
      return range.map((date, jj) => {
        let daysEvents = (groupedEvents.get(id) || []).filter(event =>
          dates.inRange(
            date,
            accessors.start(event),
            accessors.end(event),
            'day'
          )
        )
        return /*#__PURE__*/ _react.default.createElement(
          _DayColumnHr.default,
          (0, _extends2.default)({}, this.props, {
            localizer: localizer,
            id: id,
            min: dates.merge(date, min),
            max: dates.merge(date, max),
            resource: resource && id,
            resources: this.memoizedResources(resources, accessors),
            components: components,
            isNow: dates.eq(date, now, 'day'),
            key: i + '-' + jj,
            date: date,
            alldayEvents: alldayEvents,
            range: range,
            events: daysEvents,
            getNow: getNow,
            selectable: selectable,
            dayLayoutAlgorithm: dayLayoutAlgorithm,
          })
        )
      })
    })
  }
  render() {
    let {
      events,
      range,
      width,
      rtl,
      selected,
      getNow,
      resources,
      components,
      accessors,
      getters,
      localizer,
      min,
      max,
      showMultiDayTimes,
      longPressThreshold,
    } = this.props
    width = width || this.state.gutterWidth
    let start = range[0],
      end = range[range.length - 1]
    this.slots = range.length
    let allDayEvents = [],
      rangeEvents = []
    events.forEach(event => {
      if ((0, _eventLevels.inRange)(event, start, end, accessors)) {
        let eStart = accessors.start(event),
          eEnd = accessors.end(event)
        if (
          accessors.allDay(event) ||
          (dates.isJustDate(eStart) && dates.isJustDate(eEnd)) ||
          (!showMultiDayTimes && !dates.eq(eStart, eEnd, 'day'))
        ) {
          allDayEvents.push(event)
        } else {
          rangeEvents.push(event)
        }
      }
    })
    allDayEvents.sort((a, b) => (0, _eventLevels.sortEvents)(a, b, accessors))
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: (0, _clsx.default)(
          'rbc-time-view',
          resources && 'rbc-time-view-resources rbc-time-view-resources--hr'
        ),
      },
      /*#__PURE__*/ _react.default.createElement(_TimeGridHeaderHr.default, {
        range: range,
        events: allDayEvents,
        width: width,
        rtl: rtl,
        getNow: getNow,
        localizer: localizer,
        selected: selected,
        resources: this.memoizedResources(resources, accessors),
        selectable: this.props.selectable,
        accessors: accessors,
        getters: getters,
        components: components,
        scrollRef: this.scrollRef,
        isOverflowing: this.state.isOverflowing,
        longPressThreshold: longPressThreshold,
        onSelectSlot: this.handleSelectAllDaySlot,
        onSelectEvent: this.handleSelectAlldayEvent,
        onDoubleClickEvent: this.props.onDoubleClickEvent,
        onKeyPressEvent: this.props.onKeyPressEvent,
        onDrillDown: this.props.onDrillDown,
        getDrilldownView: this.props.getDrilldownView,
      }),
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          ref: this.contentRef,
          className: 'rbc-time-content rbc-time-content--hr',
          onScroll: this.handleScroll,
        },
        /*#__PURE__*/ _react.default.createElement(_TimeGutterHr.default, {
          date: start,
          ref: this.gutterRef,
          localizer: localizer,
          min: dates.merge(start, min),
          max: dates.merge(start, max),
          step: this.props.step,
          getNow: this.props.getNow,
          timeslots: this.props.timeslots,
          components: components,
          className: 'rbc-time-gutter',
          getters: getters,
        }),
        /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-time-grid--hr',
          },
          this.renderEvents(range, rangeEvents, allDayEvents, getNow())
        )
      )
    )
  }
  clearSelection() {
    clearTimeout(this._selectTimer)
    this._pendingSelection = []
  }
  measureGutter() {
    if (this.measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest)
    }
    this.measureGutterAnimationFrameRequest = window.requestAnimationFrame(
      () => {
        const width = (0, _width.default)(this.gutter)
        if (width && this.state.gutterWidth !== width) {
          this.setState({
            gutterWidth: width,
          })
        }
      }
    )
  }
  applyScroll() {
    if (this._scrollRatio != null) {
      const content = this.contentRef.current
      content.scrollTop = content.scrollHeight * this._scrollRatio
      // Only do this once
      this._scrollRatio = null
    }
  }
  calculateScroll(props) {
    if (props === void 0) {
      props = this.props
    }
    const { min, max, scrollToTime } = props
    const diffMillis = scrollToTime - dates.startOf(scrollToTime, 'day')
    const totalMillis = dates.diff(max, min)
    this._scrollRatio = diffMillis / totalMillis
  }
}
exports.default = TimeLine
TimeLine.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        events: _propTypes.default.array.isRequired,
        resources: _propTypes.default.array,
        step: _propTypes.default.number,
        timeslots: _propTypes.default.number,
        range: _propTypes.default.arrayOf(_propTypes.default.instanceOf(Date)),
        min: _propTypes.default.instanceOf(Date),
        max: _propTypes.default.instanceOf(Date),
        getNow: _propTypes.default.func.isRequired,
        scrollToTime: _propTypes.default.instanceOf(Date),
        showMultiDayTimes: _propTypes.default.bool,
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
        onSelectEnd: _propTypes.default.func,
        onSelectStart: _propTypes.default.func,
        onSelectEvent: _propTypes.default.func,
        onDoubleClickEvent: _propTypes.default.func,
        onKeyPressEvent: _propTypes.default.func,
        onDrillDown: _propTypes.default.func,
        getDrilldownView: _propTypes.default.func.isRequired,
        dayLayoutAlgorithm: _propTypes2.DayLayoutAlgorithmPropType,
      }
    : {}
TimeLine.defaultProps = {
  step: 30,
  timeslots: 2,
  min: dates.startOf(new Date(), 'day'),
  max: dates.endOf(new Date(), 'day'),
  scrollToTime: dates.startOf(new Date(), 'day'),
}
module.exports = exports.default
