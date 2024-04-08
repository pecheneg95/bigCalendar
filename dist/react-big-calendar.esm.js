import _extends from '@babel/runtime/helpers/esm/extends'
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose'
import PropTypes from 'prop-types'
import React, { Component, useRef, useEffect } from 'react'
import { uncontrollable } from 'uncontrollable'
import clsx from 'clsx'
import invariant from 'invariant'
import { findDOMNode } from 'react-dom'
import {
  eq,
  add,
  startOf,
  endOf,
  lte,
  hours,
  minutes,
  seconds,
  milliseconds,
  lt,
  gte,
  month,
  max,
  min,
  gt,
  inRange as inRange$1,
} from 'date-arithmetic'
import chunk from 'lodash-es/chunk'
import getPosition from 'dom-helpers/position'
import { request, cancel } from 'dom-helpers/animationFrame'
import getOffset from 'dom-helpers/offset'
import getScrollTop from 'dom-helpers/scrollTop'
import getScrollLeft from 'dom-helpers/scrollLeft'
import Overlay from 'react-overlays/Overlay'
import getHeight from 'dom-helpers/height'
import qsa from 'dom-helpers/querySelectorAll'
import contains from 'dom-helpers/contains'
import closest from 'dom-helpers/closest'
import listen from 'dom-helpers/listen'
import findIndex from 'lodash-es/findIndex'
import range$1 from 'lodash-es/range'
import memoize from 'memoize-one'
import sortBy from 'lodash-es/sortBy'
import getWidth from 'dom-helpers/width'
import scrollbarSize from 'dom-helpers/scrollbarSize'
import addClass from 'dom-helpers/addClass'
import removeClass from 'dom-helpers/removeClass'
import omit from 'lodash-es/omit'
import defaults from 'lodash-es/defaults'
import transform from 'lodash-es/transform'
import mapValues from 'lodash-es/mapValues'

function NoopWrapper(props) {
  return props.children
}

let navigate = {
  PREVIOUS: 'PREV',
  NEXT: 'NEXT',
  TODAY: 'TODAY',
  DATE: 'DATE',
}
let views = {
  MONTH: 'month',
  WEEK: 'week',
  WORK_WEEK: 'work_week',
  DAY: 'day',
  AGENDA: 'agenda',
}

let viewNames = Object.keys(views).map(k => views[k])
let accessor = PropTypes.oneOfType([PropTypes.string, PropTypes.func])
let dateFormat = PropTypes.any
let dateRangeFormat = PropTypes.func

/**
 * accepts either an array of builtin view names:
 *
 * ```
 * views={['month', 'day', 'agenda']}
 * ```
 *
 * or an object hash of the view name and the component (or boolean for builtin)
 *
 * ```
 * views={{
 *   month: true,
 *   week: false,
 *   workweek: WorkWeekViewComponent,
 * }}
 * ```
 */

let views$1 = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.oneOf(viewNames)),
  PropTypes.objectOf(function(prop, key) {
    let isBuiltinView =
      viewNames.indexOf(key) !== -1 && typeof prop[key] === 'boolean'
    if (isBuiltinView) {
      return null
    } else {
      for (
        var _len = arguments.length,
          args = new Array(_len > 2 ? _len - 2 : 0),
          _key = 2;
        _key < _len;
        _key++
      ) {
        args[_key - 2] = arguments[_key]
      }
      return PropTypes.elementType(prop, key, ...args)
    }
  }),
])
const DayLayoutAlgorithmPropType = PropTypes.oneOfType([
  PropTypes.oneOf(['overlap', 'no-overlap']),
  PropTypes.func,
])

function notify(handler, args) {
  handler && handler.apply(null, [].concat(args))
}

const localePropType = PropTypes.oneOfType([PropTypes.string, PropTypes.func])
function _format(localizer, formatter, value, format, culture) {
  let result =
    typeof format === 'function'
      ? format(value, culture, localizer)
      : formatter.call(localizer, value, format, culture)
  !(result == null || typeof result === 'string')
    ? process.env.NODE_ENV !== 'production'
      ? invariant(
          false,
          '`localizer format(..)` must return a string, null, or undefined'
        )
      : invariant(false)
    : void 0
  return result
}
class DateLocalizer {
  constructor(spec) {
    var _this = this
    !(typeof spec.format === 'function')
      ? process.env.NODE_ENV !== 'production'
        ? invariant(false, 'date localizer `format(..)` must be a function')
        : invariant(false)
      : void 0
    !(typeof spec.firstOfWeek === 'function')
      ? process.env.NODE_ENV !== 'production'
        ? invariant(
            false,
            'date localizer `firstOfWeek(..)` must be a function'
          )
        : invariant(false)
      : void 0
    this.propType = spec.propType || localePropType
    this.startOfWeek = spec.firstOfWeek
    this.formats = spec.formats
    this.format = function() {
      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }
      return _format(_this, spec.format, ...args)
    }
  }
}
function mergeWithDefaults(localizer, culture, formatOverrides, messages) {
  const formats = _extends({}, localizer.formats, formatOverrides)
  return _extends({}, localizer, {
    messages,
    startOfWeek: () => localizer.startOfWeek(culture),
    format: (value, format) =>
      localizer.format(value, formats[format] || format, culture),
  })
}

let defaultMessages = {
  date: 'Date',
  time: 'Time',
  event: 'Event',
  allDay: 'All Day',
  week: 'Week',
  work_week: 'Work Week',
  day: 'Day',
  month: 'Month',
  previous: 'Back',
  next: 'Next',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  today: 'Today',
  agenda: 'Agenda',
  noEventsInRange: 'There are no events in this range.',
  showMore: total => '+' + total + ' more',
}
function messages(msgs) {
  return _extends({}, defaultMessages, msgs)
}

/* eslint no-fallthrough: off */
const MILLI = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
}
function firstVisibleDay(date, localizer) {
  let firstOfMonth = startOf(date, 'month')
  return startOf(firstOfMonth, 'week', localizer.startOfWeek())
}
function lastVisibleDay(date, localizer) {
  let endOfMonth = endOf(date, 'month')
  return endOf(endOfMonth, 'week', localizer.startOfWeek())
}
function visibleDays(date, localizer) {
  let current = firstVisibleDay(date, localizer),
    last = lastVisibleDay(date, localizer),
    days = []
  while (lte(current, last, 'day')) {
    days.push(current)
    current = add(current, 1, 'day')
  }
  return days
}
function ceil(date, unit) {
  let floor = startOf(date, unit)
  return eq(floor, date) ? floor : add(floor, 1, unit)
}
function range(start, end, unit) {
  if (unit === void 0) {
    unit = 'day'
  }
  let current = start,
    days = []
  while (lte(current, end, unit)) {
    days.push(current)
    current = add(current, 1, unit)
  }
  return days
}
function merge(date, time) {
  if (time == null && date == null) return null
  if (time == null) time = new Date()
  if (date == null) date = new Date()
  date = startOf(date, 'day')
  date = hours(date, hours(time))
  date = minutes(date, minutes(time))
  date = seconds(date, seconds(time))
  return milliseconds(date, milliseconds(time))
}
function isJustDate(date) {
  return (
    hours(date) === 0 &&
    minutes(date) === 0 &&
    seconds(date) === 0 &&
    milliseconds(date) === 0
  )
}
function diff(dateA, dateB, unit) {
  if (!unit || unit === 'milliseconds') return Math.abs(+dateA - +dateB)

  // the .round() handles an edge case
  // with DST where the total won't be exact
  // since one day in the range may be shorter/longer by an hour
  return Math.round(
    Math.abs(
      +startOf(dateA, unit) / MILLI[unit] - +startOf(dateB, unit) / MILLI[unit]
    )
  )
}

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
class EventCell extends React.Component {
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
      props = _objectWithoutPropertiesLoose(_this$props, _excluded)
    let title = accessors.title(event)
    let tooltip = accessors.tooltip(event)
    let end = accessors.end(event)
    let start = accessors.start(event)
    let allDay = accessors.allDay(event)
    let showAsAllDay =
      isAllDay || allDay || diff(start, ceil(end, 'day'), 'day') > 1
    let userProps = getters.eventProp(event, start, end, selected)
    const content = /*#__PURE__*/ React.createElement(
      'div',
      {
        className: 'rbc-event-content',
        title: tooltip || undefined,
      },
      Event
        ? /*#__PURE__*/ React.createElement(Event, {
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
    return /*#__PURE__*/ React.createElement(
      EventWrapper,
      _extends({}, this.props, {
        type: 'date',
      }),
      /*#__PURE__*/ React.createElement(
        'div',
        _extends({}, props, {
          tabIndex: 0,
          style: _extends({}, userProps.style, style),
          className: clsx('rbc-event', className, userProps.className, {
            'rbc-selected': selected,
            'rbc-event-allday': showAsAllDay,
            'rbc-event-continues-prior': continuesPrior,
            'rbc-event-continues-after': continuesAfter,
          }),
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
        event: PropTypes.object.isRequired,
        slotStart: PropTypes.instanceOf(Date),
        slotEnd: PropTypes.instanceOf(Date),
        selected: PropTypes.bool,
        isAllDay: PropTypes.bool,
        continuesPrior: PropTypes.bool,
        continuesAfter: PropTypes.bool,
        accessors: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object.isRequired,
        localizer: PropTypes.object,
        onSelect: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onKeyPress: PropTypes.func,
      }
    : {}

function isSelected(event, selected) {
  if (!event || selected == null) return false
  return [].concat(selected).indexOf(event) !== -1
}
function slotWidth(rowBox, slots) {
  let rowWidth = rowBox.right - rowBox.left
  let cellWidth = rowWidth / slots
  return cellWidth
}
function getSlotAtX(rowBox, x, rtl, slots) {
  const cellWidth = slotWidth(rowBox, slots)
  return rtl
    ? slots - 1 - Math.floor((x - rowBox.left) / cellWidth)
    : Math.floor((x - rowBox.left) / cellWidth)
}
function pointInBox(box, _ref) {
  let { x, y } = _ref
  return y >= box.top && y <= box.bottom && x >= box.left && x <= box.right
}
function dateCellSelection(start, rowBox, box, slots, rtl) {
  let startIdx = -1
  let endIdx = -1
  let lastSlotIdx = slots - 1
  let cellWidth = slotWidth(rowBox, slots)

  // cell under the mouse
  let currentSlot = getSlotAtX(rowBox, box.x, rtl, slots)

  // Identify row as either the initial row
  // or the row under the current mouse point
  let isCurrentRow = rowBox.top < box.y && rowBox.bottom > box.y
  let isStartRow = rowBox.top < start.y && rowBox.bottom > start.y

  // this row's position relative to the start point
  let isAboveStart = start.y > rowBox.bottom
  let isBelowStart = rowBox.top > start.y
  let isBetween = box.top < rowBox.top && box.bottom > rowBox.bottom

  // this row is between the current and start rows, so entirely selected
  if (isBetween) {
    startIdx = 0
    endIdx = lastSlotIdx
  }
  if (isCurrentRow) {
    if (isBelowStart) {
      startIdx = 0
      endIdx = currentSlot
    } else if (isAboveStart) {
      startIdx = currentSlot
      endIdx = lastSlotIdx
    }
  }
  if (isStartRow) {
    // select the cell under the initial point
    startIdx = endIdx = rtl
      ? lastSlotIdx - Math.floor((start.x - rowBox.left) / cellWidth)
      : Math.floor((start.x - rowBox.left) / cellWidth)
    if (isCurrentRow) {
      if (currentSlot < startIdx) startIdx = currentSlot
      else endIdx = currentSlot //select current range
    } else if (start.y < box.y) {
      // the current row is below start row
      // select cells to the right of the start cell
      endIdx = lastSlotIdx
    } else {
      // select cells to the left of the start cell
      startIdx = 0
    }
  }
  return {
    startIdx,
    endIdx,
  }
}

class Popup extends React.Component {
  componentDidMount() {
    let { popupOffset = 5, popperRef } = this.props,
      { top, left, width, height } = getOffset(popperRef.current),
      viewBottom = window.innerHeight + getScrollTop(window),
      viewRight = window.innerWidth + getScrollLeft(window),
      bottom = top + height,
      right = left + width
    if (bottom > viewBottom || right > viewRight) {
      let topOffset, leftOffset
      if (bottom > viewBottom)
        topOffset = bottom - viewBottom + (popupOffset.y || +popupOffset || 0)
      if (right > viewRight)
        leftOffset = right - viewRight + (popupOffset.x || +popupOffset || 0)
      this.setState({
        topOffset,
        leftOffset,
      }) //eslint-disable-line
    }
  }

  render() {
    let {
      events,
      selected,
      getters,
      accessors,
      components,
      onSelect,
      onDoubleClick,
      onKeyPress,
      slotStart,
      slotEnd,
      localizer,
      popperRef,
    } = this.props
    let { width } = this.props.position,
      topOffset = (this.state || {}).topOffset || 0,
      leftOffset = (this.state || {}).leftOffset || 0
    let style = {
      top: -topOffset,
      left: -leftOffset,
      minWidth: width + width / 2,
    }
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        style: _extends({}, this.props.style, style),
        className: 'rbc-overlay',
        ref: popperRef,
      },
      /*#__PURE__*/ React.createElement(
        'div',
        {
          className: 'rbc-overlay-header',
        },
        localizer.format(slotStart, 'dayHeaderFormat')
      ),
      events.map((event, idx) =>
        /*#__PURE__*/ React.createElement(EventCell, {
          key: idx,
          type: 'popup',
          event: event,
          getters: getters,
          onSelect: onSelect,
          accessors: accessors,
          components: components,
          onDoubleClick: onDoubleClick,
          onKeyPress: onKeyPress,
          continuesPrior: lt(accessors.end(event), slotStart, 'day'),
          continuesAfter: gte(accessors.start(event), slotEnd, 'day'),
          slotStart: slotStart,
          slotEnd: slotEnd,
          selected: isSelected(event, selected),
          draggable: true,
          onDragStart: () => this.props.handleDragStart(event),
          onDragEnd: () => this.props.show(),
        })
      )
    )
  }
}
Popup.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        position: PropTypes.object,
        popupOffset: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
          }),
        ]),
        events: PropTypes.array,
        selected: PropTypes.object,
        accessors: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object.isRequired,
        localizer: PropTypes.object.isRequired,
        onSelect: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onKeyPress: PropTypes.func,
        handleDragStart: PropTypes.func,
        show: PropTypes.func,
        slotStart: PropTypes.instanceOf(Date),
        slotEnd: PropTypes.number,
        popperRef: PropTypes.oneOfType([
          PropTypes.func,
          PropTypes.shape({
            current: PropTypes.Element,
          }),
        ]),
      }
    : {}

/**
 * The Overlay component, of react-overlays, creates a ref that is passed to the Popup, and
 * requires proper ref forwarding to be used without error
 */
var Popup$1 = /*#__PURE__*/ React.forwardRef((props, ref) =>
  /*#__PURE__*/ React.createElement(
    Popup,
    _extends(
      {
        popperRef: ref,
      },
      props
    )
  )
)

function addEventListener(type, handler, target) {
  if (target === void 0) {
    target = document
  }
  return listen(target, type, handler, {
    passive: false,
  })
}
function isOverContainer(container, x, y) {
  return !container || contains(container, document.elementFromPoint(x, y))
}
function getEventNodeFromPoint(node, _ref) {
  let { clientX, clientY } = _ref
  let target = document.elementFromPoint(clientX, clientY)
  return closest(target, '.rbc-event', node)
}
function isEvent(node, bounds) {
  return !!getEventNodeFromPoint(node, bounds)
}
function getEventCoordinates(e) {
  let target = e
  if (e.touches && e.touches.length) {
    target = e.touches[0]
  }
  return {
    clientX: target.clientX,
    clientY: target.clientY,
    pageX: target.pageX,
    pageY: target.pageY,
  }
}
const clickTolerance = 5
const clickInterval = 250
class Selection {
  constructor(node, _temp) {
    let { global = false, longPressThreshold = 250 } =
      _temp === void 0 ? {} : _temp
    this.isDetached = false
    this.container = node
    this.globalMouse = !node || global
    this.longPressThreshold = longPressThreshold
    this._listeners = Object.create(null)
    this._handleInitialEvent = this._handleInitialEvent.bind(this)
    this._handleMoveEvent = this._handleMoveEvent.bind(this)
    this._handleTerminatingEvent = this._handleTerminatingEvent.bind(this)
    this._keyListener = this._keyListener.bind(this)
    this._dropFromOutsideListener = this._dropFromOutsideListener.bind(this)
    this._dragOverFromOutsideListener = this._dragOverFromOutsideListener.bind(
      this
    )

    // Fixes an iOS 10 bug where scrolling could not be prevented on the window.
    // https://github.com/metafizzy/flickity/issues/457#issuecomment-254501356
    this._removeTouchMoveWindowListener = addEventListener(
      'touchmove',
      () => {},
      window
    )
    this._removeKeyDownListener = addEventListener('keydown', this._keyListener)
    this._removeKeyUpListener = addEventListener('keyup', this._keyListener)
    this._removeDropFromOutsideListener = addEventListener(
      'drop',
      this._dropFromOutsideListener
    )
    this._onDragOverfromOutisde = addEventListener(
      'dragover',
      this._dragOverFromOutsideListener
    )
    this._addInitialEventListener()
  }
  on(type, handler) {
    let handlers = this._listeners[type] || (this._listeners[type] = [])
    handlers.push(handler)
    return {
      remove() {
        let idx = handlers.indexOf(handler)
        if (idx !== -1) handlers.splice(idx, 1)
      },
    }
  }
  emit(type) {
    for (
      var _len = arguments.length,
        args = new Array(_len > 1 ? _len - 1 : 0),
        _key = 1;
      _key < _len;
      _key++
    ) {
      args[_key - 1] = arguments[_key]
    }
    let result
    let handlers = this._listeners[type] || []
    handlers.forEach(fn => {
      if (result === undefined) result = fn(...args)
    })
    return result
  }
  teardown() {
    this.isDetached = true
    this.listeners = Object.create(null)
    this._removeTouchMoveWindowListener && this._removeTouchMoveWindowListener()
    this._removeInitialEventListener && this._removeInitialEventListener()
    this._removeEndListener && this._removeEndListener()
    this._onEscListener && this._onEscListener()
    this._removeMoveListener && this._removeMoveListener()
    this._removeKeyUpListener && this._removeKeyUpListener()
    this._removeKeyDownListener && this._removeKeyDownListener()
    this._removeDropFromOutsideListener && this._removeDropFromOutsideListener()
  }
  isSelected(node) {
    let box = this._selectRect
    if (!box || !this.selecting) return false
    return objectsCollide(box, getBoundsForNode(node))
  }
  filter(items) {
    let box = this._selectRect

    //not selecting
    if (!box || !this.selecting) return []
    return items.filter(this.isSelected, this)
  }

