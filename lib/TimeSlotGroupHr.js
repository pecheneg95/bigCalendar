'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _clsx = _interopRequireDefault(require('clsx'))
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireWildcard(require('react'))
var _BackgroundWrapper = _interopRequireDefault(require('./BackgroundWrapper'))
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
class TimeSlotGroup extends _react.Component {
  render() {
    const {
      renderSlot,
      resource,
      group,
      getters,
      components: {
        timeSlotWrapper: Wrapper = _BackgroundWrapper.default,
      } = {},
    } = this.props
    const groupProps = getters ? getters.slotGroupProp() : {}
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      (0, _extends2.default)(
        {
          className: 'rbc-timeslot-group',
        },
        groupProps
      ),
      group.map((value, idx) => {
        const slotProps = getters ? getters.slotProp(value, resource) : {}
        return /*#__PURE__*/ _react.default.createElement(
          Wrapper,
          {
            key: idx,
            value: value,
            resource: resource,
          },
          /*#__PURE__*/ _react.default.createElement(
            'div',
            (0, _extends2.default)({}, slotProps, {
              className: (0, _clsx.default)(
                'rbc-time-slot',
                slotProps.className
              ),
            }),
            renderSlot && renderSlot(value, idx)
          )
        )
      })
    )
  }
}
exports.default = TimeSlotGroup
TimeSlotGroup.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        renderSlot: _propTypes.default.func,
        group: _propTypes.default.array.isRequired,
        resource: _propTypes.default.any,
        components: _propTypes.default.object,
        getters: _propTypes.default.object,
      }
    : {}
module.exports = exports.default
