'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.DateLocalizer = void 0
exports.mergeWithDefaults = mergeWithDefaults
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _propTypes = _interopRequireDefault(require('prop-types'))
var _invariant = _interopRequireDefault(require('invariant'))
const localePropType = _propTypes.default.oneOfType([
  _propTypes.default.string,
  _propTypes.default.func,
])
function _format(localizer, formatter, value, format, culture) {
  let result =
    typeof format === 'function'
      ? format(value, culture, localizer)
      : formatter.call(localizer, value, format, culture)
  !(result == null || typeof result === 'string')
    ? process.env.NODE_ENV !== 'production'
      ? (0, _invariant.default)(
          false,
          '`localizer format(..)` must return a string, null, or undefined'
        )
      : (0, _invariant.default)(false)
    : void 0
  return result
}
class DateLocalizer {
  constructor(spec) {
    var _this = this
    !(typeof spec.format === 'function')
      ? process.env.NODE_ENV !== 'production'
        ? (0, _invariant.default)(
            false,
            'date localizer `format(..)` must be a function'
          )
        : (0, _invariant.default)(false)
      : void 0
    !(typeof spec.firstOfWeek === 'function')
      ? process.env.NODE_ENV !== 'production'
        ? (0, _invariant.default)(
            false,
            'date localizer `firstOfWeek(..)` must be a function'
          )
        : (0, _invariant.default)(false)
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
exports.DateLocalizer = DateLocalizer
function mergeWithDefaults(localizer, culture, formatOverrides, messages) {
  const formats = (0, _extends2.default)({}, localizer.formats, formatOverrides)
  return (0, _extends2.default)({}, localizer, {
    messages,
    startOfWeek: () => localizer.startOfWeek(culture),
    format: (value, format) =>
      localizer.format(value, formats[format] || format, culture),
  })
}