  // Adds a listener that will call the handler only after the user has pressed on the screen
  // without moving their finger for 250ms.
  _addLongPressListener(handler, initialEvent) {
    let timer = null
    let removeTouchMoveListener = null
    let removeTouchEndListener = null
    const handleTouchStart = initialEvent => {
      timer = setTimeout(() => {
        cleanup()
        handler(initialEvent)
      }, this.longPressThreshold)
      removeTouchMoveListener = addEventListener('touchmove', () => cleanup())
      removeTouchEndListener = addEventListener('touchend', () => cleanup())
    }
    const removeTouchStartListener = addEventListener(
      'touchstart',
      handleTouchStart
    )
    const cleanup = () => {
      if (timer) {
        clearTimeout(timer)
      }
      if (removeTouchMoveListener) {
        removeTouchMoveListener()
      }
      if (removeTouchEndListener) {
        removeTouchEndListener()
      }
      timer = null
      removeTouchMoveListener = null
      removeTouchEndListener = null
    }
    if (initialEvent) {
      handleTouchStart(initialEvent)
    }
    return () => {
      cleanup()
      removeTouchStartListener()
    }
  }

  // Listen for mousedown and touchstart events. When one is received, disable the other and setup
  // future event handling based on the type of event.
  _addInitialEventListener() {
    const removeMouseDownListener = addEventListener('mousedown', e => {
      this._removeInitialEventListener()
      this._handleInitialEvent(e)
      this._removeInitialEventListener = addEventListener(
        'mousedown',
        this._handleInitialEvent
      )
    })
    const removeTouchStartListener = addEventListener('touchstart', e => {
      this._removeInitialEventListener()
      this._removeInitialEventListener = this._addLongPressListener(
        this._handleInitialEvent,
        e
      )
    })
    this._removeInitialEventListener = () => {
      removeMouseDownListener()
      removeTouchStartListener()
    }
  }
  _dropFromOutsideListener(e) {
    const { pageX, pageY, clientX, clientY } = getEventCoordinates(e)
    this.emit('dropFromOutside', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY,
    })
    e.preventDefault()
  }
  _dragOverFromOutsideListener(e) {
    const { pageX, pageY, clientX, clientY } = getEventCoordinates(e)
    this.emit('dragOverFromOutside', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY,
    })
    e.preventDefault()
  }
  _handleInitialEvent(e) {
    if (this.isDetached) {
      return
    }
    const { clientX, clientY, pageX, pageY } = getEventCoordinates(e)
    let node = this.container(),
      collides,
      offsetData

    // Right clicks
    if (
      e.which === 3 ||
      e.button === 2 ||
      !isOverContainer(node, clientX, clientY)
    )
      return
    if (!this.globalMouse && node && !contains(node, e.target)) {
      let { top, left, bottom, right } = normalizeDistance(0)
      offsetData = getBoundsForNode(node)
      collides = objectsCollide(
        {
          top: offsetData.top - top,
          left: offsetData.left - left,
          bottom: offsetData.bottom + bottom,
          right: offsetData.right + right,
        },
        {
          top: pageY,
          left: pageX,
        }
      )
      if (!collides) return
    }
    let result = this.emit(
      'beforeSelect',
      (this._initialEventData = {
        isTouch: /^touch/.test(e.type),
        x: pageX,
        y: pageY,
        clientX,
        clientY,
      })
    )
    if (result === false) return
    switch (e.type) {
      case 'mousedown':
        this._removeEndListener = addEventListener(
          'mouseup',
          this._handleTerminatingEvent
        )
        this._onEscListener = addEventListener(
          'keydown',
          this._handleTerminatingEvent
        )
        this._removeMoveListener = addEventListener(
          'mousemove',
          this._handleMoveEvent
        )
        break
      case 'touchstart':
        this._handleMoveEvent(e)
        this._removeEndListener = addEventListener(
          'touchend',
          this._handleTerminatingEvent
        )
        this._removeMoveListener = addEventListener(
          'touchmove',
          this._handleMoveEvent
        )
        break
    }
  }
  _handleTerminatingEvent(e) {
    const { pageX, pageY } = getEventCoordinates(e)
    this.selecting = false
    this._removeEndListener && this._removeEndListener()
    this._removeMoveListener && this._removeMoveListener()
    if (!this._initialEventData) return
    let inRoot = !this.container || contains(this.container(), e.target)
    let bounds = this._selectRect
    let click = this.isClick(pageX, pageY)
    this._initialEventData = null
    if (e.key === 'Escape') {
      return this.emit('reset')
    }
    if (!inRoot) {
      return this.emit('reset')
    }
    if (click && inRoot) {
      return this._handleClickEvent(e)
    }

    // User drag-clicked in the Selectable area
    if (!click) return this.emit('select', bounds)
  }
  _handleClickEvent(e) {
    const { pageX, pageY, clientX, clientY } = getEventCoordinates(e)
    const now = new Date().getTime()
    if (
      this._lastClickData &&
      now - this._lastClickData.timestamp < clickInterval
    ) {
      // Double click event
      this._lastClickData = null
      return this.emit('doubleClick', {
        x: pageX,
        y: pageY,
        clientX: clientX,
        clientY: clientY,
      })
    }

    // Click event
    this._lastClickData = {
      timestamp: now,
    }
    return this.emit('click', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY,
    })
  }
  _handleMoveEvent(e) {
    if (this._initialEventData === null || this.isDetached) {
      return
    }
    let { x, y } = this._initialEventData
    const { pageX, pageY } = getEventCoordinates(e)
    let w = Math.abs(x - pageX)
    let h = Math.abs(y - pageY)
    let left = Math.min(pageX, x),
      top = Math.min(pageY, y),
      old = this.selecting

    // Prevent emitting selectStart event until mouse is moved.
    // in Chrome on Windows, mouseMove event may be fired just after mouseDown event.
    if (this.isClick(pageX, pageY) && !old && !(w || h)) {
      return
    }
    this.selecting = true
    this._selectRect = {
      top,
      left,
      x: pageX,
      y: pageY,
      right: left + w,
      bottom: top + h,
    }
    if (!old) {
      this.emit('selectStart', this._initialEventData)
    }
    if (!this.isClick(pageX, pageY)) this.emit('selecting', this._selectRect)
    e.preventDefault()
  }
  _keyListener(e) {
    this.ctrl = e.metaKey || e.ctrlKey
  }
  isClick(pageX, pageY) {
    let { x, y, isTouch } = this._initialEventData
    return (
      !isTouch &&
      Math.abs(pageX - x) <= clickTolerance &&
      Math.abs(pageY - y) <= clickTolerance
    )
  }
}

/**
 * Resolve the disance prop from either an Int or an Object
 * @return {Object}
 */
function normalizeDistance(distance) {
  if (distance === void 0) {
    distance = 0
  }
  if (typeof distance !== 'object')
    distance = {
      top: distance,
      left: distance,
      right: distance,
      bottom: distance,
    }
  return distance
}

/**
 * Given two objects containing "top", "left", "offsetWidth" and "offsetHeight"
 * properties, determine if they collide.
 * @param  {Object|HTMLElement} a
 * @param  {Object|HTMLElement} b
 * @return {bool}
 */
function objectsCollide(nodeA, nodeB, tolerance) {
  if (tolerance === void 0) {
    tolerance = 0
  }
  let {
    top: aTop,
    left: aLeft,
    right: aRight = aLeft,
    bottom: aBottom = aTop,
  } = getBoundsForNode(nodeA)
  let {
    top: bTop,
    left: bLeft,
    right: bRight = bLeft,
    bottom: bBottom = bTop,
  } = getBoundsForNode(nodeB)
  return !(
    // 'a' bottom doesn't touch 'b' top

    (
      aBottom - tolerance < bTop ||
      // 'a' top doesn't touch 'b' bottom
      aTop + tolerance > bBottom ||
      // 'a' right doesn't touch 'b' left
      aRight - tolerance < bLeft ||
      // 'a' left doesn't touch 'b' right
      aLeft + tolerance > bRight
    )
  )
}

/**
 * Given a node, get everything needed to calculate its boundaries
 * @param  {HTMLElement} node
 * @return {Object}
 */
function getBoundsForNode(node) {
  if (!node.getBoundingClientRect) return node
  let rect = node.getBoundingClientRect(),
    left = rect.left + pageOffset('left'),
    top = rect.top + pageOffset('top')
  return {
    top,
    left,
    right: (node.offsetWidth || 0) + left,
    bottom: (node.offsetHeight || 0) + top,
  }
}
function pageOffset(dir) {
  if (dir === 'left') return window.pageXOffset || document.body.scrollLeft || 0
  if (dir === 'top') return window.pageYOffset || document.body.scrollTop || 0
}

class BackgroundCells extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      selecting: false,
    }
  }
  componentDidMount() {
    this.props.selectable && this._selectable()
  }
  componentWillUnmount() {
    this._teardownSelectable()
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable) this._selectable()
    if (!nextProps.selectable && this.props.selectable)
      this._teardownSelectable()
  }
  render() {
    let {
      range,
      getNow,
      getters,
      date: currentDate,
      components: { dateCellWrapper: Wrapper },
    } = this.props
    let { selecting, startIdx, endIdx } = this.state
    let current = getNow()
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        className: 'rbc-row-bg',
      },
      range.map((date, index) => {
        let selected = selecting && index >= startIdx && index <= endIdx
        const { className, style } = getters.dayProp(date)
        return /*#__PURE__*/ React.createElement(
          Wrapper,
          {
            key: index,
            value: date,
            range: range,
          },
          /*#__PURE__*/ React.createElement('div', {
            style: style,
            className: clsx(
              'rbc-day-bg',
              className,
              selected && 'rbc-selected-cell',
              eq(date, current, 'day') && 'rbc-today',
              currentDate &&
                month(currentDate) !== month(date) &&
                'rbc-off-range-bg'
            ),
          })
        )
      })
    )
  }
  _selectable() {
    let node = findDOMNode(this)
    let selector = (this._selector = new Selection(this.props.container, {
      longPressThreshold: this.props.longPressThreshold,
    }))
    let selectorClicksHandler = (point, actionType) => {
      if (!isEvent(findDOMNode(this), point)) {
        let rowBox = getBoundsForNode(node)
        let { range, rtl } = this.props
        if (pointInBox(rowBox, point)) {
          let currentCell = getSlotAtX(rowBox, point.x, rtl, range.length)
          this._selectSlot({
            startIdx: currentCell,
            endIdx: currentCell,
            action: actionType,
            box: point,
          })
        }
      }
      this._initial = {}
      this.setState({
        selecting: false,
      })
    }
    selector.on('selecting', box => {
      let { range, rtl } = this.props
      let startIdx = -1
      let endIdx = -1
      if (!this.state.selecting) {
        notify(this.props.onSelectStart, [box])
        this._initial = {
          x: box.x,
          y: box.y,
        }
      }
      if (selector.isSelected(node)) {
        let nodeBox = getBoundsForNode(node)
        ;({ startIdx, endIdx } = dateCellSelection(
          this._initial,
          nodeBox,
          box,
          range.length,
          rtl
        ))
      }
      this.setState({
        selecting: true,
        startIdx,
        endIdx,
      })
    })
    selector.on('beforeSelect', box => {
      if (this.props.selectable !== 'ignoreEvents') return
      return !isEvent(findDOMNode(this), box)
    })
    selector.on('click', point => selectorClicksHandler(point, 'click'))
    selector.on('doubleClick', point =>
      selectorClicksHandler(point, 'doubleClick')
    )
    selector.on('select', bounds => {
      this._selectSlot(
        _extends({}, this.state, {
          action: 'select',
          bounds,
        })
      )
      this._initial = {}
      this.setState({
        selecting: false,
      })
      notify(this.props.onSelectEnd, [this.state])
    })
  }
  _teardownSelectable() {
    if (!this._selector) return
    this._selector.teardown()
    this._selector = null
  }
  _selectSlot(_ref) {
    let { endIdx, startIdx, action, bounds, box } = _ref
    if (endIdx !== -1 && startIdx !== -1)
      this.props.onSelectSlot &&
        this.props.onSelectSlot({
          start: startIdx,
          end: endIdx,
          action,
          bounds,
          box,
          resourceId: this.props.resourceId,
        })
  }
}
BackgroundCells.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        date: PropTypes.instanceOf(Date),
        getNow: PropTypes.func.isRequired,
        getters: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        container: PropTypes.func,
        dayPropGetter: PropTypes.func,
        selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: PropTypes.number,
        onSelectSlot: PropTypes.func.isRequired,
        onSelectEnd: PropTypes.func,
        onSelectStart: PropTypes.func,
        range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
        rtl: PropTypes.bool,
        type: PropTypes.string,
        resourceId: PropTypes.any,
      }
    : {}

/* eslint-disable react/prop-types */
var EventRowMixin = {
  propTypes: {
    slotMetrics: PropTypes.object.isRequired,
    selected: PropTypes.object,
    isAllDay: PropTypes.bool,
    accessors: PropTypes.object.isRequired,
    localizer: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,
    onSelect: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onKeyPress: PropTypes.func,
  },
  defaultProps: {
    segments: [],
    selected: {},
  },
  renderEvent(props, event) {
    let {
      selected,
      isAllDay: _,
      accessors,
      getters,
      onSelect,
      onDoubleClick,
      onKeyPress,
      localizer,
      slotMetrics,
      components,
    } = props
    let continuesPrior = slotMetrics.continuesPrior(event)
    let continuesAfter = slotMetrics.continuesAfter(event)
    return /*#__PURE__*/ React.createElement(EventCell, {
      event: event,
      getters: getters,
      localizer: localizer,
      accessors: accessors,
      components: components,
      onSelect: onSelect,
      onDoubleClick: onDoubleClick,
      onKeyPress: onKeyPress,
      continuesPrior: continuesPrior,
      continuesAfter: continuesAfter,
      slotStart: slotMetrics.first,
      slotEnd: slotMetrics.last,
      selected: isSelected(event, selected),
    })
  },
  renderSpan(slots, len, key, content) {
    if (content === void 0) {
      content = ' '
    }
    let per = (Math.abs(len) / slots) * 100 + '%'
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        key: key,
        className: 'rbc-row-segment',
        // IE10/11 need max-width. flex-basis doesn't respect box-sizing
        style: {
          WebkitFlexBasis: per,
          flexBasis: per,
          maxWidth: per,
        },
      },
      content
    )
  },
}

class EventRow extends React.Component {
  render() {
    let {
      segments,
      slotMetrics: { slots },
      className,
    } = this.props
    let lastEnd = 1
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        className: clsx(className, 'rbc-row'),
      },
      segments.reduce((row, _ref, li) => {
        let { event, left, right, span } = _ref
        let key = '_lvl_' + li
        let gap = left - lastEnd
        let content = EventRowMixin.renderEvent(this.props, event)
        if (gap) row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        row.push(EventRowMixin.renderSpan(slots, span, key, content))
        lastEnd = right + 1
        return row
      }, [])
    )
  }
}
EventRow.propTypes =
  process.env.NODE_ENV !== 'production'
    ? _extends(
        {
          segments: PropTypes.array,
        },
        EventRowMixin.propTypes
      )
    : {}
EventRow.defaultProps = _extends({}, EventRowMixin.defaultProps)

