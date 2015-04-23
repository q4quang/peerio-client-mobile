/**
 * This is a custom alert component, which is a test of how React portals work.
 * Currently only login page uses it, the rest of the code uses window.alert/prompt/confirm
 *
 * We need to develop this to universal alert/prompt/confirm component,
 * and it should communicate through Peerio Actions and allow multiple alerts
 * active at the same time.
 *
 * Using it as a normal (non-portal) React component is not a good idea
 * because it creates strange problems with z-index on iOS WebView,
 * and it will be hard to layer multiple alerts properly.
 *
 */
(function () {
  'use strict';

  Peerio.UI.Alert = React.createClass({displayName: "Alert",
    render: function () {
      // open react portal
      return null;
    },
    // render it through the portal once, when mounter
    componentDidMount: function () {
      this.portal = document.createElement('div');
      document.body.appendChild(this.portal);
      this.renderAlert(this.props);
    },
    handleClose: function (e) {
      e.preventDefault();
      this.props.onClose();
    },
    renderAlert: function (props) {
      React.render(
        React.createElement("div", {className: props.visible ? '' : 'hide'}, 
          React.createElement("div", {className: "modal alert text-center"}, 
            React.createElement("div", {className: "vertical-center"}, 
              props.children, 
              React.createElement("button", {type: "button", id: "alertCloseBtn", onTouchStart: this.handleClose}, "OK")
            )
          ), 
          React.createElement("div", {className: "modal dim-background"})
        ),
        this.portal);
    },
    // render it when there are new props
    componentWillReceiveProps: function (newProps) {
      this.renderAlert(newProps);
    },
    // destroy portal
    componentWillUnmount: function () {
      React.unmountComponentAtNode(this.portal);
    }
  });

}());
