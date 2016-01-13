(function () {
    'use strict';


    Peerio.UI.ContactView = React.createClass({
        mixins: [ReactRouter.Navigation],
        componentWillMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onBigGreenButton(this.startConversationWithContact),
                Peerio.Dispatcher.onContactsUpdated(this.forceUpdate.bind(this, null))];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
            Peerio.Action.showBigGreenButton();
        },

        startConversationWithContact: function () {
            this.transitionTo('new_message', {id: this.contact.username});
        },


        handleAccept: function () {
            this.contact.accept().catch(function (ex) {
                L.error('Failed to accept contact request. {0}', ex);
                Peerio.Action.showAlert({text: 'Failed to accept contact request.'});
            });

        },

        handleReject: function () {
            this.contact.reject().catch(function (ex) {
                L.error('Failed to reject contact request. {0}', ex);
                Peerio.Action.showAlert({text: 'Failed to reject contact request.'});
            });
        },

        removeContactAndGoBack: function () {
            (this.contact.isRequest ? this.contact.cancelRequest() : this.contact.remove())
                .then(()=> this.goBack())
                .catch(function (ex) {
                    L.error('Failed to remove contact. {0}', ex);
                    Peerio.Action.showAlert({text: 'Failed to remove contact.'});
                });
        },

        handleRemove: function () {
            // asking confirmation for established contacts only
            if (!this.contact.isRequest) {
                Peerio.Action.showConfirm({
                    headline: 'Remove Contact?',
                    text: 'Are you sure you want to remove ' + this.contact.username +
                    ' from contacts? You will not be able to message and share files with this contact after removal.',
                    onAccept: this.removeContactAndGoBack
                });
            } else this.removeContactAndGoBack();
        },

        render: function () {
            this.contact = Peerio.user.contacts.dict[this.props.params.id]
                || Peerio.user.receivedContactRequests.dict[this.props.params.id]
                || Peerio.user.sentContactRequests.dict[this.props.params.id];

            if (!this.contact) {
                this.goBack();
                return null;
            }
            if(this.contact.isRequest)
                Peerio.Action.hideBigGreenButton();
            else
                Peerio.Action.showBigGreenButton();

            var buttons = [];

            if (!this.contact.isMe) {
                if (this.contact.isReceivedRequest) {
                    buttons.push(
                        <Peerio.UI.Tappable element="div" className="btn-safe"
                                            onTap={this.handleAccept}>Accept contact request
                        </Peerio.UI.Tappable>,
                        <Peerio.UI.Tappable element="div" className="btn-danger"
                                            onTap={this.handleReject}>Reject contact request
                        </Peerio.UI.Tappable>);

                } else buttons.push(
                    <Peerio.UI.Tappable element="div" className="btn-danger" onTap={this.handleRemove}>
                        Remove contact
                    </Peerio.UI.Tappable>);
            }

            var status = 'Established contact.';

            if (this.contact.isMe) {
                status = 'This is you';
            } else if (this.contact.isReceivedRequest) {
                status = 'Pending: you received request';
            } else if (this.contact.isRequest) {
                status = 'Pending: you sent request';
            }


            return (
                <div className="content-padded contact-view">

                    <div className="col-2 col-first">
                        <Peerio.UI.Avatar size="big" username={this.contact.username}
                                          className="contact-view-avatar"/>
                    </div>
                    <div className="col-10">
                        <span className="headline">{this.contact.fullName}</span>
                        <span
                            className="subhead-inline">{this.contact.username} { this.contact.isMe ? '(You)' : ''}</span>
                    </div>
                    <hr className="col-12"/>

                    <div className="info-blocks">

                        <div className="info-block">
                            <div className="info-label">Public Key</div>
                            <div className="text-mono">{this.contact.publicKey}</div>
                        </div>

                        <div className="info-block">
                            <div className="info-label">State:</div>
                            <div className="col-12 info-content">{status}</div>
                        </div>

                        <div className="info-block">
                            <div className="info-label">Primary address:</div>
                            <div className="col-12 info-content">{this.contact.primaryAddress || 'N/A'}</div>
                        </div>

                    </div>

                    <div className="flex-col flex-justify-start">{buttons}</div>

                </div>
            );

        }
    });

}());