function endOfRange(dateRange, unit) {
  if (unit === void 0) {
    unit = 'day'
  }
  return {
    first: dateRange[0],
    last: add(dateRange[dateRange.length - 1], 1, unit),
  }
}
function eventSegments(event, range, accessors) {
  let { first, last } = endOfRange(range)
  let slots = diff(first, last, 'day')
  let start = max(startOf(accessors.start(event), 'day'), first)
  let end = min(ceil(accessors.end(event), 'day'), last)
  let padding = findIndex(range, x => eq(x, start, 'day'))
  let span = diff(start, end, 'day')
  span = Math.min(span, slots)
  span = Math.max(span, 1)
  return {
    event,
    span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  }
}
function eventLevels(rowSegments, limit) {
  if (limit === void 0) {
    limit = Infinity
  }
  let i,
    j,
    seg,
    levels = [],
    extra = []
  for (i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i]
    for (j = 0; j < levels.length; j++) if (!segsOverlap(seg, levels[j])) break
    if (j >= limit) {
      extra.push(seg)
    } else {
      ;(levels[j] || (levels[j] = [])).push(seg)
    }
  }
  for (i = 0; i < levels.length; i++) {
    levels[i].sort((a, b) => a.left - b.left) //eslint-disable-line
  }

  return {
    levels,
    extra,
  }
}
function inRange(e, start, end, accessors) {
  let eStart = startOf(accessors.start(e), 'day')
  let eEnd = accessors.end(e)
  let startsBeforeEnd = lte(eStart, end, 'day')
  // when the event is zero duration we need to handle a bit differently
  let endsAfterStart = !eq(eStart, eEnd, 'minutes')
    ? gt(eEnd, start, 'minutes')
    : gte(eEnd, start, 'minutes')
  return startsBeforeEnd && endsAfterStart
}
function segsOverlap(seg, otherSegs) {
  return otherSegs.some(
    otherSeg => otherSeg.left <= seg.right && otherSeg.right >= seg.left
  )
}
function sortEvents(evtA, evtB, accessors) {
  let startSort =
    +startOf(accessors.start(evtA), 'day') -
    +startOf(accessors.start(evtB), 'day')
  let durA = diff(
    accessors.start(evtA),
    ceil(accessors.end(evtA), 'day'),
    'day'
  )
  let durB = diff(
    accessors.start(evtB),
    ceil(accessors.end(evtB), 'day'),
    'day'
  )
  return (
    startSort ||
    // sort by start Day first
    Math.max(durB, 1) - Math.max(durA, 1) ||
    // events spanning multiple days go first
    !!accessors.allDay(evtB) - !!accessors.allDay(evtA) ||
    // then allDay single day events
    +accessors.start(evtA) - +accessors.start(evtB)
  ) // then sort by start time
}

let isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot
let eventsInSlot = (segments, slot) =>
  segments.filter(seg => isSegmentInSlot(seg, slot)).length
class EventEndingRow extends React.Component {
  render() {
    let {
      segments,
      slotMetrics: { slots },
    } = this.props
    let rowSegments = eventLevels(segments).levels[0]
    let current = 1,
      lastEnd = 1,
      row = []
    while (current <= slots) {
      let key = '_lvl_' + current
      let { event, left, right, span } =
        rowSegments.filter(seg => isSegmentInSlot(seg, current))[0] || {} //eslint-disable-line

      if (!event) {
        current++
        continue
      }
      let gap = Math.max(0, left - lastEnd)
      if (this.canRenderSlotEvent(left, span)) {
        let content = EventRowMixin.renderEvent(this.props, event)
        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        }
        row.push(EventRowMixin.renderSpan(slots, span, key, content))
        lastEnd = current = right + 1
      } else {
        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        }
        row.push(
          EventRowMixin.renderSpan(
            slots,
            1,
            key,
            this.renderShowMore(segments, current)
          )
        )
        lastEnd = current = current + 1
      }
    }
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        className: 'rbc-row',
      },
      row
    )
  }
  canRenderSlotEvent(slot, span) {
    let { segments } = this.props
    return range$1(slot, slot + span).every(s => {
      let count = eventsInSlot(segments, s)
      return count === 1
    })
  }
  renderShowMore(segments, slot) {
    let { localizer } = this.props
    let count = eventsInSlot(segments, slot)
    return count
      ? /*#__PURE__*/ React.createElement(
          'a',
          {
            key: 'sm_' + slot,
            href: '#',
            className: 'rbc-show-more',
            onClick: e => this.showMore(slot, e),
          },
          localizer.messages.showMore(count)
        )
      : false
  }
  showMore(slot, e) {
    e.preventDefault()
    this.props.onShowMore(slot, e.target)
  }
}
EventEndingRow.propTypes =
  process.env.NODE_ENV !== 'production'
    ? _extends(
        {
          segments: PropTypes.array,
          slots: PropTypes.number,
          onShowMore: PropTypes.func,
        },
        EventRowMixin.propTypes
      )
    : {}
EventEndingRow.defaultProps = _extends({}, EventRowMixin.defaultProps)

let isSegmentInSlot$1 = (seg, slot) => seg.left <= slot && seg.right >= slot
const isEqual = (a, b) =>
  a[0].range === b[0].range && a[0].events === b[0].events
function getSlotMetrics() {
  return memoize(options => {
    const { range, events, maxRows, minRows, accessors } = options
    let { first, last } = endOfRange(range)
    let segments = events.map(evt => eventSegments(evt, range, accessors))
    let { levels, extra } = eventLevels(segments, Math.max(maxRows - 1, 1))
    while (levels.length < minRows) levels.push([])
    return {
      first,
      last,
      levels,
      extra,
      range,
      slots: range.length,
      clone(args) {
        const metrics = getSlotMetrics()
        return metrics(_extends({}, options, args))
      },
      getDateForSlot(slotNumber) {
        return range[slotNumber]
      },
      getSlotForDate(date) {
        return range.find(r => eq(r, date, 'day'))
      },
      getEventsForSlot(slot) {
        return segments
          .filter(seg => isSegmentInSlot$1(seg, slot))
          .map(seg => seg.event)
      },
      continuesPrior(event) {
        return lt(accessors.start(event), first, 'day')
      },
      continuesAfter(event) {
        const eventEnd = accessors.end(event)
        const singleDayDuration = eq(
          accessors.start(event),
          eventEnd,
          'minutes'
        )
        return singleDayDuration
          ? gte(eventEnd, last, 'minutes')
          : gt(eventEnd, last, 'minutes')
      },
    }
  }, isEqual)
}

