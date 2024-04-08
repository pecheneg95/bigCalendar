'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireDefault(require('react'))
var dates = _interopRequireWildcard(require('../../utils/dates'))
var _selection = require('../../utils/selection')
var _reactDom = require('react-dom')
var _clsx = _interopRequireDefault(require('clsx'))
var _eventLevels = require('../../utils/eventLevels')
var _Selection = _interopRequireWildcard(require('../../Selection'))
var _EventRow = _interopRequireDefault(require('../../EventRow'))
var _common = require('./common')
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
const propTypes = process.env.NODE_ENV !== 'production' ? {} : {}
const eventTimes = (event, accessors) => {
  let start = accessors.start(event)
  let end = accessors.end(event)
  const isZeroDuration =
    dates.eq(start, end, 'minutes') && start.getMinutes() === 0
  // make zero duration midnight events at least one day long
  if (isZeroDuration) end = dates.add(end, 1, 'day')
  return {
    start,
    end,
  }
}
class WeekWrapper extends _react.default.Component {
  constructor() {
    super(...arguments)
    this.handleMove = (_ref, node, draggedEvent) => {
      let { x, y } = _ref
      const { event = draggedEvent } = this.context.draggable.dragAndDropAction
      const metrics = this.props.slotMetrics
      const { accessors, isTimeline } = this.props
      if (!event) return
      if (
        isTimeline &&
        !(0, _eventLevels.isEventRelatedToResource)(
          event,
          this.props.resourceId
        )
      ) {
        this.reset()
        return
      }
      let rowBox = (0, _Selection.getBoundsForNode)(node)
      if (
        !(0, _selection.pointInBox)(rowBox, {
          x,
          y,
        })
      ) {
        this.reset()
        return
      }

      // Make sure to maintain the time of the start date while moving it to the new slot
      let start = dates.merge(
        metrics.getDateForSlot(
          (0, _selection.getSlotAtX)(rowBox, x, false, metrics.slots)
        ),
        accessors.start(event)
      )
      let end = dates.add(
        start,
        dates.diff(accessors.start(event), accessors.end(event), 'minutes'),
        'minutes'
      )
      this.update(event, start, end)
    }
    this.handleDropFromOutside = (point, rowBox) => {
      if (!this.context.draggable.onDropFromOutside) return
      const { slotMetrics: metrics } = this.props
      let start = metrics.getDateForSlot(
        (0, _selection.getSlotAtX)(rowBox, point.x, false, metrics.slots)
      )
      this.context.draggable.onDropFromOutside({
        start,
        end: dates.add(start, 1, 'day'),
        allDay: false,
      })
    }
    this.handleDragOverFromOutside = (_ref2, node) => {
      let { x, y } = _ref2
      if (!this.context.draggable.dragFromOutsideItem) return
      this.handleMove(
        {
          x,
          y,
        },
        node,
        this.context.draggable.dragFromOutsideItem()
      )
    }
    this._selectable = () => {
      const { isTimeline } = this.props
      let node = (0, _reactDom.findDOMNode)(this).closest(
        '.rbc-month-row, .rbc-allday-cell'
      )
      let container = node.closest(
        '.rbc-month-view, ' +
          (isTimeline ? '.rbc-time-grid--hr' : '.rbc-time-view')
      )
      let selector = (this._selector = new _Selection.default(() => container))
      selector.on('beforeSelect', point => {
        const { isAllDay } = this.props
        const { action } = this.context.draggable.dragAndDropAction
        return (
          action === 'move' ||
          (action === 'resize' &&
            (!isAllDay ||
              (0, _selection.pointInBox)(
                (0, _Selection.getBoundsForNode)(node),
                point
              )))
        )
      })
      selector.on('selecting', box => {
        const bounds = (0, _Selection.getBoundsForNode)(node)
        const { dragAndDropAction } = this.context.draggable
        if (dragAndDropAction.action === 'move') this.handleMove(box, bounds)
        if (dragAndDropAction.action === 'resize')
          this.handleResize(box, bounds)
      })
      selector.on('selectStart', () => this.context.draggable.onStart())
      selector.on('select', point => {
        const bounds = (0, _Selection.getBoundsForNode)(node)
        if (!this.state.segment || !(0, _selection.pointInBox)(bounds, point))
          return
        this.handleInteractionEnd()
      })
      selector.on('dropFromOutside', point => {
        if (!this.context.draggable.onDropFromOutside) return
        const bounds = (0, _Selection.getBoundsForNode)(node)
        if (!(0, _selection.pointInBox)(bounds, point)) return
        this.handleDropFromOutside(point, bounds)
      })
      selector.on('dragOverFromOutside', point => {
        if (!this.context.draggable.dragFromOutsideItem) return
        const bounds = (0, _Selection.getBoundsForNode)(node)
        this.handleDragOverFromOutside(point, bounds)
      })
      selector.on('click', () => this.context.draggable.onEnd(null))
      selector.on('reset', () => {
        this.reset()
        this.context.draggable.onEnd(null)
      })
    }
    this.handleInteractionEnd = () => {
      const { resourceId, isAllDay } = this.props
      const { event } = this.state.segment
      this.reset()
      this.context.draggable.onEnd({
        start: event.start,
        end: event.end,
        resourceId,
        isAllDay,
      })
    }
    this._teardownSelectable = () => {
      if (!this._selector) return
      this._selector.teardown()
      this._selector = null
    }
    this.state = {}
  }
  componentDidMount() {
    this._selectable()
  }
  componentWillUnmount() {
    this._teardownSelectable()
  }
  reset() {
    if (this.state.segment)
      this.setState({
        segment: null,
      })
  }
  update(event, start, end) {
    const { isTimeline } = this.props
    const newEventPreview = (0, _extends2.default)({}, event, {
      end,
      start,
      __isPreview: true,
    })
    if (isTimeline) {
      newEventPreview.allDay = true
    }
    const segment = (0, _eventLevels.eventSegments)(
      newEventPreview,
      this.props.slotMetrics.range,
      _common.dragAccessors
    )
    const { segment: lastSegment } = this.state
    if (
      lastSegment &&
      segment.span === lastSegment.span &&
      segment.left === lastSegment.left &&
      segment.right === lastSegment.right
    ) {
      return
    }
    this.setState({
      segment,
    })
  }
  handleResize(point, node) {
    const { event, direction } = this.context.draggable.dragAndDropAction
    const { accessors, slotMetrics: metrics } = this.props
    let { start, end } = eventTimes(event, accessors)
    let rowBox = (0, _Selection.getBoundsForNode)(node)
    let cursorInRow = (0, _selection.pointInBox)(rowBox, point)
    if (direction === 'RIGHT') {
      if (cursorInRow) {
        if (metrics.last < start) return this.reset()
        // add min
        end = dates.add(
          metrics.getDateForSlot(
            (0, _selection.getSlotAtX)(rowBox, point.x, false, metrics.slots)
          ),
          1,
          'day'
        )
      } else if (
        dates.inRange(start, metrics.first, metrics.last) ||
        (rowBox.bottom < point.y && +metrics.first > +start)
      ) {
        end = dates.add(metrics.last, 1, 'milliseconds')
      } else {
        this.setState({
          segment: null,
        })
        return
      }
      end = dates.max(end, dates.add(start, 1, 'day'))
    } else if (direction === 'LEFT') {
      // inbetween Row
      if (cursorInRow) {
        if (metrics.first > end) return this.reset()
        start = metrics.getDateForSlot(
          (0, _selection.getSlotAtX)(rowBox, point.x, false, metrics.slots)
        )
      } else if (
        dates.inRange(end, metrics.first, metrics.last) ||
        (rowBox.top > point.y && +metrics.last < +end)
      ) {
        start = dates.add(metrics.first, -1, 'milliseconds')
      } else {
        this.reset()
        return
      }
      start = dates.min(dates.add(end, -1, 'day'), start)
    }
    this.update(event, start, end)
  }
  render() {
    const { children, accessors, isTimeline } = this.props
    const boxClassName = (0, _clsx.default)(
      'rbc-addons-dnd-row-body',
      isTimeline && 'rbc-addons-dnd-row-body--timeline'
    )
    let { segment } = this.state
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: boxClassName,
      },
      children,
      segment &&
        /*#__PURE__*/ _react.default.createElement(
          _EventRow.default,
          (0, _extends2.default)({}, this.props, {
            selected: null,
            className: 'rbc-addons-dnd-drag-row',
            segments: [segment],
            accessors: (0, _extends2.default)(
              {},
              accessors,
              _common.dragAccessors
            ),
          })
        )
    )
  }
}
WeekWrapper.contextTypes = {
  draggable: _propTypes.default.shape({
    onStart: _propTypes.default.func,
    onEnd: _propTypes.default.func,
    dragAndDropAction: _propTypes.default.object,
    onDropFromOutside: _propTypes.default.func,
    onBeginAction: _propTypes.default.func,
    dragFromOutsideItem: _propTypes.default.func,
  }),
}
WeekWrapper.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        isAllDay: _propTypes.default.bool,
        slotMetrics: _propTypes.default.object.isRequired,
        accessors: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        resourceId: _propTypes.default.any,
        isTimeline: _propTypes.default.bool,
      }
    : {}
WeekWrapper.propTypes = process.env.NODE_ENV !== 'production' ? propTypes : {}
var _default = WeekWrapper
exports.default = _default
module.exports = exports.default
