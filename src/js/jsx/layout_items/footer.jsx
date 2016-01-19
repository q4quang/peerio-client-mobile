/**
 * Footer bar
 */
(function () {
    'use strict';

    Peerio.UI.Footer = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State, Peerio.UI.Mixins.RouteTools],
        getInitialState: function () {
            return {greenButtonIsVisible: true};
        },
        componentWillMount: function () {
            // route name: { button text, button action }
            // default action is Peerio.Action.bigGreenButton
            this.mainButtonActions = {
                messages: {
                    name: 'Compose message',
                    action: this.transitionTo.bind(this, 'new_message'),
                    icon: 'edit'
                },
                files: {name: 'Upload file', action: Peerio.Action.showFileUpload, icon: 'cloud_upload'},
                contacts: {name: 'Add contact', icon: 'person_add'},
                contact: {name: 'Send Message', icon: 'edit'},
                add_contact_import: {name: 'Import & Invite Contacts', icon: 'person_add'},
                add_contact_search: {name: 'Add Selected Contact', icon: 'person_add'},
                new_message: {name: 'Send', icon: 'send'},
                conversation: {name: 'Send', icon: 'send'}
            };

            this.subscriptions = [
                Peerio.Dispatcher.onHideBigGreenButton(()=>this.setState({greenButtonIsVisible: false})),
                Peerio.Dispatcher.onShowBigGreenButton(()=>this.setState({greenButtonIsVisible: true}))
            ];
        },
        componentWillUnmount: function(){
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        //--- RENDER
        render: function () {
            var greenButton = this.state.greenButtonIsVisible ? this.mainButtonActions[this.getRouteName()] : null;
            if (greenButton)
                greenButton = (
                    <Peerio.UI.Tappable element="div" className="btn-global-action"
                                        onTap={greenButton.action || Peerio.Action.bigGreenButton}>
                        <i className="material-icons">{greenButton.icon}</i> {greenButton.name}
                    </Peerio.UI.Tappable>);

            return (
                <div id="footer">
                    <Peerio.UI.Tappable element="div" id="global-back" className={this.isAppRoot() ? 'hide' : ''}
                                        onTap={this.goBack}>
                        <i className="material-icons">chevron_left</i> back
                    </Peerio.UI.Tappable>
                    {greenButton}
                </div>
            );
        }
    });

}());