class DateContentRow extends React.Component {
  constructor() {
    super(...arguments)
    this.handleSelectSlot = slot => {
      const { range, onSelectSlot } = this.props
      onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
    }
    this.handleShowMore = (slot, target) => {
      const { range, onShowMore } = this.props
      let metrics = this.slotMetrics(this.props)
      let row = qsa(findDOMNode(this), '.rbc-row-bg')[0]
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
      return container ? container() : findDOMNode(this)
    }
    this.renderHeadingCell = (date, index) => {
      let { renderHeader, getNow } = this.props
      return renderHeader({
        date,
        key: 'header_' + index,
        className: clsx(
          'rbc-date-cell',
          eq(date, getNow(), 'day') && 'rbc-now'
        ),
      })
    }
    this.renderDummy = () => {
      let { className, range, renderHeader } = this.props
      return /*#__PURE__*/ React.createElement(
        'div',
        {
          className: className,
        },
        /*#__PURE__*/ React.createElement(
          'div',
          {
            className: 'rbc-row-content',
          },
          renderHeader &&
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: 'rbc-row',
                ref: this.createHeadingRef,
              },
              range.map(this.renderHeadingCell)
            ),
          /*#__PURE__*/ React.createElement(
            'div',
            {
              className: 'rbc-row',
              ref: this.createEventRef,
            },
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: 'rbc-row-segment',
              },
              /*#__PURE__*/ React.createElement(
                'div',
                {
                  className: 'rbc-event',
                },
                /*#__PURE__*/ React.createElement(
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
    this.slotMetrics = getSlotMetrics()
  }
  getRowLimit() {
    let eventHeight = getHeight(this.eventRow)
    let headingHeight = this.headingRow ? getHeight(this.headingRow) : 0
    let eventSpace = getHeight(findDOMNode(this)) - headingHeight
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
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        className: className,
      },
      /*#__PURE__*/ React.createElement(BackgroundCells, {
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
      /*#__PURE__*/ React.createElement(
        'div',
        {
          className: 'rbc-row-content',
        },
        renderHeader &&
          /*#__PURE__*/ React.createElement(
            'div',
            {
              className: 'rbc-row ',
              ref: this.createHeadingRef,
            },
            range.map(this.renderHeadingCell)
          ),
        /*#__PURE__*/ React.createElement(
          WeekWrapper,
          _extends(
            {
              isAllDay: isAllDay,
              isTimeline: isTimeline,
            },
            eventRowProps
          ),
          levels.map((segs, idx) =>
            /*#__PURE__*/ React.createElement(
              EventRow,
              _extends(
                {
                  key: idx,
                  segments: segs,
                },
                eventRowProps
              )
            )
          ),
          !!extra.length &&
            /*#__PURE__*/ React.createElement(
              EventEndingRow,
              _extends(
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
        date: PropTypes.instanceOf(Date),
        events: PropTypes.array.isRequired,
        range: PropTypes.array.isRequired,
        rtl: PropTypes.bool,
        resourceId: PropTypes.any,
        renderForMeasure: PropTypes.bool,
        renderHeader: PropTypes.func,
        container: PropTypes.func,
        selected: PropTypes.object,
        selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: PropTypes.number,
        onShowMore: PropTypes.func,
        onSelectSlot: PropTypes.func,
        onSelect: PropTypes.func,
        onSelectEnd: PropTypes.func,
        onSelectStart: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onKeyPress: PropTypes.func,
        dayPropGetter: PropTypes.func,
        getNow: PropTypes.func.isRequired,
        isAllDay: PropTypes.bool,
        isTimeline: PropTypes.bool,
        accessors: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object.isRequired,
        localizer: PropTypes.object.isRequired,
        minRows: PropTypes.number.isRequired,
        maxRows: PropTypes.number.isRequired,
      }
    : {}
DateContentRow.defaultProps = {
  minRows: 0,
  maxRows: Infinity,
  isTimeline: false,
}

const Header = _ref => {
  let { label } = _ref
  return /*#__PURE__*/ React.createElement('span', null, label)
}
Header.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        label: PropTypes.node,
      }
    : {}

const DateHeader = _ref => {
  let { label, drilldownView, onDrillDown } = _ref
  if (!drilldownView) {
    return /*#__PURE__*/ React.createElement('span', null, label)
  }
  return /*#__PURE__*/ React.createElement(
    'a',
    {
      href: '#',
      onClick: onDrillDown,
    },
    label
  )
}
DateHeader.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        label: PropTypes.node,
        date: PropTypes.instanceOf(Date),
        drilldownView: PropTypes.string,
        onDrillDown: PropTypes.func,
        isOffRange: PropTypes.bool,
      }
    : {}

const _excluded$1 = ['date', 'className']
let eventsForWeek = (evts, start, end, accessors) =>
  evts.filter(e => inRange(e, start, end, accessors))
class MonthView extends React.Component {
  constructor() {
    var _this
    super(...arguments)
    _this = this
    this.getContainer = () => {
      return findDOMNode(this)
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
      events.sort((a, b) => sortEvents(a, b, accessors))
      return /*#__PURE__*/ React.createElement(DateContentRow, {
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
      })
    }
    this.readerDateHeading = _ref => {
      let { date, className } = _ref,
        props = _objectWithoutPropertiesLoose(_ref, _excluded$1)
      let { date: currentDate, getDrilldownView, localizer } = this.props
      let isOffRange = month(date) !== month(currentDate)
      let isCurrent = eq(date, currentDate, 'day')
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, 'dateFormat')
      let DateHeaderComponent = this.props.components.dateHeader || DateHeader
      return /*#__PURE__*/ React.createElement(
        'div',
        _extends({}, props, {
          className: clsx(
            className,
            isOffRange && 'rbc-off-range',
            isCurrent && 'rbc-current'
          ),
        }),
        /*#__PURE__*/ React.createElement(DateHeaderComponent, {
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
      notify(this.props.onDrillDown, [date, view])
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
      notify(_this.props.onSelectEvent, args)
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
      notify(_this.props.onDoubleClickEvent, args)
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
      notify(_this.props.onKeyPressEvent, args)
    }
    this.handleShowMore = (events, date, cell, slot, target) => {
      const { popup, onDrillDown, onShowMore, getDrilldownView } = this.props
      //cancel any pending selections so only the event click goes through.
      this.clearSelection()
      if (popup) {
        let position = getPosition(cell, findDOMNode(this))
        this.setState({
          overlay: {
            date,
            events,
            position,
            target,
          },
        })
      } else {
        notify(onDrillDown, [date, getDrilldownView(date) || views.DAY])
      }
      notify(onShowMore, [events, date, slot])
    }
    this.overlayDisplay = () => {
      this.setState({
        overlay: null,
      })
    }
    this._bgRows = []
    this._pendingSelection = []
    this.slotRowRef = /*#__PURE__*/ React.createRef()
    this.state = {
      rowLimit: 5,
      needLimitMeasure: true,
    }
  }
  UNSAFE_componentWillReceiveProps(_ref2) {
    let { date } = _ref2
    this.setState({
      needLimitMeasure: !eq(date, this.props.date, 'month'),
    })
  }
  componentDidMount() {
    let running
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props)
    window.addEventListener(
      'resize',
      (this._resizeListener = () => {
        if (!running) {
          request(() => {
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
      month = visibleDays(date, localizer),
      weeks = chunk(month, 7)
    this._weekCount = weeks.length
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        className: clsx('rbc-month-view', className),
      },
      /*#__PURE__*/ React.createElement(
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
    let HeaderComponent = components.header || Header
    return range(first, last, 'day').map((day, idx) =>
      /*#__PURE__*/ React.createElement(
        'div',
        {
          key: 'header_' + idx,
          className: 'rbc-header',
        },
        /*#__PURE__*/ React.createElement(HeaderComponent, {
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
    return /*#__PURE__*/ React.createElement(
      Overlay,
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
        return /*#__PURE__*/ React.createElement(
          Popup$1,
          _extends({}, props, {
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
    notify(this.props.onSelectSlot, {
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
        events: PropTypes.array.isRequired,
        date: PropTypes.instanceOf(Date),
        min: PropTypes.instanceOf(Date),
        max: PropTypes.instanceOf(Date),
        step: PropTypes.number,
        getNow: PropTypes.func.isRequired,
        scrollToTime: PropTypes.instanceOf(Date),
        rtl: PropTypes.bool,
        width: PropTypes.number,
        accessors: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object.isRequired,
        localizer: PropTypes.object.isRequired,
        selected: PropTypes.object,
        selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: PropTypes.number,
        onNavigate: PropTypes.func,
        onSelectSlot: PropTypes.func,
        onSelectEvent: PropTypes.func,
        onDoubleClickEvent: PropTypes.func,
        onKeyPressEvent: PropTypes.func,
        onShowMore: PropTypes.func,
        onDrillDown: PropTypes.func,
        getDrilldownView: PropTypes.func.isRequired,
        popup: PropTypes.bool,
        handleDragStart: PropTypes.func,
        popupOffset: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
          }),
        ]),
      }
    : {}
MonthView.range = (date, _ref4) => {
  let { localizer } = _ref4
  let start = firstVisibleDay(date, localizer)
  let end = lastVisibleDay(date, localizer)
  return {
    start,
    end,
  }
}
MonthView.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return add(date, -1, 'month')
    case navigate.NEXT:
      return add(date, 1, 'month')
    default:
      return date
  }
}
MonthView.title = (date, _ref5) => {
  let { localizer } = _ref5
  return localizer.format(date, 'monthHeaderFormat')
}

const getDstOffset = (start, end) =>
  start.getTimezoneOffset() - end.getTimezoneOffset()
const getKey = (min, max, step, slots) =>
  '' +
  +startOf(min, 'minutes') +
  ('' + +startOf(max, 'minutes')) +
  (step + '-' + slots)
function getSlotMetrics$1(_ref) {
  let { min: start, max: end, step, timeslots } = _ref
  const key = getKey(start, end, step, timeslots)

  // if the start is on a DST-changing day but *after* the moment of DST
  // transition we need to add those extra minutes to our minutesFromMidnight
  const daystart = startOf(start, 'day')
  const daystartdstoffset = getDstOffset(daystart, start)
  const totalMin = 1 + diff(start, end, 'minutes') + getDstOffset(start, end)
  const minutesFromMidnight =
    diff(daystart, start, 'minutes') + daystartdstoffset
  const numGroups = Math.ceil((totalMin - 1) / (step * timeslots))
  const numSlots = numGroups * timeslots
  const groups = new Array(numGroups)
  const slots = new Array(numSlots)
  // Each slot date is created from "zero", instead of adding `step` to
  // the previous one, in order to avoid DST oddities
  for (let grp = 0; grp < numGroups; grp++) {
    groups[grp] = new Array(timeslots)
    for (let slot = 0; slot < timeslots; slot++) {
      const slotIdx = grp * timeslots + slot
      const minFromStart = slotIdx * step
      // A date with total minutes calculated from the start of the day
      slots[slotIdx] = groups[grp][slot] = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        minutesFromMidnight + minFromStart,
        0,
        0
      )
    }
  }

  // Necessary to be able to select up until the last timeslot in a day
  const lastSlotMinFromStart = slots.length * step
  slots.push(
    new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0,
      minutesFromMidnight + lastSlotMinFromStart,
      0,
      0
    )
  )
  function positionFromDate(date) {
    const diff$1 = diff(start, date, 'minutes') + getDstOffset(start, date)
    return Math.min(diff$1, totalMin)
  }
  return {
    groups,
    update(args) {
      if (getKey(args) !== key) return getSlotMetrics$1(args)
      return this
    },
    dateIsInGroup(date, groupIndex) {
      const nextGroup = groups[groupIndex + 1]
      return inRange$1(
        date,
        groups[groupIndex][0],
        nextGroup ? nextGroup[0] : end,
        'minutes'
      )
    },
    nextSlot(slot) {
      let next = slots[Math.min(slots.indexOf(slot) + 1, slots.length - 1)]
      // in the case of the last slot we won't a long enough range so manually get it
      if (next === slot) next = add(slot, step, 'minutes')
      return next
    },
    closestSlotToPosition(percent) {
      const slot = Math.min(
        slots.length - 1,
        Math.max(0, Math.floor(percent * numSlots))
      )
      return slots[slot]
    },
    closestSlotFromPoint(point, boundaryRect) {
      let range = Math.abs(boundaryRect.top - boundaryRect.bottom)
      return this.closestSlotToPosition((point.y - boundaryRect.top) / range)
    },
    closestSlotFromPointHr(point, boundaryRect) {
      let range = Math.abs(boundaryRect.left - boundaryRect.right)
      return this.closestSlotToPosition((point.x - boundaryRect.left) / range)
    },
    closestSlotFromDate(date, offset) {
      if (offset === void 0) {
        offset = 0
      }
      if (lt(date, start, 'minutes')) return slots[0]
      const diffMins = diff(start, date, 'minutes')
      return slots[(diffMins - (diffMins % step)) / step + offset]
    },
    startsBeforeDay(date) {
      return lt(date, start, 'day')
    },
    startsAfterDay(date) {
      return gt(date, end, 'day')
    },
    startsBefore(date) {
      return lt(merge(start, date), start, 'minutes')
    },
    startsAfter(date) {
      return gt(merge(end, date), end, 'minutes')
    },
    getRange(rangeStart, rangeEnd, ignoreMin, ignoreMax) {
      if (!ignoreMin) rangeStart = min(end, max(start, rangeStart))
      if (!ignoreMax) rangeEnd = min(end, max(start, rangeEnd))
      const rangeStartMin = positionFromDate(rangeStart)
      const rangeEndMin = positionFromDate(rangeEnd)
      const top =
        rangeEndMin > step * numSlots && !eq(end, rangeEnd)
          ? ((rangeStartMin - step) / (step * numSlots)) * 100
          : (rangeStartMin / (step * numSlots)) * 100
      return {
        top,
        height: (rangeEndMin / (step * numSlots)) * 100 - top,
        start: positionFromDate(rangeStart),
        startDate: rangeStart,
        end: positionFromDate(rangeEnd),
        endDate: rangeEnd,
      }
    },
    getRangeTimeline(rangeStart, rangeEnd, ignoreMin, ignoreMax) {
      if (!ignoreMin) rangeStart = min(end, max(start, rangeStart))
      if (!ignoreMax) rangeEnd = min(end, max(start, rangeEnd))
      const rangeStartMin = positionFromDate(rangeStart)
      const rangeEndMin = positionFromDate(rangeEnd)
      const left =
        rangeEndMin > step * numSlots && !eq(end, rangeEnd)
          ? ((rangeStartMin - step) / (step * numSlots)) * 100
          : (rangeStartMin / (step * numSlots)) * 100
      return {
        top: left,
        left,
        width: (rangeEndMin / (step * numSlots)) * 100 - left,
        height: (rangeEndMin / (step * numSlots)) * 100 - left,
        start: positionFromDate(rangeStart),
        startDate: rangeStart,
        end: positionFromDate(rangeEnd),
        endDate: rangeEnd,
      }
    },
    getCurrentTimePosition(rangeStart) {
      const rangeStartMin = positionFromDate(rangeStart)
      const top = (rangeStartMin / (step * numSlots)) * 100
      return top
    },
    getCurrentTimePositionHr(rangeStart) {
      const rangeStartMin = positionFromDate(rangeStart)
      const left = (rangeStartMin / (step * numSlots)) * 100
      return left
    },
  }
}

class Event {
  constructor(data, _ref) {
    let { accessors, slotMetrics } = _ref
    const {
      start,
      startDate,
      end,
      endDate,
      top,
      height,
    } = slotMetrics.getRange(accessors.start(data), accessors.end(data))
    this.start = start
    this.end = end
    this.startMs = +startDate
    this.endMs = +endDate
    this.top = top
    this.height = height
    this.data = data
  }

  /**
   * The event's width without any overlap.
   */
  get _width() {
    // The container event's width is determined by the maximum number of
    // events in any of its rows.
    if (this.rows) {
      const columns =
        this.rows.reduce(
          (max, row) => Math.max(max, row.leaves.length + 1),
          // add itself
          0
        ) + 1 // add the container

      return 100 / columns
    }
    const availableWidth = 100 - this.container._width

    // The row event's width is the space left by the container, divided
    // among itself and its leaves.
    if (this.leaves) {
      return availableWidth / (this.leaves.length + 1)
    }

    // The leaf event's width is determined by its row's width
    return this.row._width
  }

  /**
   * The event's calculated width, possibly with extra width added for
   * overlapping effect.
   */
  get width() {
    const noOverlap = this._width
    const overlap = Math.min(100, this._width * 1.7)

    // Containers can always grow.
    if (this.rows) {
      return overlap
    }

    // Rows can grow if they have leaves.
    if (this.leaves) {
      return this.leaves.length > 0 ? overlap : noOverlap
    }

    // Leaves can grow unless they're the last item in a row.
    const { leaves } = this.row
    const index = leaves.indexOf(this)
    return index === leaves.length - 1 ? noOverlap : overlap
  }
  get xOffset() {
    // Containers have no offset.
    if (this.rows) return 0

    // Rows always start where their container ends.
    if (this.leaves) return this.container._width

    // Leaves are spread out evenly on the space left by its row.
    const { leaves, xOffset, _width } = this.row
    const index = leaves.indexOf(this) + 1
    return xOffset + index * _width
  }
}

/**
 * Return true if event a and b is considered to be on the same row.
 */
function onSameRow(a, b, minimumStartDifference) {
  return (
    // Occupies the same start slot.
    Math.abs(b.start - a.start) < minimumStartDifference ||
    // A's start slot overlaps with b's end slot.
    (b.start > a.start && b.start < a.end)
  )
}
function sortByRender(events) {
  const sortedByTime = sortBy(events, ['startMs', e => -e.endMs])
  const sorted = []
  while (sortedByTime.length > 0) {
    const event = sortedByTime.shift()
    sorted.push(event)
    for (let i = 0; i < sortedByTime.length; i++) {
      const test = sortedByTime[i]

      // Still inside this event, look for next.
      if (event.endMs > test.startMs) continue

      // We've found the first event of the next event group.
      // If that event is not right next to our current event, we have to
      // move it here.
      if (i > 0) {
        const event = sortedByTime.splice(i, 1)[0]
        sorted.push(event)
      }

      // We've already found the next event group, so stop looking.
      break
    }
  }
  return sorted
}
function getStyledEvents(_ref2) {
  let { events, minimumStartDifference, slotMetrics, accessors } = _ref2
  // Create proxy events and order them so that we don't have
  // to fiddle with z-indexes.
  const proxies = events.map(
    event =>
      new Event(event, {
        slotMetrics,
        accessors,
      })
  )
  const eventsInRenderOrder = sortByRender(proxies)

  // Group overlapping events, while keeping order.
  // Every event is always one of: container, row or leaf.
  // Containers can contain rows, and rows can contain leaves.
  const containerEvents = []
  for (let i = 0; i < eventsInRenderOrder.length; i++) {
    const event = eventsInRenderOrder[i]

    // Check if this event can go into a container event.
    const container = containerEvents.find(
      c =>
        c.end > event.start ||
        Math.abs(event.start - c.start) < minimumStartDifference
    )

    // Couldn't find a container — that means this event is a container.
    if (!container) {
      event.rows = []
      containerEvents.push(event)
      continue
    }

    // Found a container for the event.
    event.container = container

    // Check if the event can be placed in an existing row.
    // Start looking from behind.
    let row = null
    for (let j = container.rows.length - 1; !row && j >= 0; j--) {
      if (onSameRow(container.rows[j], event, minimumStartDifference)) {
        row = container.rows[j]
      }
    }
    if (row) {
      // Found a row, so add it.
      row.leaves.push(event)
      event.row = row
    } else {
      // Couldn't find a row – that means this event is a row.
      event.leaves = []
      container.rows.push(event)
    }
  }

  // Return the original events, along with their styles.
  return eventsInRenderOrder.map(event => ({
    event: event.data,
    style: {
      top: event.top,
      height: event.height,
      width: event.width,
      xOffset: Math.max(0, event.xOffset),
    },
  }))
}

function getMaxIdxDFS(node, maxIdx, visited) {
  for (let i = 0; i < node.friends.length; ++i) {
    if (visited.indexOf(node.friends[i]) > -1) continue
    maxIdx = maxIdx > node.friends[i].idx ? maxIdx : node.friends[i].idx
    // TODO : trace it by not object but kinda index or something for performance
    visited.push(node.friends[i])
    const newIdx = getMaxIdxDFS(node.friends[i], maxIdx, visited)
    maxIdx = maxIdx > newIdx ? maxIdx : newIdx
  }
  return maxIdx
}
function noOverlap(_ref) {
  let { events, minimumStartDifference, slotMetrics, accessors } = _ref
  const styledEvents = getStyledEvents({
    events,
    minimumStartDifference,
    slotMetrics,
    accessors,
  })
  styledEvents.sort((a, b) => {
    a = a.style
    b = b.style
    if (a.top !== b.top) return a.top > b.top ? 1 : -1
    else return a.top + a.height < b.top + b.height ? 1 : -1
  })
  for (let i = 0; i < styledEvents.length; ++i) {
    styledEvents[i].friends = []
    delete styledEvents[i].style.left
    delete styledEvents[i].style.left
    delete styledEvents[i].idx
    delete styledEvents[i].size
  }
  for (let i = 0; i < styledEvents.length - 1; ++i) {
    const se1 = styledEvents[i]
    const y1 = se1.style.top
    const y2 = se1.style.top + se1.style.height
    for (let j = i + 1; j < styledEvents.length; ++j) {
      const se2 = styledEvents[j]
      const y3 = se2.style.top
      const y4 = se2.style.top + se2.style.height

      // be friends when overlapped
      if ((y3 <= y1 && y1 < y4) || (y1 <= y3 && y3 < y2)) {
        // TODO : hashmap would be effective for performance
        se1.friends.push(se2)
        se2.friends.push(se1)
      }
    }
  }
  for (let i = 0; i < styledEvents.length; ++i) {
    const se = styledEvents[i]
    const bitmap = []
    for (let j = 0; j < 100; ++j) bitmap.push(1) // 1 means available

    for (let j = 0; j < se.friends.length; ++j)
      if (se.friends[j].idx !== undefined) bitmap[se.friends[j].idx] = 0 // 0 means reserved

    se.idx = bitmap.indexOf(1)
  }
  for (let i = 0; i < styledEvents.length; ++i) {
    let size = 0
    if (styledEvents[i].size) continue
    const allFriends = []
    const maxIdx = getMaxIdxDFS(styledEvents[i], 0, allFriends)
    size = 100 / (maxIdx + 1)
    styledEvents[i].size = size
    for (let j = 0; j < allFriends.length; ++j) allFriends[j].size = size
  }
  for (let i = 0; i < styledEvents.length; ++i) {
    const e = styledEvents[i]
    e.style.left = e.idx * e.size

    // stretch to maximum
    let maxIdx = 0
    for (let j = 0; j < e.friends.length; ++j) {
      const idx = e.friends[j]
      maxIdx = maxIdx > idx ? maxIdx : idx
    }
    if (maxIdx <= e.idx) e.size = 100 - e.idx * e.size

    // padding between events
    // for this feature, `width` is not percentage based unit anymore
    // it will be used with calc()
    const padding = e.idx === 0 ? 0 : 3
    e.style.width = 'calc(' + e.size + '% - ' + padding + 'px)'
    e.style.height = 'calc(' + e.style.height + '% - 2px)'
    e.style.xOffset = 'calc(' + e.style.left + '% + ' + padding + 'px)'
  }
  return styledEvents
}

/*eslint no-unused-vars: "off"*/
const DefaultAlgorithms = {
  overlap: getStyledEvents,
  'no-overlap': noOverlap,
}
function isFunction(a) {
  return !!(a && a.constructor && a.call && a.apply)
}

//
function getStyledEvents$1(_ref) {
  let {
    events,
    minimumStartDifference,
    slotMetrics,
    accessors,
    dayLayoutAlgorithm, // one of DefaultAlgorithms keys
    // or custom function
  } = _ref
  let algorithm = dayLayoutAlgorithm
  if (dayLayoutAlgorithm in DefaultAlgorithms)
    algorithm = DefaultAlgorithms[dayLayoutAlgorithm]
  if (!isFunction(algorithm)) {
    // invalid algorithm
    return []
  }
  return algorithm.apply(this, arguments)
}

class TimeSlotGroup extends Component {
  render() {
    const {
      renderSlot,
      resource,
      group,
      getters,
      components: { timeSlotWrapper: Wrapper = NoopWrapper } = {},
    } = this.props
    const groupProps = getters ? getters.slotGroupProp() : {}
    return /*#__PURE__*/ React.createElement(
      'div',
      _extends(
        {
          className: 'rbc-timeslot-group',
        },
        groupProps
      ),
      group.map((value, idx) => {
        const slotProps = getters ? getters.slotProp(value, resource) : {}
        return /*#__PURE__*/ React.createElement(
          Wrapper,
          {
            key: idx,
            value: value,
            resource: resource,
          },
          /*#__PURE__*/ React.createElement(
            'div',
            _extends({}, slotProps, {
              className: clsx('rbc-time-slot', slotProps.className),
            }),
            renderSlot && renderSlot(value, idx)
          )
        )
      })
    )
  }
}
TimeSlotGroup.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        renderSlot: PropTypes.func,
        group: PropTypes.array.isRequired,
        resource: PropTypes.any,
        components: PropTypes.object,
        getters: PropTypes.object,
      }
    : {}

function stringifyPercent(v) {
  return typeof v === 'string' ? v : v + '%'
}

/* eslint-disable react/prop-types */
function TimeGridEvent(props) {
  const {
    style,
    className,
    event,
    accessors,
    rtl,
    selected,
    label,
    continuesEarlier,
    continuesLater,
    getters,
    onClick,
    onDoubleClick,
    onKeyPress,
    components: { event: Event, eventWrapper: EventWrapper },
  } = props
  let title = accessors.title(event)
  let tooltip = accessors.tooltip(event)
  let end = accessors.end(event)
  let start = accessors.start(event)
  let userProps = getters.eventProp(event, start, end, selected)
  let { height, top, width, xOffset } = style
  const inner = [
    /*#__PURE__*/ React.createElement(
      'div',
      {
        key: '1',
        className: 'rbc-event-label',
      },
      label
    ),
    /*#__PURE__*/ React.createElement(
      'div',
      {
        key: '2',
        className: 'rbc-event-content',
      },
      Event
        ? /*#__PURE__*/ React.createElement(Event, {
            event: event,
            title: title,
          })
        : title
    ),
  ]
  return /*#__PURE__*/ React.createElement(
    EventWrapper,
    _extends(
      {
        type: 'time',
      },
      props
    ),
    /*#__PURE__*/ React.createElement(
      'div',
      {
        onClick: onClick,
        onDoubleClick: onDoubleClick,
        onKeyPress: onKeyPress,
        style: _extends({}, userProps.style, {
          top: stringifyPercent(top),
          [rtl ? 'right' : 'left']: stringifyPercent(xOffset),
          width: stringifyPercent(width),
          height: stringifyPercent(height),
        }),
        title: tooltip
          ? (typeof label === 'string' ? label + ': ' : '') + tooltip
          : undefined,
        className: clsx('rbc-event', className, userProps.className, {
          'rbc-selected': selected,
          'rbc-event-continues-earlier': continuesEarlier,
          'rbc-event-continues-later': continuesLater,
        }),
      },
      inner
    )
  )
}

const _excluded$2 = ['eventContainerWrapper'],
  _excluded2 = ['dayProp']
class DayColumn extends React.Component {
  constructor() {
    var _this
    super(...arguments)
    _this = this
    this.state = {
      selecting: false,
      timeIndicatorPosition: null,
    }
    this.intervalTriggered = false
    this.renderEvents = () => {
      let {
        events,
        rtl,
        selected,
        accessors,
        localizer,
        getters,
        components,
        step,
        timeslots,
        dayLayoutAlgorithm,
      } = this.props
      const { slotMetrics } = this
      const { messages } = localizer
      let styledEvents = getStyledEvents$1({
        events,
        accessors,
        slotMetrics,
        minimumStartDifference: Math.ceil((step * timeslots) / 2),
        dayLayoutAlgorithm,
      })
      return styledEvents.map((_ref, idx) => {
        let { event, style } = _ref
        let end = accessors.end(event)
        let start = accessors.start(event)
        let format = 'eventTimeRangeFormat'
        let label
        const startsBeforeDay = slotMetrics.startsBeforeDay(start)
        const startsAfterDay = slotMetrics.startsAfterDay(end)
        if (startsBeforeDay) format = 'eventTimeRangeEndFormat'
        else if (startsAfterDay) format = 'eventTimeRangeStartFormat'
        if (startsBeforeDay && startsAfterDay) label = messages.allDay
        else
          label = localizer.format(
            {
              start,
              end,
            },
            format
          )
        let continuesEarlier =
          startsBeforeDay || slotMetrics.startsBefore(start)
        let continuesLater = startsAfterDay || slotMetrics.startsAfter(end)
        return /*#__PURE__*/ React.createElement(TimeGridEvent, {
          style: style,
          event: event,
          label: label,
          key: 'evt_' + idx,
          getters: getters,
          rtl: rtl,
          components: components,
          continuesEarlier: continuesEarlier,
          continuesLater: continuesLater,
          accessors: accessors,
          selected: isSelected(event, selected),
          onClick: e => this._select(event, e),
          onDoubleClick: e => this._doubleClick(event, e),
          onKeyPress: e => this._keyPress(event, e),
        })
      })
    }
    this._selectable = () => {
      let node = findDOMNode(this)
      let selector = (this._selector = new Selection(() => findDOMNode(this), {
        longPressThreshold: this.props.longPressThreshold,
      }))
      let maybeSelect = box => {
        let onSelecting = this.props.onSelecting
        let current = this.state || {}
        let state = selectionState(box)
        let { startDate: start, endDate: end } = state
        if (onSelecting) {
          if (
            (eq(current.startDate, start, 'minutes') &&
              eq(current.endDate, end, 'minutes')) ||
            onSelecting({
              start,
              end,
              resourceId: this.props.resource,
            }) === false
          )
            return
        }
        if (
          this.state.start !== state.start ||
          this.state.end !== state.end ||
          this.state.selecting !== state.selecting
        ) {
          this.setState(state)
        }
      }
      let selectionState = point => {
        let currentSlot = this.slotMetrics.closestSlotFromPoint(
          point,
          getBoundsForNode(node)
        )
        if (!this.state.selecting) {
          this._initialSlot = currentSlot
        }
        let initialSlot = this._initialSlot
        if (lte(initialSlot, currentSlot)) {
          currentSlot = this.slotMetrics.nextSlot(currentSlot)
        } else if (gt(initialSlot, currentSlot)) {
          initialSlot = this.slotMetrics.nextSlot(initialSlot)
        }
        const selectRange = this.slotMetrics.getRange(
          min(initialSlot, currentSlot),
          max(initialSlot, currentSlot)
        )
        return _extends({}, selectRange, {
          selecting: true,
          top: selectRange.top + '%',
          height: selectRange.height + '%',
        })
      }
      let selectorClicksHandler = (box, actionType) => {
        if (!isEvent(findDOMNode(this), box)) {
          const { startDate, endDate } = selectionState(box)
          this._selectSlot({
            startDate,
            endDate,
            action: actionType,
            box,
          })
        }
        this.setState({
          selecting: false,
        })
      }
      selector.on('selecting', maybeSelect)
      selector.on('selectStart', maybeSelect)
      selector.on('beforeSelect', box => {
        if (this.props.selectable !== 'ignoreEvents') return
        return !isEvent(findDOMNode(this), box)
      })
      selector.on('click', box => selectorClicksHandler(box, 'click'))
      selector.on('doubleClick', box =>
        selectorClicksHandler(box, 'doubleClick')
      )
      selector.on('select', bounds => {
        if (this.state.selecting) {
          this._selectSlot(
            _extends({}, this.state, {
              action: 'select',
              bounds,
            })
          )
          this.setState({
            selecting: false,
          })
        }
      })
      selector.on('reset', () => {
        if (this.state.selecting) {
          this.setState({
            selecting: false,
          })
        }
      })
    }
    this._teardownSelectable = () => {
      if (!this._selector) return
      this._selector.teardown()
      this._selector = null
    }
    this._selectSlot = _ref2 => {
      let { startDate, endDate, action, bounds, box } = _ref2
      let current = startDate,
        slots = []
      while (lte(current, endDate)) {
        slots.push(current)
        current = new Date(+current + this.props.step * 60 * 1000) // using Date ensures not to create an endless loop the day DST begins
      }

      notify(this.props.onSelectSlot, {
        slots,
        start: startDate,
        end: endDate,
        resourceId: this.props.resource,
        action,
        bounds,
        box,
      })
    }
    this._select = function() {
      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }
      notify(_this.props.onSelectEvent, args)
    }
    this._doubleClick = function() {
      for (
        var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2] = arguments[_key2]
      }
      notify(_this.props.onDoubleClickEvent, args)
    }
    this._keyPress = function() {
      for (
        var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3]
      }
      notify(_this.props.onKeyPressEvent, args)
    }
    this.slotMetrics = getSlotMetrics$1(this.props)
  }
  componentDidMount() {
    this.props.selectable && this._selectable()
    if (this.props.isNow) {
      this.setTimeIndicatorPositionUpdateInterval()
    }
  }
  componentWillUnmount() {
    this._teardownSelectable()
    this.clearTimeIndicatorInterval()
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable) this._selectable()
    if (!nextProps.selectable && this.props.selectable)
      this._teardownSelectable()
    this.slotMetrics = this.slotMetrics.update(nextProps)
  }
  componentDidUpdate(prevProps, prevState) {
    const getNowChanged = !eq(
      prevProps.getNow(),
      this.props.getNow(),
      'minutes'
    )
    if (prevProps.isNow !== this.props.isNow || getNowChanged) {
      this.clearTimeIndicatorInterval()
      if (this.props.isNow) {
        const tail =
          !getNowChanged &&
          eq(prevProps.date, this.props.date, 'minutes') &&
          prevState.timeIndicatorPosition === this.state.timeIndicatorPosition
        this.setTimeIndicatorPositionUpdateInterval(tail)
      }
    } else if (
      this.props.isNow &&
      (!eq(prevProps.min, this.props.min, 'minutes') ||
        !eq(prevProps.max, this.props.max, 'minutes'))
    ) {
      this.positionTimeIndicator()
    }
  }

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  setTimeIndicatorPositionUpdateInterval(tail) {
    if (tail === void 0) {
      tail = false
    }
    if (!this.intervalTriggered && !tail) {
      this.positionTimeIndicator()
    }
    this._timeIndicatorTimeout = window.setTimeout(() => {
      this.intervalTriggered = true
      this.positionTimeIndicator()
      this.setTimeIndicatorPositionUpdateInterval()
    }, 60000)
  }
  clearTimeIndicatorInterval() {
    this.intervalTriggered = false
    window.clearTimeout(this._timeIndicatorTimeout)
  }
  positionTimeIndicator() {
    const { min, max, getNow } = this.props
    const current = getNow()
    if (current >= min && current <= max) {
      const top = this.slotMetrics.getCurrentTimePosition(current)
      this.intervalTriggered = true
      this.setState({
        timeIndicatorPosition: top,
      })
    } else {
      this.clearTimeIndicatorInterval()
    }
  }
  render() {
    const _this$props = this.props,
      {
        max,
        rtl,
        isNow,
        resource,
        accessors,
        localizer,
        getters: { dayProp },
        components: { eventContainerWrapper: EventContainer },
      } = _this$props,
      getters = _objectWithoutPropertiesLoose(_this$props.getters, _excluded2),
      components = _objectWithoutPropertiesLoose(
        _this$props.components,
        _excluded$2
      )
    let { slotMetrics } = this
    let { selecting, top, height, startDate, endDate } = this.state
    let selectDates = {
      start: startDate,
      end: endDate,
    }
    const { className, style } = dayProp(max)
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        style: style,
        className: clsx(
          className,
          'rbc-day-slot',
          'rbc-time-column',
          isNow && 'rbc-now',
          isNow && 'rbc-today',
          // WHY
          selecting && 'rbc-slot-selecting'
        ),
      },
      slotMetrics.groups.map((grp, idx) =>
        /*#__PURE__*/ React.createElement(TimeSlotGroup, {
          key: idx,
          group: grp,
          resource: resource,
          getters: getters,
          components: components,
        })
      ),
      /*#__PURE__*/ React.createElement(
        EventContainer,
        {
          localizer: localizer,
          resource: resource,
          accessors: accessors,
          getters: getters,
          components: components,
          slotMetrics: slotMetrics,
        },
        /*#__PURE__*/ React.createElement(
          'div',
          {
            className: clsx('rbc-events-container', rtl && 'rtl'),
          },
          this.renderEvents()
        )
      ),
      selecting &&
        /*#__PURE__*/ React.createElement(
          'div',
          {
            className: 'rbc-slot-selection',
            style: {
              top,
              height,
            },
          },
          /*#__PURE__*/ React.createElement(
            'span',
            null,
            localizer.format(selectDates, 'selectRangeFormat')
          )
        ),
      isNow &&
        this.intervalTriggered &&
        /*#__PURE__*/ React.createElement('div', {
          className: 'rbc-current-time-indicator',
          style: {
            top: this.state.timeIndicatorPosition + '%',
          },
        })
    )
  }
}
DayColumn.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        events: PropTypes.array.isRequired,
        step: PropTypes.number.isRequired,
        date: PropTypes.instanceOf(Date).isRequired,
        min: PropTypes.instanceOf(Date).isRequired,
        max: PropTypes.instanceOf(Date).isRequired,
        getNow: PropTypes.func.isRequired,
        isNow: PropTypes.bool,
        rtl: PropTypes.bool,
        accessors: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object.isRequired,
        localizer: PropTypes.object.isRequired,
        showMultiDayTimes: PropTypes.bool,
        culture: PropTypes.string,
        timeslots: PropTypes.number,
        selected: PropTypes.object,
        selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
        eventOffset: PropTypes.number,
        longPressThreshold: PropTypes.number,
        onSelecting: PropTypes.func,
        onSelectSlot: PropTypes.func.isRequired,
        onSelectEvent: PropTypes.func.isRequired,
        onDoubleClickEvent: PropTypes.func.isRequired,
        onKeyPressEvent: PropTypes.func,
        className: PropTypes.string,
        dragThroughEvents: PropTypes.bool,
        resource: PropTypes.any,
        dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
      }
    : {}
DayColumn.defaultProps = {
  dragThroughEvents: true,
  timeslots: 2,
}

class TimeGutter extends Component {
  constructor() {
    super(...arguments)
    this.renderSlot = (value, idx) => {
      if (idx !== 0) return null
      const { localizer, getNow } = this.props
      const isNow = this.slotMetrics.dateIsInGroup(getNow(), idx)
      return /*#__PURE__*/ React.createElement(
        'span',
        {
          className: clsx('rbc-label', isNow && 'rbc-now'),
        },
        localizer.format(value, 'timeGutterFormat')
      )
    }
    const { min, max, timeslots, step } = this.props
    this.slotMetrics = getSlotMetrics$1({
      min,
      max,
      timeslots,
      step,
    })
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { min, max, timeslots, step } = nextProps
    this.slotMetrics = this.slotMetrics.update({
      min,
      max,
      timeslots,
      step,
    })
  }
  render() {
    const { resource, components, getters } = this.props
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        className: 'rbc-time-gutter rbc-time-column',
      },
      this.slotMetrics.groups.map((grp, idx) => {
        return /*#__PURE__*/ React.createElement(TimeSlotGroup, {
          key: idx,
          group: grp,
          resource: resource,
          components: components,
          renderSlot: this.renderSlot,
          getters: getters,
        })
      })
    )
  }
}
TimeGutter.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        min: PropTypes.instanceOf(Date).isRequired,
        max: PropTypes.instanceOf(Date).isRequired,
        timeslots: PropTypes.number.isRequired,
        step: PropTypes.number.isRequired,
        getNow: PropTypes.func.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object,
        localizer: PropTypes.object.isRequired,
        resource: PropTypes.string,
      }
    : {}

const ResourceHeader = _ref => {
  let { label } = _ref
  return /*#__PURE__*/ React.createElement(React.Fragment, null, label)
}
ResourceHeader.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        label: PropTypes.node,
        index: PropTypes.number,
        resource: PropTypes.object,
      }
    : {}

class TimeGridHeader extends React.Component {
  constructor() {
    super(...arguments)
    this.handleHeaderClick = (date, view, e) => {
      e.preventDefault()
      notify(this.props.onDrillDown, [date, view])
    }
    this.renderRow = resource => {
      let {
        events,
        rtl,
        selectable,
        getNow,
        range,
        getters,
        localizer,
        accessors,
        components,
      } = this.props
      const resourceId = accessors.resourceId(resource)
      let eventsToDisplay = resource
        ? events.filter(event => accessors.resource(event) === resourceId)
        : events
      return /*#__PURE__*/ React.createElement(DateContentRow, {
        isAllDay: true,
        rtl: rtl,
        getNow: getNow,
        minRows: 2,
        range: range,
        events: eventsToDisplay,
        resourceId: resourceId,
        className: 'rbc-allday-cell',
        selectable: selectable,
        selected: this.props.selected,
        components: components,
        accessors: accessors,
        getters: getters,
        localizer: localizer,
        onSelect: this.props.onSelectEvent,
        onDoubleClick: this.props.onDoubleClickEvent,
        onKeyPress: this.props.onKeyPressEvent,
        onSelectSlot: this.props.onSelectSlot,
        longPressThreshold: this.props.longPressThreshold,
      })
    }
  }
  renderHeaderCells(range) {
    let {
      localizer,
      getDrilldownView,
      getNow,
      getters: { dayProp },
      components: { header: HeaderComponent = Header },
    } = this.props
    const today = getNow()
    return range.map((date, i) => {
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, 'dayFormat')
      const { className, style } = dayProp(date)
      let header = /*#__PURE__*/ React.createElement(HeaderComponent, {
        date: date,
        label: label,
        localizer: localizer,
      })
      return /*#__PURE__*/ React.createElement(
        'div',
        {
          key: i,
          style: style,
          className: clsx(
            'rbc-header',
            className,
            eq(date, today, 'day') && 'rbc-today'
          ),
        },
        drilldownView
          ? /*#__PURE__*/ React.createElement(
              'a',
              {
                href: '#',
                onClick: e => this.handleHeaderClick(date, drilldownView, e),
              },
              header
            )
          : /*#__PURE__*/ React.createElement('span', null, header)
      )
    })
  }
  render() {
    let {
      width,
      rtl,
      resources,
      range,
      events,
      getNow,
      accessors,
      selectable,
      components,
      getters,
      scrollRef,
      localizer,
      isOverflowing,
      components: {
        timeGutterHeader: TimeGutterHeader,
        resourceHeader: ResourceHeaderComponent = ResourceHeader,
      },
    } = this.props
    let style = {}
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = scrollbarSize() + 'px'
    }
    const groupedEvents = resources.groupEvents(events)
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        style: style,
        ref: scrollRef,
        className: clsx('rbc-time-header', isOverflowing && 'rbc-overflowing'),
      },
      /*#__PURE__*/ React.createElement(
        'div',
        {
          className: 'rbc-label rbc-time-header-gutter',
          style: {
            width,
            minWidth: width,
            maxWidth: width,
          },
        },
        TimeGutterHeader &&
          /*#__PURE__*/ React.createElement(TimeGutterHeader, null)
      ),
      resources.map((_ref, idx) => {
        let [id, resource] = _ref
        return /*#__PURE__*/ React.createElement(
          'div',
          {
            className: 'rbc-time-header-content',
            key: id || idx,
          },
          resource &&
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: 'rbc-row rbc-row-resource',
                key: 'resource_' + idx,
              },
              /*#__PURE__*/ React.createElement(
                'div',
                {
                  className: 'rbc-header',
                },
                /*#__PURE__*/ React.createElement(ResourceHeaderComponent, {
                  index: idx,
                  label: accessors.resourceTitle(resource),
                  resource: resource,
                })
              )
            ),
          /*#__PURE__*/ React.createElement(
            'div',
            {
              className:
                'rbc-row rbc-time-header-cell' +
                (range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''),
            },
            this.renderHeaderCells(range)
          ),
          /*#__PURE__*/ React.createElement(DateContentRow, {
            isAllDay: true,
            rtl: rtl,
            getNow: getNow,
            minRows: 2,
            range: range,
            events: groupedEvents.get(id) || [],
            resourceId: resource && id,
            className: 'rbc-allday-cell',
            selectable: selectable,
            selected: this.props.selected,
            components: components,
            accessors: accessors,
            getters: getters,
            localizer: localizer,
            onSelect: this.props.onSelectEvent,
            onDoubleClick: this.props.onDoubleClickEvent,
            onKeyPress: this.props.onKeyPressEvent,
            onSelectSlot: this.props.onSelectSlot,
            longPressThreshold: this.props.longPressThreshold,
          })
        )
      })
    )
  }
}
TimeGridHeader.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        range: PropTypes.array.isRequired,
        events: PropTypes.array.isRequired,
        resources: PropTypes.object,
        getNow: PropTypes.func.isRequired,
        isOverflowing: PropTypes.bool,
        rtl: PropTypes.bool,
        width: PropTypes.number,
        localizer: PropTypes.object.isRequired,
        accessors: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object.isRequired,
        selected: PropTypes.object,
        selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: PropTypes.number,
        onSelectSlot: PropTypes.func,
        onSelectEvent: PropTypes.func,
        onDoubleClickEvent: PropTypes.func,
        onKeyPressEvent: PropTypes.func,
        onDrillDown: PropTypes.func,
        getDrilldownView: PropTypes.func.isRequired,
        scrollRef: PropTypes.any,
      }
    : {}

