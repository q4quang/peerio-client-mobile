// TODO

(function () {
  'use strict';

  Peerio.UI.ModalMenu = React.createClass({displayName: "ModalMenu",
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
            React.createElement("div", {className: "vertical-center"}
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
