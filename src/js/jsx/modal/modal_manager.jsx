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
            // when adding a new modal, just add it here, everything else is universal
            this.subscriptios = [
                Peerio.Dispatcher.onShowAlert(this.showModal.bind(this, Peerio.UI.Alert)),
                Peerio.Dispatcher.onShowConfirm(this.showModal.bind(this, Peerio.UI.Confirm)),
                Peerio.Dispatcher.onShowPrompt(this.showModal.bind(this, Peerio.UI.Prompt)),
                Peerio.Dispatcher.onShowContactSelect(this.showModal.bind(this, Peerio.UI.ContactSelect)),
                Peerio.Dispatcher.onShowFileSelect(this.showModal.bind(this, Peerio.UI.FileSelect)),
                Peerio.Dispatcher.onShowFileUpload(this.showModal.bind(this, Peerio.UI.Upload)),
                Peerio.Dispatcher.onSyncStarted(this.showModal.bind(this, Peerio.UI.Sync)),

                Peerio.Dispatcher.onRemoveModal(this.removeModal)
            ];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptios);
        },

        // generic function to show modal
        showModal: function (component, modal) {
            modal = modal || {};
            modal.id = modal.id || uuid.v4();
            var props = _.assign({
                key: modal.id,
                onClose: this.removeModal.bind(this, modal.id)
            }, modal);
            modal.component = React.createElement(component, props);
           
            this.addModal(modal);
        },

        // adds a modal to rendered stack, {component: jsx code, id: id }
        addModal: function (modal) {
            this.setState(function (prevState) {
                prevState.activeModals.push(modal);
            });
        },

        // removes any rendered modal by id
        removeModal: function (id) {
            for (var i = 0; i < this.state.activeModals.length; i++) {
                if (this.state.activeModals[i].id === id) {
                    this.setState(function (prevState) {
                        // it's ok to access mutable 'i' in here, because once it's found it will not change
                        prevState.activeModals.splice(i, 1);
                    });
                    return;
                }
            }
        },

        render: function () {
            if (this.state.activeModals.length === 0) return null;

            // bluring active elemtn and hiding keyboard
            // so our modal looks normal and not like always
            if(document.activeElement) {
                document.activeElement.blur();
            }
            Peerio.NativeAPI.hideKeyboard();

            var nodes = [];
            for (var i = 0; i < this.state.activeModals.length; i++)
                nodes.push(this.state.activeModals[i].component);

            return (<div className={Peerio.runtime.platform}>{nodes}</div>);
        }
    });

}());