const NONE = {}
function Resources(resources, accessors) {
  return {
    map(fn) {
      if (!resources) return [fn([NONE, null], 0)]
      return resources.map((resource, idx) =>
        fn([accessors.resourceId(resource), resource], idx)
      )
    },
    groupEvents(events) {
      const eventsByResource = new Map()
      if (!resources) {
        // Return all events if resources are not provided
        eventsByResource.set(NONE, events)
        return eventsByResource
      }
      events.forEach(event => {
        const id = accessors.resource(event) || NONE
        if (Array.isArray(id)) {
          id.forEach(item => {
            let resourceEvents = eventsByResource.get(item) || []
            resourceEvents.push(event)
            eventsByResource.set(item, resourceEvents)
          })
        } else {
          let resourceEvents = eventsByResource.get(id) || []
          resourceEvents.push(event)
          eventsByResource.set(id, resourceEvents)
        }
      })
      return eventsByResource
    },
  }
}

class TimeGrid extends Component {
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
      cancel(this.rafHandle)
      this.rafHandle = request(this.checkOverflow)
    }
    this.gutterRef = ref => {
      this.gutter = ref && findDOMNode(ref)
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
      notify(_this.props.onSelectEvent, args)
    }
    this.handleSelectAllDaySlot = (slots, slotInfo) => {
      const { onSelectSlot } = this.props
      notify(onSelectSlot, {
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
    this.memoizedResources = memoize((resources, accessors) =>
      Resources(resources, accessors)
    )
    this.state = {
      gutterWidth: undefined,
      isOverflowing: null,
    }
    this.scrollRef = /*#__PURE__*/ React.createRef()
    this.contentRef = /*#__PURE__*/ React.createRef()
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
    cancel(this.rafHandle)
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
      !eq(nextProps.range[0], range[0], 'minute') ||
      !eq(nextProps.scrollToTime, scrollToTime, 'minute')
    ) {
      this.calculateScroll(nextProps)
    }
  }
  renderEvents(range, events, now) {
    let {
      min,
      max,
      components,
      accessors,
      localizer,
      dayLayoutAlgorithm,
    } = this.props
    const resources = this.memoizedResources(this.props.resources, accessors)
    const groupedEvents = resources.groupEvents(events)
    return resources.map((_ref, i) => {
      let [id, resource] = _ref
      return range.map((date, jj) => {
        let daysEvents = (groupedEvents.get(id) || []).filter(event =>
          inRange$1(date, accessors.start(event), accessors.end(event), 'day')
        )
        return /*#__PURE__*/ React.createElement(
          DayColumn,
          _extends({}, this.props, {
            localizer: localizer,
            min: merge(date, min),
            max: merge(date, max),
            resource: resource && id,
            components: components,
            isNow: eq(date, now, 'day'),
            key: i + '-' + jj,
            date: date,
            events: daysEvents,
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
      if (inRange(event, start, end, accessors)) {
        let eStart = accessors.start(event),
          eEnd = accessors.end(event)
        if (
          accessors.allDay(event) ||
          (isJustDate(eStart) && isJustDate(eEnd)) ||
          (!showMultiDayTimes && !eq(eStart, eEnd, 'day'))
        ) {
          allDayEvents.push(event)
        } else {
          rangeEvents.push(event)
        }
      }
    })
    allDayEvents.sort((a, b) => sortEvents(a, b, accessors))
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        className: clsx(
          'rbc-time-view',
          resources && 'rbc-time-view-resources'
        ),
      },
      /*#__PURE__*/ React.createElement(TimeGridHeader, {
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
      /*#__PURE__*/ React.createElement(
        'div',
        {
          ref: this.contentRef,
          className: 'rbc-time-content',
          onScroll: this.handleScroll,
        },
        /*#__PURE__*/ React.createElement(TimeGutter, {
          date: start,
          ref: this.gutterRef,
          localizer: localizer,
          min: merge(start, min),
          max: merge(start, max),
          step: this.props.step,
          getNow: this.props.getNow,
          timeslots: this.props.timeslots,
          components: components,
          className: 'rbc-time-gutter',
          getters: getters,
        }),
        this.renderEvents(range, rangeEvents, getNow())
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
        const width = getWidth(this.gutter)
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
    const diffMillis = scrollToTime - startOf(scrollToTime, 'day')
    const totalMillis = diff(max, min)
    this._scrollRatio = diffMillis / totalMillis
  }
}
TimeGrid.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        events: PropTypes.array.isRequired,
        resources: PropTypes.array,
        step: PropTypes.number,
        timeslots: PropTypes.number,
        range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
        min: PropTypes.instanceOf(Date),
        max: PropTypes.instanceOf(Date),
        getNow: PropTypes.func.isRequired,
        scrollToTime: PropTypes.instanceOf(Date),
        showMultiDayTimes: PropTypes.bool,
        rtl: PropTypes.bool,
        width: PropTypes.number,
        accessors: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object.isRequired,
        localizer: PropTypes.object.isRequired,
        selected: PropTypes.object,
        selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: PropTypes.number,
        onNavigate: PropTypes.func,
        onSelectSlot: PropTypes.func,
        onSelectEnd: PropTypes.func,
        onSelectStart: PropTypes.func,
        onSelectEvent: PropTypes.func,
        onDoubleClickEvent: PropTypes.func,
        onKeyPressEvent: PropTypes.func,
        onDrillDown: PropTypes.func,
        getDrilldownView: PropTypes.func.isRequired,
        dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
      }
    : {}
TimeGrid.defaultProps = {
  step: 30,
  timeslots: 2,
  min: startOf(new Date(), 'day'),
  max: endOf(new Date(), 'day'),
  scrollToTime: startOf(new Date(), 'day'),
}

const _excluded$3 = ['date']
class Day extends React.Component {
  render() {
    let _this$props = this.props,
      { date } = _this$props,
      props = _objectWithoutPropertiesLoose(_this$props, _excluded$3)
    let range = Day.range(date)
    return /*#__PURE__*/ React.createElement(
      TimeGrid,
      _extends({}, props, {
        range: range,
        eventOffset: 10,
      })
    )
  }
}
Day.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        date: PropTypes.instanceOf(Date).isRequired,
      }
    : {}
Day.range = date => {
  return [startOf(date, 'day')]
}
Day.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return add(date, -1, 'day')
    case navigate.NEXT:
      return add(date, 1, 'day')
    default:
      return date
  }
}
Day.title = (date, _ref) => {
  let { localizer } = _ref
  return localizer.format(date, 'dayHeaderFormat')
}

const _excluded$4 = ['date']
class Week extends React.Component {
  render() {
    let _this$props = this.props,
      { date } = _this$props,
      props = _objectWithoutPropertiesLoose(_this$props, _excluded$4)
    let range = Week.range(date, this.props)
    return /*#__PURE__*/ React.createElement(
      TimeGrid,
      _extends({}, props, {
        range: range,
        eventOffset: 15,
      })
    )
  }
}
Week.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        date: PropTypes.instanceOf(Date).isRequired,
      }
    : {}
Week.defaultProps = TimeGrid.defaultProps
Week.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return add(date, -1, 'week')
    case navigate.NEXT:
      return add(date, 1, 'week')
    default:
      return date
  }
}
Week.range = (date, _ref) => {
  let { localizer } = _ref
  let firstOfWeek = localizer.startOfWeek()
  let start = startOf(date, 'week', firstOfWeek)
  let end = endOf(date, 'week', firstOfWeek)
  return range(start, end)
}
Week.title = (date, _ref2) => {
  let { localizer } = _ref2
  let [start, ...rest] = Week.range(date, {
    localizer,
  })
  return localizer.format(
    {
      start,
      end: rest.pop(),
    },
    'dayRangeHeaderFormat'
  )
}

