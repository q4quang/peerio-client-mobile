/**
 * Modal manager component
 * =======================
 *
 * Modal manager is supposed to be rendered in react portal.
 * Manages all instances of Peerio.UI.Alert components,
 *
 * Alerts can be created with Peerio.Action.showAlert()
 * ShowAlert accepts an object:
 *  {id: String, text:String||ReactComponent, btns: ReactComponent}
 * `id` and `btns` params are optional. If omitted, the Alert will generate an id and provide an 'OK' button,
 * which will destroy the alert when tapped.
 *
 * The `btns` param lets you place custom buttons into an alert.
 * If you pass custom buttons into the alert, you must also manage the alerts destruction.
 *
 * Alerts can be destroyed with Peerio.Action.RemoveAlert({id: AlertID }), so keep track of that ID.
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
      Peerio.Dispatcher.onRemoveAlert(this.removeAlert);

    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.handleShowAlert);
    },
    handleShowAlert: function (modalContent) {//{id, text, btns}
      var id = (modalContent.id) ? modalContent.id : uuid.v4();
      var newModal = {id: id, text: modalContent.text, btns: modalContent.btns};
      this.setState(function (prevState) {
        prevState.activeModals.push(newModal);
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
          <Peerio.UI.Alert onClose={this.removeAlert.bind(this, alert.id)} text={alert.text} btns={alert.btns} />
        );
      }

      return nodes.length > 0 ? (<div>{nodes}</div>) : null;
    }
  });

}());
