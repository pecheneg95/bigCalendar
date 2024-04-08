'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireDefault(require('react'))
const Header = _ref => {
  let { label } = _ref
  return /*#__PURE__*/ _react.default.createElement('span', null, label)
}
Header.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        label: _propTypes.default.node,
      }
    : {}
var _default = Header
exports.default = _default
module.exports = exports.default