const _excluded$5 = ['date']
function workWeekRange(date, options) {
  return Week.range(date, options).filter(
    d => [6, 0].indexOf(d.getDay()) === -1
  )
}
class WorkWeek extends React.Component {
  render() {
    let _this$props = this.props,
      { date } = _this$props,
      props = _objectWithoutPropertiesLoose(_this$props, _excluded$5)
    let range = workWeekRange(date, this.props)
    return /*#__PURE__*/ React.createElement(
      TimeGrid,
      _extends({}, props, {
        range: range,
        eventOffset: 15,
      })
    )
  }
}
WorkWeek.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        date: PropTypes.instanceOf(Date).isRequired,
      }
    : {}
WorkWeek.defaultProps = TimeGrid.defaultProps
WorkWeek.range = workWeekRange
WorkWeek.navigate = Week.navigate
WorkWeek.title = (date, _ref) => {
  let { localizer } = _ref
  let [start, ...rest] = workWeekRange(date, {
    localizer,
  })
  return localizer.format(
    {
      start,
      end: rest.pop(),
    },
    'dayRangeHeaderFormat'
  )
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
  const headerRef = useRef(null)
  const dateColRef = useRef(null)
  const timeColRef = useRef(null)
  const contentRef = useRef(null)
  const tbodyRef = useRef(null)
  useEffect(() => {
    _adjustHeader()
  })
  const renderDay = (day, events, dayKey) => {
    const { event: Event, date: AgendaDate } = components
    events = events.filter(e =>
      inRange(e, startOf(day, 'day'), endOf(day, 'day'), accessors)
    )
    return events.map((event, idx) => {
      let title = accessors.title(event)
      let end = accessors.end(event)
      let start = accessors.start(event)
      const userProps = getters.eventProp(
        event,
        start,
        end,
        isSelected(event, selected)
      )
      let dateLabel = idx === 0 && localizer.format(day, 'agendaDateFormat')
      let first =
        idx === 0
          ? /*#__PURE__*/ React.createElement(
              'td',
              {
                rowSpan: events.length,
                className: 'rbc-agenda-date-cell',
              },
              AgendaDate
                ? /*#__PURE__*/ React.createElement(AgendaDate, {
                    day: day,
                    label: dateLabel,
                  })
                : dateLabel
            )
          : false
      return /*#__PURE__*/ React.createElement(
        'tr',
        {
          key: dayKey + '_' + idx,
          className: userProps.className,
          style: userProps.style,
        },
        first,
        /*#__PURE__*/ React.createElement(
          'td',
          {
            className: 'rbc-agenda-time-cell',
          },
          timeRangeLabel(day, event)
        ),
        /*#__PURE__*/ React.createElement(
          'td',
          {
            className: 'rbc-agenda-event-cell',
          },
          Event
            ? /*#__PURE__*/ React.createElement(Event, {
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
      if (eq(start, end)) {
        label = localizer.format(start, 'agendaTimeFormat')
      } else if (eq(start, end, 'day')) {
        label = localizer.format(
          {
            start,
            end,
          },
          'agendaTimeRangeFormat'
        )
      } else if (eq(day, start, 'day')) {
        label = localizer.format(start, 'agendaTimeFormat')
      } else if (eq(day, end, 'day')) {
        label = localizer.format(end, 'agendaTimeFormat')
      }
    }
    if (gt(day, start, 'day')) labelClass = 'rbc-continues-prior'
    if (lt(day, end, 'day')) labelClass += ' rbc-continues-after'
    return /*#__PURE__*/ React.createElement(
      'span',
      {
        className: labelClass.trim(),
      },
      TimeComponent
        ? /*#__PURE__*/ React.createElement(TimeComponent, {
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
    _widths = [getWidth(firstRow.children[0]), getWidth(firstRow.children[1])]
    if (widths[0] !== _widths[0] || widths[1] !== _widths[1]) {
      dateColRef.current.style.width = _widths[0] + 'px'
      timeColRef.current.style.width = _widths[1] + 'px'
    }
    if (isOverflowing) {
      addClass(header, 'rbc-header-overflowing')
      header.style.marginRight = scrollbarSize() + 'px'
    } else {
      removeClass(header, 'rbc-header-overflowing')
    }
  }
  let { messages } = localizer
  let end = add(date, length, 'day')
  let range$1 = range(date, end, 'day')
  events = events.filter(event => inRange(event, date, end, accessors))
  events.sort((a, b) => +accessors.start(a) - +accessors.start(b))
  return /*#__PURE__*/ React.createElement(
    'div',
    {
      className: 'rbc-agenda-view',
    },
    events.length !== 0
      ? /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(
            'table',
            {
              ref: headerRef,
              className: 'rbc-agenda-table',
            },
            /*#__PURE__*/ React.createElement(
              'thead',
              null,
              /*#__PURE__*/ React.createElement(
                'tr',
                null,
                /*#__PURE__*/ React.createElement(
                  'th',
                  {
                    className: 'rbc-header',
                    ref: dateColRef,
                  },
                  messages.date
                ),
                /*#__PURE__*/ React.createElement(
                  'th',
                  {
                    className: 'rbc-header',
                    ref: timeColRef,
                  },
                  messages.time
                ),
                /*#__PURE__*/ React.createElement(
                  'th',
                  {
                    className: 'rbc-header',
                  },
                  messages.event
                )
              )
            )
          ),
          /*#__PURE__*/ React.createElement(
            'div',
            {
              className: 'rbc-agenda-content',
              ref: contentRef,
            },
            /*#__PURE__*/ React.createElement(
              'table',
              {
                className: 'rbc-agenda-table',
              },
              /*#__PURE__*/ React.createElement(
                'tbody',
                {
                  ref: tbodyRef,
                },
                range$1.map((day, idx) => renderDay(day, events, idx))
              )
            )
          )
        )
      : /*#__PURE__*/ React.createElement(
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
        events: PropTypes.array,
        date: PropTypes.instanceOf(Date),
        length: PropTypes.number.isRequired,
        selected: PropTypes.object,
        accessors: PropTypes.object.isRequired,
        components: PropTypes.object.isRequired,
        getters: PropTypes.object.isRequired,
        localizer: PropTypes.object.isRequired,
      }
    : {}
Agenda.defaultProps = {
  length: 30,
}
Agenda.range = (start, _ref2) => {
  let { length = Agenda.defaultProps.length } = _ref2
  let end = add(start, length, 'day')
  return {
    start,
    end,
  }
}
Agenda.navigate = (date, action, _ref3) => {
  let { length = Agenda.defaultProps.length } = _ref3
  switch (action) {
    case navigate.PREVIOUS:
      return add(date, -length, 'day')
    case navigate.NEXT:
      return add(date, length, 'day')
    default:
      return date
  }
}
Agenda.title = (start, _ref4) => {
  let { length = Agenda.defaultProps.length, localizer } = _ref4
  let end = add(start, length, 'day')
  return localizer.format(
    {
      start,
      end,
    },
    'agendaHeaderFormat'
  )
}

const VIEWS = {
  [views.MONTH]: MonthView,
  [views.WEEK]: Week,
  [views.WORK_WEEK]: WorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
}

const _excluded$6 = ['action', 'date', 'today']
function moveDate(View, _ref) {
  let { action, date, today } = _ref,
    props = _objectWithoutPropertiesLoose(_ref, _excluded$6)
  View = typeof View === 'string' ? VIEWS[View] : View
  switch (action) {
    case navigate.TODAY:
      date = today || new Date()
      break
    case navigate.DATE:
      break
    default:
      !(View && typeof View.navigate === 'function')
        ? process.env.NODE_ENV !== 'production'
          ? invariant(
              false,
              'Calendar View components must implement a static `.navigate(date, action)` method.s'
            )
          : invariant(false)
        : void 0
      date = View.navigate(date, action, props)
  }
  return date
}

class Toolbar extends React.Component {
  constructor() {
    super(...arguments)
    this.navigate = action => {
      this.props.onNavigate(action)
    }
    this.view = view => {
      this.props.onView(view)
    }
  }
  render() {
    let {
      localizer: { messages },
      label,
    } = this.props
    return /*#__PURE__*/ React.createElement(
      'div',
      {
        className: 'rbc-toolbar',
      },
      /*#__PURE__*/ React.createElement(
        'span',
        {
          className: 'rbc-btn-group',
        },
        /*#__PURE__*/ React.createElement(
          'button',
          {
            type: 'button',
            onClick: this.navigate.bind(null, navigate.TODAY),
          },
          messages.today
        ),
        /*#__PURE__*/ React.createElement(
          'button',
          {
            type: 'button',
            onClick: this.navigate.bind(null, navigate.PREVIOUS),
          },
          messages.previous
        ),
        /*#__PURE__*/ React.createElement(
          'button',
          {
            type: 'button',
            onClick: this.navigate.bind(null, navigate.NEXT),
          },
          messages.next
        )
      ),
      /*#__PURE__*/ React.createElement(
        'span',
        {
          className: 'rbc-toolbar-label',
        },
        label
      ),
      /*#__PURE__*/ React.createElement(
        'span',
        {
          className: 'rbc-btn-group',
        },
        this.viewNamesGroup(messages)
      )
    )
  }
  viewNamesGroup(messages) {
    let viewNames = this.props.views
    const view = this.props.view
    if (viewNames.length > 1) {
      return viewNames.map(name =>
        /*#__PURE__*/ React.createElement(
          'button',
          {
            type: 'button',
            key: name,
            className: clsx({
              'rbc-active': view === name,
            }),
            onClick: this.view.bind(null, name),
          },
          messages[name]
        )
      )
    }
  }
}
Toolbar.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        view: PropTypes.string.isRequired,
        views: PropTypes.arrayOf(PropTypes.string).isRequired,
        label: PropTypes.node.isRequired,
        localizer: PropTypes.object,
        onNavigate: PropTypes.func.isRequired,
        onView: PropTypes.func.isRequired,
      }
    : {}

/**
 * Retrieve via an accessor-like property
 *
 *    accessor(obj, 'name')   // => retrieves obj['name']
 *    accessor(data, func)    // => retrieves func(data)
 *    ... otherwise null
 */
function accessor$1(data, field) {
  var value = null
  if (typeof field === 'function') value = field(data)
  else if (
    typeof field === 'string' &&
    typeof data === 'object' &&
    data != null &&
    field in data
  )
    value = data[field]
  return value
}
const wrapAccessor = acc => data => accessor$1(data, acc)

const _excluded$7 = ['view', 'date', 'getNow', 'onNavigate'],
  _excluded2$1 = [
    'view',
    'toolbar',
    'events',
    'style',
    'className',
    'elementProps',
    'date',
    'getNow',
    'length',
    'showMultiDayTimes',
    'onShowMore',
    'components',
    'formats',
    'messages',
    'culture',
  ]
function viewNames$1(_views) {
  return !Array.isArray(_views) ? Object.keys(_views) : _views
}
function isValidView(view, _ref) {
  let { views: _views } = _ref
  let names = viewNames$1(_views)
  return names.indexOf(view) !== -1
}

/**
 * react-big-calendar is a full featured Calendar component for managing events and dates. It uses
 * modern `flexbox` for layout, making it super responsive and performant. Leaving most of the layout heavy lifting
 * to the browser. __note:__ The default styles use `height: 100%` which means your container must set an explicit
 * height (feel free to adjust the styles to suit your specific needs).
 *
 * Big Calendar is unopiniated about editing and moving events, preferring to let you implement it in a way that makes
 * the most sense to your app. It also tries not to be prescriptive about your event data structures, just tell it
 * how to find the start and end datetimes and you can pass it whatever you want.
 *
 * One thing to note is that, `react-big-calendar` treats event start/end dates as an _exclusive_ range.
 * which means that the event spans up to, but not including, the end date. In the case
 * of displaying events on whole days, end dates are rounded _up_ to the next day. So an
 * event ending on `Apr 8th 12:00:00 am` will not appear on the 8th, whereas one ending
 * on `Apr 8th 12:01:00 am` will. If you want _inclusive_ ranges consider providing a
 * function `endAccessor` that returns the end date + 1 day for those events that end at midnight.
 */
class Calendar extends React.Component {
  constructor() {
    var _this
    super(...arguments)
    _this = this
    this.getViews = () => {
      const views = this.props.views
      if (Array.isArray(views)) {
        return transform(views, (obj, name) => (obj[name] = VIEWS[name]), {})
      }
      if (typeof views === 'object') {
        return mapValues(views, (value, key) => {
          if (value === true) {
            return VIEWS[key]
          }
          return value
        })
      }
      return VIEWS
    }
    this.getView = () => {
      const views = this.getViews()
      return views[this.props.view]
    }
    this.getDrilldownView = date => {
      const { view, drilldownView, getDrilldownView } = this.props
      if (!getDrilldownView) return drilldownView
      return getDrilldownView(date, view, Object.keys(this.getViews()))
    }
    /**
     *
     * @param date
     * @param viewComponent
     * @param {'month'|'week'|'work_week'|'day'|'agenda'} [view] - optional
     * parameter. It appears when range change on view changing. It could be handy
     * when you need to have both: range and view type at once, i.e. for manage rbc
     * state via url
     */
    this.handleRangeChange = (date, viewComponent, view) => {
      let { onRangeChange, localizer } = this.props
      if (onRangeChange) {
        if (viewComponent.range) {
          onRangeChange(
            viewComponent.range(date, {
              localizer,
            }),
            view
          )
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.error('onRangeChange prop not supported for this view')
          }
        }
      }
    }
    this.handleNavigate = (action, newDate) => {
      let _this$props = this.props,
        { view, date, getNow, onNavigate } = _this$props,
        props = _objectWithoutPropertiesLoose(_this$props, _excluded$7)
      let ViewComponent = this.getView()
      let today = getNow()
      date = moveDate(
        ViewComponent,
        _extends({}, props, {
          action,
          date: newDate || date || today,
          today,
        })
      )
      onNavigate(date, view, action)
      this.handleRangeChange(date, ViewComponent)
    }
    this.handleViewChange = view => {
      if (view !== this.props.view && isValidView(view, this.props)) {
        this.props.onView(view)
      }
      let views = this.getViews()
      this.handleRangeChange(
        this.props.date || this.props.getNow(),
        views[view],
        view
      )
    }
    this.handleSelectEvent = function() {
      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }
      notify(_this.props.onSelectEvent, args)
    }
    this.handleDoubleClickEvent = function() {
      for (
        var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2] = arguments[_key2]
      }
      notify(_this.props.onDoubleClickEvent, args)
    }
    this.handleKeyPressEvent = function() {
      for (
        var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3]
      }
      notify(_this.props.onKeyPressEvent, args)
    }
    this.handleSelectSlot = slotInfo => {
      notify(this.props.onSelectSlot, slotInfo)
    }
    this.handleDrillDown = (date, view) => {
      const { onDrillDown } = this.props
      if (onDrillDown) {
        onDrillDown(date, view, this.drilldownView)
        return
      }
      if (view) this.handleViewChange(view)
      this.handleNavigate(navigate.DATE, date)
    }
    this.state = {
      context: this.getContext(this.props),
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      context: this.getContext(nextProps),
    })
  }
  getContext(_ref2) {
    let {
      startAccessor,
      endAccessor,
      allDayAccessor,
      tooltipAccessor,
      titleAccessor,
      resourceAccessor,
      resourceIdAccessor,
      resourceTitleAccessor,
      eventPropGetter,
      slotPropGetter,
      slotGroupPropGetter,
      dayPropGetter,
      view,
      views,
      localizer,
      culture,
      messages: messages$1 = {},
      components = {},
      formats = {},
    } = _ref2
    let names = viewNames$1(views)
    const msgs = messages(messages$1)
    return {
      viewNames: names,
      localizer: mergeWithDefaults(localizer, culture, formats, msgs),
      getters: {
        eventProp: function() {
          return (eventPropGetter && eventPropGetter(...arguments)) || {}
        },
        slotProp: function() {
          return (slotPropGetter && slotPropGetter(...arguments)) || {}
        },
        slotGroupProp: function() {
          return (
            (slotGroupPropGetter && slotGroupPropGetter(...arguments)) || {}
          )
        },
        dayProp: function() {
          return (dayPropGetter && dayPropGetter(...arguments)) || {}
        },
      },
      components: defaults(components[view] || {}, omit(components, names), {
        eventWrapper: NoopWrapper,
        eventContainerWrapper: NoopWrapper,
        dateCellWrapper: NoopWrapper,
        weekWrapper: NoopWrapper,
        timeSlotWrapper: NoopWrapper,
      }),
      accessors: {
        start: wrapAccessor(startAccessor),
        end: wrapAccessor(endAccessor),
        allDay: wrapAccessor(allDayAccessor),
        tooltip: wrapAccessor(tooltipAccessor),
        title: wrapAccessor(titleAccessor),
        resource: wrapAccessor(resourceAccessor),
        resourceId: wrapAccessor(resourceIdAccessor),
        resourceTitle: wrapAccessor(resourceTitleAccessor),
      },
    }
  }
  render() {
    let _this$props2 = this.props,
      {
        view,
        toolbar,
        events,
        style,
        className,
        elementProps,
        date: current,
        getNow,
        length,
        showMultiDayTimes,
        onShowMore,
      } = _this$props2,
      props = _objectWithoutPropertiesLoose(_this$props2, _excluded2$1)
    current = current || getNow()
    let View = this.getView()
    const {
      accessors,
      components,
      getters,
      localizer,
      viewNames,
    } = this.state.context
    let CalToolbar = components.toolbar || Toolbar
    const label = View.title(current, {
      localizer,
      length,
    })
    return /*#__PURE__*/ React.createElement(
      'div',
      _extends({}, elementProps, {
        className: clsx(className, 'rbc-calendar', props.rtl && 'rbc-rtl'),
        style: style,
      }),
      toolbar &&
        /*#__PURE__*/ React.createElement(CalToolbar, {
          date: current,
          view: view,
          views: viewNames,
          label: label,
          onView: this.handleViewChange,
          onNavigate: this.handleNavigate,
          localizer: localizer,
        }),
      /*#__PURE__*/ React.createElement(
        View,
        _extends({}, props, {
          events: events,
          date: current,
          getNow: getNow,
          length: length,
          localizer: localizer,
          getters: getters,
          components: components,
          accessors: accessors,
          showMultiDayTimes: showMultiDayTimes,
          getDrilldownView: this.getDrilldownView,
          onNavigate: this.handleNavigate,
          onDrillDown: this.handleDrillDown,
          onSelectEvent: this.handleSelectEvent,
          onDoubleClickEvent: this.handleDoubleClickEvent,
          onKeyPressEvent: this.handleKeyPressEvent,
          onSelectSlot: this.handleSelectSlot,
          onShowMore: onShowMore,
        })
      )
    )
  }
}
Calendar.defaultProps = {
  elementProps: {},
  popup: false,
  toolbar: true,
  view: views.MONTH,
  views: [views.MONTH, views.WEEK, views.DAY, views.AGENDA],
  step: 30,
  length: 30,
  drilldownView: views.DAY,
  titleAccessor: 'title',
  tooltipAccessor: 'title',
  allDayAccessor: 'allDay',
  startAccessor: 'start',
  endAccessor: 'end',
  resourceAccessor: 'resourceId',
  resourceIdAccessor: 'id',
  resourceTitleAccessor: 'title',
  longPressThreshold: 250,
  getNow: () => new Date(),
  dayLayoutAlgorithm: 'overlap',
}
Calendar.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        localizer: PropTypes.object.isRequired,
        /**
         * Props passed to main calendar `<div>`.
         *
         */
        elementProps: PropTypes.object,
        /**
         * The current date value of the calendar. Determines the visible view range.
         * If `date` is omitted then the result of `getNow` is used; otherwise the
         * current date is used.
         *
         * @controllable onNavigate
         */
        date: PropTypes.instanceOf(Date),
        /**
         * The current view of the calendar.
         *
         * @default 'month'
         * @controllable onView
         */
        view: PropTypes.string,
        /**
         * The initial view set for the Calendar.
         * @type Calendar.Views ('month'|'week'|'work_week'|'day'|'agenda')
         * @default 'month'
         */
        defaultView: PropTypes.string,
        /**
         * An array of event objects to display on the calendar. Events objects
         * can be any shape, as long as the Calendar knows how to retrieve the
         * following details of the event:
         *
         *  - start time
         *  - end time
         *  - title
         *  - whether its an "all day" event or not
         *  - any resource the event may be related to
         *
         * Each of these properties can be customized or generated dynamically by
         * setting the various "accessor" props. Without any configuration the default
         * event should look like:
         *
         * ```js
         * Event {
         *   title: string,
         *   start: Date,
         *   end: Date,
         *   allDay?: boolean
         *   resource?: any,
         * }
         * ```
         */
        events: PropTypes.arrayOf(PropTypes.object),
        /**
         * Accessor for the event title, used to display event information. Should
         * resolve to a `renderable` value.
         *
         * ```js
         * string | (event: Object) => string
         * ```
         *
         * @type {(func|string)}
         */
        titleAccessor: accessor,
        /**
         * Accessor for the event tooltip. Should
         * resolve to a `renderable` value. Removes the tooltip if null.
         *
         * ```js
         * string | (event: Object) => string
         * ```
         *
         * @type {(func|string)}
         */
        tooltipAccessor: accessor,
        /**
         * Determines whether the event should be considered an "all day" event and ignore time.
         * Must resolve to a `boolean` value.
         *
         * ```js
         * string | (event: Object) => boolean
         * ```
         *
         * @type {(func|string)}
         */
        allDayAccessor: accessor,
        /**
         * The start date/time of the event. Must resolve to a JavaScript `Date` object.
         *
         * ```js
         * string | (event: Object) => Date
         * ```
         *
         * @type {(func|string)}
         */
        startAccessor: accessor,
        /**
         * The end date/time of the event. Must resolve to a JavaScript `Date` object.
         *
         * ```js
         * string | (event: Object) => Date
         * ```
         *
         * @type {(func|string)}
         */
        endAccessor: accessor,
        /**
         * Returns the id of the `resource` that the event is a member of. This
         * id should match at least one resource in the `resources` array.
         *
         * ```js
         * string | (event: Object) => Date
         * ```
         *
         * @type {(func|string)}
         */
        resourceAccessor: accessor,
        /**
         * An array of resource objects that map events to a specific resource.
         * Resource objects, like events, can be any shape or have any properties,
         * but should be uniquly identifiable via the `resourceIdAccessor`, as
         * well as a "title" or name as provided by the `resourceTitleAccessor` prop.
         */
        resources: PropTypes.arrayOf(PropTypes.object),
        /**
         * Provides a unique identifier for each resource in the `resources` array
         *
         * ```js
         * string | (resource: Object) => any
         * ```
         *
         * @type {(func|string)}
         */
        resourceIdAccessor: accessor,
        /**
         * Provides a human readable name for the resource object, used in headers.
         *
         * ```js
         * string | (resource: Object) => any
         * ```
         *
         * @type {(func|string)}
         */
        resourceTitleAccessor: accessor,
        /**
         * Determines the current date/time which is highlighted in the views.
         *
         * The value affects which day is shaded and which time is shown as
         * the current time. It also affects the date used by the Today button in
         * the toolbar.
         *
         * Providing a value here can be useful when you are implementing time zones
         * using the `startAccessor` and `endAccessor` properties.
         *
         * @type {func}
         * @default () => new Date()
         */
        getNow: PropTypes.func,
        /**
         * Callback fired when the `date` value changes.
         *
         * @controllable date
         */
        onNavigate: PropTypes.func,
        /**
         * Callback fired when the `view` value changes.
         *
         * @controllable view
         */
        onView: PropTypes.func,
        /**
         * Callback fired when date header, or the truncated events links are clicked
         *
         */
        onDrillDown: PropTypes.func,
        /**
         *
         * ```js
         * (dates: Date[] | { start: Date; end: Date }, view: 'month'|'week'|'work_week'|'day'|'agenda'|undefined) => void
         * ```
         *
         * Callback fired when the visible date range changes. Returns an Array of dates
         * or an object with start and end dates for BUILTIN views. Optionally new `view`
         * will be returned when callback called after view change.
         *
         * Custom views may return something different.
         */
        onRangeChange: PropTypes.func,
        /**
         * A callback fired when a date selection is made. Only fires when `selectable` is `true`.
         *
         * ```js
         * (
         *   slotInfo: {
         *     start: Date,
         *     end: Date,
         *     resourceId:  (number|string),
         *     slots: Array<Date>,
         *     action: "select" | "click" | "doubleClick",
         *     bounds: ?{ // For "select" action
         *       x: number,
         *       y: number,
         *       top: number,
         *       right: number,
         *       left: number,
         *       bottom: number,
         *     },
         *     box: ?{ // For "click" or "doubleClick" actions
         *       clientX: number,
         *       clientY: number,
         *       x: number,
         *       y: number,
         *     },
         *   }
         * ) => any
         * ```
         */
        onSelectSlot: PropTypes.func,
        /**
         * Callback fired when a calendar event is selected.
         *
         * ```js
         * (event: Object, e: SyntheticEvent) => any
         * ```
         *
         * @controllable selected
         */
        onSelectEvent: PropTypes.func,
        /**
         * Callback fired when a calendar event is clicked twice.
         *
         * ```js
         * (event: Object, e: SyntheticEvent) => void
         * ```
         */
        onDoubleClickEvent: PropTypes.func,
        /**
         * Callback fired when a focused calendar event recieves a key press.
         *
         * ```js
         * (event: Object, e: SyntheticEvent) => void
         * ```
         */
        onKeyPressEvent: PropTypes.func,
        /**
         * Callback fired when dragging a selection in the Time views.
         *
         * Returning `false` from the handler will prevent a selection.
         *
         * ```js
         * (range: { start: Date, end: Date, resourceId: (number|string) }) => ?boolean
         * ```
         */
        onSelecting: PropTypes.func,
        /**
         * Callback fired when a +{count} more is clicked
         *
         * ```js
         * (events: Object, date: Date) => any
         * ```
         */
        onShowMore: PropTypes.func,
        /**
         * The selected event, if any.
         */
        selected: PropTypes.object,
        /**
   * An array of built-in view names to allow the calendar to display.
   * accepts either an array of builtin view names,
   *
   * ```jsx
   * views={['month', 'day', 'agenda']}
   * ```
   * or an object hash of the view name and the component (or boolean for builtin).
   *
   * ```jsx
   * views={{
   *   month: true,
   *   week: false,
   *   myweek: WorkWeekViewComponent,
   * }}
   * ```
   *
   * Custom views can be any React component, that implements the following
   * interface:
   *
   * ```js
   * interface View {
   *   static title(date: Date, { formats: DateFormat[], culture: string?, ...props }): string
   *   static navigate(date: Date, action: 'PREV' | 'NEXT' | 'DATE'): Date
   * }
   * ```
   *
   * @type Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @View
   ['month', 'week', 'day', 'agenda']
   */
        views: views$1,
        /**
         * The string name of the destination view for drill-down actions, such
         * as clicking a date header, or the truncated events links. If
         * `getDrilldownView` is also specified it will be used instead.
         *
         * Set to `null` to disable drill-down actions.
         *
         * ```js
         * <Calendar
         *   drilldownView="agenda"
         * />
         * ```
         */
        drilldownView: PropTypes.string,
        /**
         * Functionally equivalent to `drilldownView`, but accepts a function
         * that can return a view name. It's useful for customizing the drill-down
         * actions depending on the target date and triggering view.
         *
         * Return `null` to disable drill-down actions.
         *
         * ```js
         * <Calendar
         *   getDrilldownView={(targetDate, currentViewName, configuredViewNames) =>
         *     if (currentViewName === 'month' && configuredViewNames.includes('week'))
         *       return 'week'
         *
         *     return null;
         *   }}
         * />
         * ```
         */
        getDrilldownView: PropTypes.func,
        /**
         * Determines the end date from date prop in the agenda view
         * date prop + length (in number of days) = end date
         */
        length: PropTypes.number,
        /**
         * Determines whether the toolbar is displayed
         */
        toolbar: PropTypes.bool,
        /**
         * Show truncated events in an overlay when you click the "+_x_ more" link.
         */
        popup: PropTypes.bool,
        /**
         * Distance in pixels, from the edges of the viewport, the "show more" overlay should be positioned.
         *
         * ```jsx
         * <Calendar popupOffset={30}/>
         * <Calendar popupOffset={{x: 30, y: 20}}/>
         * ```
         */
        popupOffset: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
          }),
        ]),
        /**
         * Allows mouse selection of ranges of dates/times.
         *
         * The 'ignoreEvents' option prevents selection code from running when a
         * drag begins over an event. Useful when you want custom event click or drag
         * logic
         */
        selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
        /**
         * Specifies the number of miliseconds the user must press and hold on the screen for a touch
         * to be considered a "long press." Long presses are used for time slot selection on touch
         * devices.
         *
         * @type {number}
         * @default 250
         */
        longPressThreshold: PropTypes.number,
        /**
         * Determines the selectable time increments in week and day views, in minutes.
         */
        step: PropTypes.number,
        /**
         * The number of slots per "section" in the time grid views. Adjust with `step`
         * to change the default of 1 hour long groups, with 30 minute slots.
         */
        timeslots: PropTypes.number,
        /**
         *Switch the calendar to a `right-to-left` read direction.
         */
        rtl: PropTypes.bool,
        /**
         * Optionally provide a function that returns an object of className or style props
         * to be applied to the the event node.
         *
         * ```js
         * (
         * 	event: Object,
         * 	start: Date,
         * 	end: Date,
         * 	isSelected: boolean
         * ) => { className?: string, style?: Object }
         * ```
         */
        eventPropGetter: PropTypes.func,
        /**
         * Optionally provide a function that returns an object of className or style props
         * to be applied to the time-slot node. Caution! Styles that change layout or
         * position may break the calendar in unexpected ways.
         *
         * ```js
         * (date: Date, resourceId: (number|string)) => { className?: string, style?: Object }
         * ```
         */
        slotPropGetter: PropTypes.func,
        /**
         * Optionally provide a function that returns an object of props to be applied
         * to the time-slot group node. Useful to dynamically change the sizing of time nodes.
         * ```js
         * () => { style?: Object }
         * ```
         */
        slotGroupPropGetter: PropTypes.func,
        /**
         * Optionally provide a function that returns an object of className or style props
         * to be applied to the the day background. Caution! Styles that change layout or
         * position may break the calendar in unexpected ways.
         *
         * ```js
         * (date: Date) => { className?: string, style?: Object }
         * ```
         */
        dayPropGetter: PropTypes.func,
        /**
         * Support to show multi-day events with specific start and end times in the
         * main time grid (rather than in the all day header).
         *
         * **Note: This may cause calendars with several events to look very busy in
         * the week and day views.**
         */
        showMultiDayTimes: PropTypes.bool,
        /**
         * Constrains the minimum _time_ of the Day and Week views.
         */
        min: PropTypes.instanceOf(Date),
        /**
         * Constrains the maximum _time_ of the Day and Week views.
         */
        max: PropTypes.instanceOf(Date),
        /**
         * Determines how far down the scroll pane is initially scrolled down.
         */
        scrollToTime: PropTypes.instanceOf(Date),
        /**
         * Specify a specific culture code for the Calendar.
         *
         * **Note: it's generally better to handle this globally via your i18n library.**
         */
        culture: PropTypes.string,
        /**
         * Localizer specific formats, tell the Calendar how to format and display dates.
         *
         * `format` types are dependent on the configured localizer; both Moment and Globalize
         * accept strings of tokens according to their own specification, such as: `'DD mm yyyy'`.
         *
         * ```jsx
         * let formats = {
         *   dateFormat: 'dd',
         *
         *   dayFormat: (date, , localizer) =>
         *     localizer.format(date, 'DDD', culture),
         *
         *   dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
         *     localizer.format(start, { date: 'short' }, culture) + ' – ' +
         *     localizer.format(end, { date: 'short' }, culture)
         * }
         *
         * <Calendar formats={formats} />
         * ```
         *
         * All localizers accept a function of
         * the form `(date: Date, culture: ?string, localizer: Localizer) -> string`
         */
        formats: PropTypes.shape({
          /**
           * Format for the day of the month heading in the Month view.
           * e.g. "01", "02", "03", etc
           */
          dateFormat,
          /**
           * A day of the week format for Week and Day headings,
           * e.g. "Wed 01/04"
           *
           */
          dayFormat: dateFormat,
          /**
           * Week day name format for the Month week day headings,
           * e.g: "Sun", "Mon", "Tue", etc
           *
           */
          weekdayFormat: dateFormat,
          /**
           * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
           */
          timeGutterFormat: dateFormat,
          /**
           * Toolbar header format for the Month view, e.g "2015 April"
           *
           */
          monthHeaderFormat: dateFormat,
          /**
           * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
           */
          dayRangeHeaderFormat: dateRangeFormat,
          /**
           * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
           */
          dayHeaderFormat: dateFormat,
          /**
           * Toolbar header format for the Agenda view, e.g. "4/1/2015 – 5/1/2015"
           */
          agendaHeaderFormat: dateRangeFormat,
          /**
           * A time range format for selecting time slots, e.g "8:00am – 2:00pm"
           */
          selectRangeFormat: dateRangeFormat,
          agendaDateFormat: dateFormat,
          agendaTimeFormat: dateFormat,
          agendaTimeRangeFormat: dateRangeFormat,
          /**
           * Time range displayed on events.
           */
          eventTimeRangeFormat: dateRangeFormat,
          /**
           * An optional event time range for events that continue onto another day
           */
          eventTimeRangeStartFormat: dateFormat,
          /**
           * An optional event time range for events that continue from another day
           */
          eventTimeRangeEndFormat: dateFormat,
        }),
        /**
         * Customize how different sections of the calendar render by providing custom Components.
         * In particular the `Event` component can be specified for the entire calendar, or you can
         * provide an individual component for each view type.
         *
         * ```jsx
         * let components = {
         *   event: MyEvent, // used by each view (Month, Day, Week)
         *   eventWrapper: MyEventWrapper,
         *   eventContainerWrapper: MyEventContainerWrapper,
         *   dateCellWrapper: MyDateCellWrapper,
         *   timeSlotWrapper: MyTimeSlotWrapper,
         *   timeGutterHeader: MyTimeGutterWrapper,
         *   toolbar: MyToolbar,
         *   agenda: {
         *   	 event: MyAgendaEvent // with the agenda view use a different component to render events
         *     time: MyAgendaTime,
         *     date: MyAgendaDate,
         *   },
         *   day: {
         *     header: MyDayHeader,
         *     event: MyDayEvent,
         *   },
         *   week: {
         *     header: MyWeekHeader,
         *     event: MyWeekEvent,
         *   },
         *   month: {
         *     header: MyMonthHeader,
         *     dateHeader: MyMonthDateHeader,
         *     event: MyMonthEvent,
         *   }
         * }
         * <Calendar components={components} />
         * ```
         */
        components: PropTypes.shape({
          event: PropTypes.elementType,
          eventWrapper: PropTypes.elementType,
          eventContainerWrapper: PropTypes.elementType,
          dateCellWrapper: PropTypes.elementType,
          timeSlotWrapper: PropTypes.elementType,
          timeGutterHeader: PropTypes.elementType,
          resourceHeader: PropTypes.elementType,
          toolbar: PropTypes.elementType,
          agenda: PropTypes.shape({
            date: PropTypes.elementType,
            time: PropTypes.elementType,
            event: PropTypes.elementType,
          }),
          day: PropTypes.shape({
            header: PropTypes.elementType,
            event: PropTypes.elementType,
          }),
          week: PropTypes.shape({
            header: PropTypes.elementType,
            event: PropTypes.elementType,
          }),
          month: PropTypes.shape({
            header: PropTypes.elementType,
            dateHeader: PropTypes.elementType,
            event: PropTypes.elementType,
          }),
        }),
        /**
         * String messages used throughout the component, override to provide localizations
         */
        messages: PropTypes.shape({
          allDay: PropTypes.node,
          previous: PropTypes.node,
          next: PropTypes.node,
          today: PropTypes.node,
          month: PropTypes.node,
          week: PropTypes.node,
          day: PropTypes.node,
          agenda: PropTypes.node,
          date: PropTypes.node,
          time: PropTypes.node,
          event: PropTypes.node,
          noEventsInRange: PropTypes.node,
          showMore: PropTypes.func,
        }),
        /**
         * A day event layout(arrangement) algorithm.
         * `overlap` allows events to be overlapped.
         * `no-overlap` resizes events to avoid overlap.
         * or custom `Function(events, minimumStartDifference, slotMetrics, accessors)`
         */
        dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
      }
    : {}
