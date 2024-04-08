'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireDefault(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var _constants = require('./utils/constants')
class Toolbar extends _react.default.Component {
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
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: 'rbc-toolbar',
      },
      /*#__PURE__*/ _react.default.createElement(
        'span',
        {
          className: 'rbc-btn-group',
        },
        /*#__PURE__*/ _react.default.createElement(
          'button',
          {
            type: 'button',
            onClick: this.navigate.bind(null, _constants.navigate.TODAY),
          },
          messages.today
        ),
        /*#__PURE__*/ _react.default.createElement(
          'button',
          {
            type: 'button',
            onClick: this.navigate.bind(null, _constants.navigate.PREVIOUS),
          },
          messages.previous
        ),
        /*#__PURE__*/ _react.default.createElement(
          'button',
          {
            type: 'button',
            onClick: this.navigate.bind(null, _constants.navigate.NEXT),
          },
          messages.next
        )
      ),
      /*#__PURE__*/ _react.default.createElement(
        'span',
        {
          className: 'rbc-toolbar-label',
        },
        label
      ),
      /*#__PURE__*/ _react.default.createElement(
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
        /*#__PURE__*/ _react.default.createElement(
          'button',
          {
            type: 'button',
            key: name,
            className: (0, _clsx.default)({
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
        view: _propTypes.default.string.isRequired,
        views: _propTypes.default.arrayOf(_propTypes.default.string).isRequired,
        label: _propTypes.default.node.isRequired,
        localizer: _propTypes.default.object,
        onNavigate: _propTypes.default.func.isRequired,
        onView: _propTypes.default.func.isRequired,
      }
    : {}
var _default = Toolbar
exports.default = _default
module.exports = exports.default
