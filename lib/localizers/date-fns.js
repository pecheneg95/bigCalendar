'use strict'

exports.__esModule = true
exports.formats = exports.default = void 0
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
    local.format(start, 'P', culture) +
    ' \u2013 ' +
    local.format(end, 'P', culture)
  )
}
let timeRangeFormat = (_ref2, culture, local) => {
  let { start, end } = _ref2
  return (
    local.format(start, 'p', culture) +
    ' \u2013 ' +
    local.format(end, 'p', culture)
  )
}
let timeRangeStartFormat = (_ref3, culture, local) => {
  let { start } = _ref3
  return local.format(start, 'h:mma', culture) + ' \u2013 '
}
let timeRangeEndFormat = (_ref4, culture, local) => {
  let { end } = _ref4
  return ' \u2013 ' + local.format(end, 'h:mma', culture)
}
let weekRangeFormat = (_ref5, culture, local) => {
  let { start, end } = _ref5
  return (
    local.format(start, 'MMMM dd', culture) +
    ' \u2013 ' +
    local.format(end, dates.eq(start, end, 'month') ? 'dd' : 'MMMM dd', culture)
  )
}
let formats = {
  dateFormat: 'dd',
  dayFormat: 'dd eee',
  weekdayFormat: 'cccc',
  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,
  timeGutterFormat: 'p',
  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'cccc MMM dd',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,
  agendaDateFormat: 'ccc MMM dd',
  agendaTimeFormat: 'p',
  agendaTimeRangeFormat: timeRangeFormat,
}
exports.formats = formats
const dateFnsLocalizer = function(_ref6) {
  let { startOfWeek, getDay, format: _format, locales } = _ref6
  return new _localizer.DateLocalizer({
    formats,
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
var _default = dateFnsLocalizer
exports.default = _default