var Calendar$1 = uncontrollable(Calendar, {
  view: 'onView',
  date: 'onNavigate',
  selected: 'onSelectEvent',
})

let dateRangeFormat$1 = (_ref, culture, local) => {
  let { start, end } = _ref
  return (
    local.format(start, 'L', culture) + ' – ' + local.format(end, 'L', culture)
  )
}
let timeRangeFormat = (_ref2, culture, local) => {
  let { start, end } = _ref2
  return (
    local.format(start, 'LT', culture) +
    ' – ' +
    local.format(end, 'LT', culture)
  )
}
let timeRangeStartFormat = (_ref3, culture, local) => {
  let { start } = _ref3
  return local.format(start, 'LT', culture) + ' – '
}
let timeRangeEndFormat = (_ref4, culture, local) => {
  let { end } = _ref4
  return ' – ' + local.format(end, 'LT', culture)
}
let weekRangeFormat = (_ref5, culture, local) => {
  let { start, end } = _ref5
  return (
    local.format(start, 'MMMM DD', culture) +
    ' – ' +
    local.format(end, eq(start, end, 'month') ? 'DD' : 'MMMM DD', culture)
  )
}
let formats = {
  dateFormat: 'DD',
  dayFormat: 'DD ddd',
  weekdayFormat: 'ddd',
  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,
  timeGutterFormat: 'LT',
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd MMM DD',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat$1,
  agendaDateFormat: 'ddd MMM DD',
  agendaTimeFormat: 'LT',
  agendaTimeRangeFormat: timeRangeFormat,
}
function moment(moment) {
  let locale = (m, c) => (c ? m.locale(c) : m)
  return new DateLocalizer({
    formats,
    firstOfWeek(culture) {
      let data = culture ? moment.localeData(culture) : moment.localeData()
      return data ? data.firstDayOfWeek() : 0
    },
    format(value, format, culture) {
      return locale(moment(value), culture).format(format)
    },
  })
}

