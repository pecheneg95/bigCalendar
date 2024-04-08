'use strict'

exports.__esModule = true
exports.default = _default
exports.formats = void 0
var dates = _interopRequireWildcard(require('../utils/dates'))
var _localizer = require('../localizer')
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
let dateRangeFormat = (_ref, culture, local) => {
  let { start, end } = _ref
  return (
    local.format(start, 'd', culture) + ' – ' + local.format(end, 'd', culture)
  )
}
let timeRangeFormat = (_ref2, culture, local) => {
  let { start, end } = _ref2
  return (
    local.format(start, 't', culture) + ' – ' + local.format(end, 't', culture)
  )
}
let timeRangeStartFormat = (_ref3, culture, local) => {
  let { start } = _ref3
  return local.format(start, 't', culture) + ' – '
}
let timeRangeEndFormat = (_ref4, culture, local) => {
  let { end } = _ref4
  return ' – ' + local.format(end, 't', culture)
}
let weekRangeFormat = (_ref5, culture, local) => {
  let { start, end } = _ref5
  return (
    local.format(start, 'MMM dd', culture) +
    ' – ' +
    local.format(end, dates.eq(start, end, 'month') ? 'dd' : 'MMM dd', culture)
  )
}
let formats = {
  dateFormat: 'dd',
  dayFormat: 'ddd dd/MM',
  weekdayFormat: 'ddd',
  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,
  timeGutterFormat: 't',
  monthHeaderFormat: 'Y',
  dayHeaderFormat: 'dddd MMM dd',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,
  agendaDateFormat: 'ddd MMM dd',
  agendaTimeFormat: 't',
  agendaTimeRangeFormat: timeRangeFormat,
}
exports.formats = formats
function _default(globalize) {
  function getCulture(culture) {
    return culture ? globalize.findClosestCulture(culture) : globalize.culture()
  }
  function firstOfWeek(culture) {
    culture = getCulture(culture)
    return (culture && culture.calendar.firstDay) || 0
  }
  return new _localizer.DateLocalizer({
    firstOfWeek,
    formats,
    format(value, format, culture) {
      return globalize.format(value, format, culture)
    },
  })
}
