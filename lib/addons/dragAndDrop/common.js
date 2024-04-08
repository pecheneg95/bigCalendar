'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.nest = exports.mergeComponents = exports.dragAccessors = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectWithoutPropertiesLoose')
)
var _accessors = require('../../utils/accessors')
var _react = require('react')
const _excluded = ['children']
const dragAccessors = {
  start: (0, _accessors.wrapAccessor)(e => e.start),
  end: (0, _accessors.wrapAccessor)(e => e.end),
}
exports.dragAccessors = dragAccessors
const nest = function() {
  for (
    var _len = arguments.length, Components = new Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    Components[_key] = arguments[_key]
  }
  const factories = Components.filter(Boolean).map(_react.createFactory)
  const Nest = _ref => {
    let { children } = _ref,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded)
    return factories.reduceRight(
      (child, factory) => factory(props, child),
      children
    )
  }
  return Nest
}
exports.nest = nest
const mergeComponents = function(components, addons) {
  if (components === void 0) {
    components = {}
  }
  const keys = Object.keys(addons)
  const result = (0, _extends2.default)({}, components)
  keys.forEach(key => {
    result[key] = components[key]
      ? nest(components[key], addons[key])
      : addons[key]
  })
  return result
}
exports.mergeComponents = mergeComponents