let dateRangeFormat$2 = (_ref, culture, local) => {
  let { start, end } = _ref
  return (
    local.format(start, 'd', culture) + ' – ' + local.format(end, 'd', culture)
  )
}
let timeRangeFormat$1 = (_ref2, culture, local) => {
  let { start, end } = _ref2
  return (
    local.format(start, 't', culture) + ' – ' + local.format(end, 't', culture)
  )
}
let timeRangeStartFormat$1 = (_ref3, culture, local) => {
  let { start } = _ref3
  return local.format(start, 't', culture) + ' – '
}
let timeRangeEndFormat$1 = (_ref4, culture, local) => {
  let { end } = _ref4
  return ' – ' + local.format(end, 't', culture)
}
let weekRangeFormat$1 = (_ref5, culture, local) => {
  let { start, end } = _ref5
  return (
    local.format(start, 'MMM dd', culture) +
    ' – ' +
    local.format(end, eq(start, end, 'month') ? 'dd' : 'MMM dd', culture)
  )
}
let formats$1 = {
  dateFormat: 'dd',
  dayFormat: 'ddd dd/MM',
  weekdayFormat: 'ddd',
  selectRangeFormat: timeRangeFormat$1,
  eventTimeRangeFormat: timeRangeFormat$1,
  eventTimeRangeStartFormat: timeRangeStartFormat$1,
  eventTimeRangeEndFormat: timeRangeEndFormat$1,
  timeGutterFormat: 't',
  monthHeaderFormat: 'Y',
  dayHeaderFormat: 'dddd MMM dd',
  dayRangeHeaderFormat: weekRangeFormat$1,
  agendaHeaderFormat: dateRangeFormat$2,
  agendaDateFormat: 'ddd MMM dd',
  agendaTimeFormat: 't',
  agendaTimeRangeFormat: timeRangeFormat$1,
}
function oldGlobalize(globalize) {
  function getCulture(culture) {
    return culture ? globalize.findClosestCulture(culture) : globalize.culture()
  }
  function firstOfWeek(culture) {
    culture = getCulture(culture)
    return (culture && culture.calendar.firstDay) || 0
  }
  return new DateLocalizer({
    firstOfWeek,
    formats: formats$1,
    format(value, format, culture) {
      return globalize.format(value, format, culture)
    },
  })
}

let dateRangeFormat$3 = (_ref, culture, local) => {
  let { start, end } = _ref
  return (
    local.format(
      start,
      {
        date: 'short',
      },
      culture
    ) +
    ' – ' +
    local.format(
      end,
      {
        date: 'short',
      },
      culture
    )
  )
}
let timeRangeFormat$2 = (_ref2, culture, local) => {
  let { start, end } = _ref2
  return (
    local.format(
      start,
      {
        time: 'short',
      },
      culture
    ) +
    ' – ' +
    local.format(
      end,
      {
        time: 'short',
      },
      culture
    )
  )
}
let timeRangeStartFormat$2 = (_ref3, culture, local) => {
  let { start } = _ref3
  return (
    local.format(
      start,
      {
        time: 'short',
      },
      culture
    ) + ' – '
  )
}
let timeRangeEndFormat$2 = (_ref4, culture, local) => {
  let { end } = _ref4
  return (
    ' – ' +
    local.format(
      end,
      {
        time: 'short',
      },
      culture
    )
  )
}
let weekRangeFormat$2 = (_ref5, culture, local) => {
  let { start, end } = _ref5
  return (
    local.format(start, 'MMM dd', culture) +
    ' – ' +
    local.format(end, eq(start, end, 'month') ? 'dd' : 'MMM dd', culture)
  )
}
let formats$2 = {
  dateFormat: 'dd',
  dayFormat: 'eee dd/MM',
  weekdayFormat: 'eee',
  selectRangeFormat: timeRangeFormat$2,
  eventTimeRangeFormat: timeRangeFormat$2,
  eventTimeRangeStartFormat: timeRangeStartFormat$2,
  eventTimeRangeEndFormat: timeRangeEndFormat$2,
  timeGutterFormat: {
    time: 'short',
  },
  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'eeee MMM dd',
  dayRangeHeaderFormat: weekRangeFormat$2,
  agendaHeaderFormat: dateRangeFormat$3,
  agendaDateFormat: 'eee MMM dd',
  agendaTimeFormat: {
    time: 'short',
  },
  agendaTimeRangeFormat: timeRangeFormat$2,
}
function globalize(globalize) {
  let locale = culture => (culture ? globalize(culture) : globalize)

  // return the first day of the week from the locale data. Defaults to 'world'
  // territory if no territory is derivable from CLDR.
  // Failing to use CLDR supplemental (not loaded?), revert to the original
  // method of getting first day of week.
  function firstOfWeek(culture) {
    try {
      const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const cldr = locale(culture).cldr
      const territory = cldr.attributes.territory
      const weekData = cldr.get('supplemental').weekData
      const firstDay = weekData.firstDay[territory || '001']
      return days.indexOf(firstDay)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'Failed to accurately determine first day of the week.' +
            ' Is supplemental data loaded into CLDR?'
        )
      }
      // maybe cldr supplemental is not loaded? revert to original method
      const date = new Date()
      //cldr-data doesn't seem to be zero based
      let localeDay = Math.max(
        parseInt(
          locale(culture).formatDate(date, {
            raw: 'e',
          }),
          10
        ) - 1,
        0
      )
      return Math.abs(date.getDay() - localeDay)
    }
  }
  if (!globalize.load) return oldGlobalize(globalize)
  return new DateLocalizer({
    firstOfWeek,
    formats: formats$2,
    format(value, format, culture) {
      format =
        typeof format === 'string'
          ? {
              raw: format,
            }
          : format
      return locale(culture).formatDate(value, format)
    },
  })
}

let dateRangeFormat$4 = (_ref, culture, local) => {
  let { start, end } = _ref
  return (
    local.format(start, 'P', culture) +
    ' \u2013 ' +
    local.format(end, 'P', culture)
  )
}
let timeRangeFormat$3 = (_ref2, culture, local) => {
  let { start, end } = _ref2
  return (
    local.format(start, 'p', culture) +
    ' \u2013 ' +
    local.format(end, 'p', culture)
  )
}
let timeRangeStartFormat$3 = (_ref3, culture, local) => {
  let { start } = _ref3
  return local.format(start, 'h:mma', culture) + ' \u2013 '
}
let timeRangeEndFormat$3 = (_ref4, culture, local) => {
  let { end } = _ref4
  return ' \u2013 ' + local.format(end, 'h:mma', culture)
}
let weekRangeFormat$3 = (_ref5, culture, local) => {
  let { start, end } = _ref5
  return (
    local.format(start, 'MMMM dd', culture) +
    ' \u2013 ' +
    local.format(end, eq(start, end, 'month') ? 'dd' : 'MMMM dd', culture)
  )
}
let formats$3 = {
  dateFormat: 'dd',
  dayFormat: 'dd eee',
  weekdayFormat: 'cccc',
  selectRangeFormat: timeRangeFormat$3,
  eventTimeRangeFormat: timeRangeFormat$3,
  eventTimeRangeStartFormat: timeRangeStartFormat$3,
  eventTimeRangeEndFormat: timeRangeEndFormat$3,
  timeGutterFormat: 'p',
  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'cccc MMM dd',
  dayRangeHeaderFormat: weekRangeFormat$3,
  agendaHeaderFormat: dateRangeFormat$4,
  agendaDateFormat: 'ccc MMM dd',
  agendaTimeFormat: 'p',
  agendaTimeRangeFormat: timeRangeFormat$3,
}
const dateFnsLocalizer = function(_ref6) {
  let { startOfWeek, getDay, format: _format, locales } = _ref6
  return new DateLocalizer({
    formats: formats$3,
    firstOfWeek(culture) {
      return getDay(
        startOfWeek(new Date(), {
          locale: locales[culture],
        })
      )
    },
    format(value, formatString, culture) {
      return _format(new Date(value), formatString, {
        locale: locales[culture],
      })
    },
  })
}

const components = {
  eventWrapper: NoopWrapper,
  timeSlotWrapper: NoopWrapper,
  dateCellWrapper: NoopWrapper,
}

export {
  Calendar$1 as Calendar,
  DateLocalizer,
  navigate as Navigate,
  views as Views,
  components,
  dateFnsLocalizer,
  globalize as globalizeLocalizer,
  moment as momentLocalizer,
  moveDate as move,
}
