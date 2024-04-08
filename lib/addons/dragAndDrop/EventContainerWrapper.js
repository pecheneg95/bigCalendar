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
var _reactDom = require('react-dom')
var _Selection = _interopRequireWildcard(require('../../Selection'))
var _TimeGridEvent = _interopRequireDefault(require('../../TimeGridEvent'))
var _common = require('./common')
var _NoopWrapper = _interopRequireDefault(require('../../NoopWrapper'))
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
const pointInColumn = (bounds, _ref) => {
  let { x, y } = _ref
  const { left, right, top } = bounds
  return x < right + 10 && x > left && y > top
}
const propTypes = process.env.NODE_ENV !== 'production' ? {} : {}
class EventContainerWrapper extends _react.default.Component {
  constructor() {
    super(...arguments)
    this.handleMove = (point, boundaryBox) => {
      const { event } = this.context.draggable.dragAndDropAction
      const { accessors, slotMetrics } = this.props
      if (!pointInColumn(boundaryBox, point)) {
        this.reset()
        return
      }
      let currentSlot = slotMetrics.closestSlotFromPoint(
        {
          y: point.y - this.eventOffsetTop,
          x: point.x,
        },
        boundaryBox
      )
      let eventStart = accessors.start(event)
      let eventEnd = accessors.end(event)
      let end = dates.add(
        currentSlot,
        dates.diff(eventStart, eventEnd, 'minutes'),
        'minutes'
      )
      this.update(event, slotMetrics.getRange(currentSlot, end, false, true))
    }
    this.handleDropFromOutside = (point, boundaryBox) => {
      const { slotMetrics, resource } = this.props
      let start = slotMetrics.closestSlotFromPoint(
        {
          y: point.y,
          x: point.x,
        },
        boundaryBox
      )
      this.context.draggable.onDropFromOutside({
        start,
        end: slotMetrics.nextSlot(start),
        allDay: false,
        resource,
      })
    }
    this._selectable = () => {
      let node = (0, _reactDom.findDOMNode)(this)
      let isBeingDragged = false
      let selector = (this._selector = new _Selection.default(() =>
        node.closest('.rbc-time-view')
      ))
      selector.on('beforeSelect', point => {
        const { dragAndDropAction } = this.context.draggable
        if (!dragAndDropAction.action) return false
        if (dragAndDropAction.action === 'resize') {
          return pointInColumn((0, _Selection.getBoundsForNode)(node), point)
        }
        const eventNode = (0, _Selection.getEventNodeFromPoint)(node, point)
        if (!eventNode) return false
        this.eventOffsetTop =
          point.y - (0, _Selection.getBoundsForNode)(eventNode).top
      })
      selector.on('selecting', box => {
        const bounds = (0, _Selection.getBoundsForNode)(node)
        const { dragAndDropAction } = this.context.draggable
        if (dragAndDropAction.action === 'move') this.handleMove(box, bounds)
        if (dragAndDropAction.action === 'resize')
          this.handleResize(box, bounds)
      })
      selector.on('dropFromOutside', point => {
        if (!this.context.draggable.onDropFromOutside) return
        const bounds = (0, _Selection.getBoundsForNode)(node)
        if (!pointInColumn(bounds, point)) return
        this.handleDropFromOutside(point, bounds)
      })
      selector.on('dragOver', point => {
        if (!this.context.draggable.dragFromOutsideItem) return
        const bounds = (0, _Selection.getBoundsForNode)(node)
        this.handleDropFromOutside(point, bounds)
      })
      selector.on('selectStart', () => {
        isBeingDragged = true
        this.context.draggable.onStart()
      })
      selector.on('select', point => {
        const bounds = (0, _Selection.getBoundsForNode)(node)
        isBeingDragged = false
        if (!this.state.event || !pointInColumn(bounds, point)) return
        this.handleInteractionEnd()
      })
      selector.on('click', () => {
        if (isBeingDragged) this.reset()
        this.context.draggable.onEnd(null)
      })
      selector.on('reset', () => {
        this.reset()
        this.context.draggable.onEnd(null)
      })
    }
    this.handleInteractionEnd = () => {
      const { resource } = this.props
      const { event } = this.state
      this.reset()
      this.context.draggable.onEnd({
        start: event.start,
        end: event.end,
        resourceId: resource,
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
    if (this.state.event)
      this.setState({
        event: null,
        top: null,
        height: null,
      })
  }
  update(event, _ref2) {
    let { startDate, endDate, top, height } = _ref2
    const { event: lastEvent } = this.state
    if (
      lastEvent &&
      startDate === lastEvent.start &&
      endDate === lastEvent.end
    ) {
      return
    }
    this.setState({
      top,
      height,
      event: (0, _extends2.default)({}, event, {
        start: startDate,
        end: endDate,
      }),
    })
  }
  handleResize(point, boundaryBox) {
    let start, end
    const { accessors, slotMetrics } = this.props
    const { event, direction } = this.context.draggable.dragAndDropAction
    let currentSlot = slotMetrics.closestSlotFromPoint(point, boundaryBox)
    if (direction === 'UP') {
      end = accessors.end(event)
      start = dates.min(currentSlot, slotMetrics.closestSlotFromDate(end, -1))
    } else if (direction === 'DOWN') {
      start = accessors.start(event)
      end = dates.max(currentSlot, slotMetrics.closestSlotFromDate(start))
    }
    this.update(event, slotMetrics.getRange(start, end))
  }
  render() {
    const {
      children,
      accessors,
      components,
      getters,
      slotMetrics,
      localizer,
    } = this.props
    let { event, top, height } = this.state
    if (!event) return children
    const events = children.props.children
    const { start, end } = event
    let label
    let format = 'eventTimeRangeFormat'
    const startsBeforeDay = slotMetrics.startsBeforeDay(start)
    const startsAfterDay = slotMetrics.startsAfterDay(end)
    if (startsBeforeDay) format = 'eventTimeRangeEndFormat'
    else if (startsAfterDay) format = 'eventTimeRangeStartFormat'
    if (startsBeforeDay && startsAfterDay) label = localizer.messages.allDay
    else
      label = localizer.format(
        {
          start,
          end,
        },
        format
      )
    return /*#__PURE__*/ _react.default.cloneElement(children, {
      children: /*#__PURE__*/ _react.default.createElement(
        _react.default.Fragment,
        null,
        events,
        event &&
          /*#__PURE__*/ _react.default.createElement(_TimeGridEvent.default, {
            event: event,
            label: label,
            className: 'rbc-addons-dnd-drag-preview',
            style: {
              top,
              height,
              width: 100,
            },
            getters: getters,
            components: (0, _extends2.default)({}, components, {
              eventWrapper: _NoopWrapper.default,
            }),
            accessors: (0, _extends2.default)(
              {},
              accessors,
              _common.dragAccessors
            ),
            continuesEarlier: startsBeforeDay,
            continuesLater: startsAfterDay,
          })
      ),
    })
  }
}
EventContainerWrapper.contextTypes = {
  draggable: _propTypes.default.shape({
    onStart: _propTypes.default.func,
    onEnd: _propTypes.default.func,
    onDropFromOutside: _propTypes.default.func,
    onBeginAction: _propTypes.default.func,
    dragAndDropAction: _propTypes.default.object,
    dragFromOutsideItem: _propTypes.default.func,
  }),
}
EventContainerWrapper.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        accessors: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object.isRequired,
        localizer: _propTypes.default.object.isRequired,
        slotMetrics: _propTypes.default.object.isRequired,
        resource: _propTypes.default.any,
      }
    : {}
EventContainerWrapper.propTypes =
  process.env.NODE_ENV !== 'production' ? propTypes : {}
var _default = EventContainerWrapper
exports.default = _default
module.exports = exports.default
