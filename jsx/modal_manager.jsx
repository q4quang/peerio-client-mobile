/**
 * Modal manager component
 * =======================
 *
 * Modal manager is supposed to be rendered in react portal
 *
 */
(function () {
  'use strict';

  Peerio.UI.ModalManager = React.createClass({
    getInitialState: function () {
      return {
        activeModals: []
      };
    },
    componentWillMount: function () {
      Peerio.Dispatcher.onShowAlert(this.handleShowAlert);
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.handleShowAlert);
    },
    handleShowAlert: function (message) {
      this.setState(function (prevState) {
        prevState.activeModals.push({id: uuid.v4(), message: message});
      });
    },
    removeAlert: function (id) {
      for (var i = 0; i < this.state.activeModals.length; i++) {
        if (this.state.activeModals[i].id === id) {
          this.setState(function (prevState) {
            prevState.activeModals.splice(i, 1);
          });
          return;
        }
      }
    },
    render: function () {
      var nodes = [];
      for (var i = 0; i < this.state.activeModals.length; i++) {
        var alert = this.state.activeModals[i];
        nodes.push(
          <Peerio.UI.Alert onClose={this.removeAlert.bind(this, alert.id)}>
            {alert.message}
          </Peerio.UI.Alert>
        );
      }

      return nodes.length > 0 ? (<div>{nodes}</div>) : null;
    }
  });

}());
