'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.getSlotMetrics = getSlotMetrics
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _memoizeOne = _interopRequireDefault(require('memoize-one'))
var dates = _interopRequireWildcard(require('./dates'))
var _eventLevels = require('./eventLevels')
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
let isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot
const isEqual = (a, b) =>
  a[0].range === b[0].range && a[0].events === b[0].events
function getSlotMetrics() {
  return (0, _memoizeOne.default)(options => {
    const { range, events, maxRows, minRows, accessors } = options
    let { first, last } = (0, _eventLevels.endOfRange)(range)
    let segments = events.map(evt =>
      (0, _eventLevels.eventSegments)(evt, range, accessors)
    )
    let { levels, extra } = (0, _eventLevels.eventLevels)(
      segments,
      Math.max(maxRows - 1, 1)
    )
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
        return metrics((0, _extends2.default)({}, options, args))
      },
      getDateForSlot(slotNumber) {
        return range[slotNumber]
      },
      getSlotForDate(date) {
        return range.find(r => dates.eq(r, date, 'day'))
      },
      getEventsForSlot(slot) {
        return segments
          .filter(seg => isSegmentInSlot(seg, slot))
          .map(seg => seg.event)
      },
      continuesPrior(event) {
        return dates.lt(accessors.start(event), first, 'day')
      },
      continuesAfter(event) {
        const eventEnd = accessors.end(event)
        const singleDayDuration = dates.eq(
          accessors.start(event),
          eventEnd,
          'minutes'
        )
        return singleDayDuration
          ? dates.gte(eventEnd, last, 'minutes')
          : dates.gt(eventEnd, last, 'minutes')
      },
    }
  }, isEqual)
}
