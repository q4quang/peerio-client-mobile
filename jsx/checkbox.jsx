/**
 * Checkbox component
 */
(function () {
  'use strict';

  Peerio.UI.CheckBox = React.createClass({
    getInitialState: function () {
      return {
        checked: this.props.checked
      };
    },
    handleTap: function () {
      var checked = !this.state.checked;
      this.setState({checked: checked});
      if(this.props.onChange) this.props.onChange(checked);
    },
    render: function () {
      return (<i className={"fa fa-" + (this.state.checked ? 'check-' : '') + 'square'} onTouchEnd={this.handleTap}></i>);
    }
  });

}());