// TODO

(function () {
  'use strict';

  Peerio.UI.ModalMenu = React.createClass({
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
        <div className={props.visible ? '' : 'hide'}>
          <div className="modal alert text-center">
            <div className="vertical-center">
            </div>
          </div>
          <div className="modal dim-background"></div>
        </div>,
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
