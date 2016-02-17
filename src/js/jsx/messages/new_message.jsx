(function () {
    'use strict';

    Peerio.UI.NewMessage = React.createClass({
        mixins: [ReactRouter.Navigation],
        //--- REACT EVENTS
        getInitialState: function () {
            var recipients = this.props.params.id ? [this.props.params.id] : [];
            return {recipients: recipients, attachments: []};
        },
        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onFilesSelected(this.acceptFileSelection),
                Peerio.Dispatcher.onContactsSelected(this.acceptContactSelection),
                Peerio.Dispatcher.onBigGreenButton(this.send)
            ];

            if (this.state.recipients.length == 0) {
                this.openContactSelect();
            }
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        //--- CUSTOM FN
        send: function () {
            //todo validation
            if (!this.state.recipients.length) {
                return Peerio.Action.showAlert({text: 'Please select at least one contact to send your message to.'});
            }


            Peerio.Conversation().reply(this.state.recipients, this.refs.message.getDOMNode().value,
                this.state.attachments, this.refs.subject.getDOMNode().value).catch(err => {
                Peerio.Action.showAlert({text: 'Error sending message ' + err});
            });
            this.goBack();
        },
        openContactSelect: function () {
            Peerio.Action.showContactSelect({preselected: this.state.recipients.slice()});
        },
        acceptContactSelection: function (selection) {
            this.setState({recipients: selection});
        },
        openFileSelect: function () {
            Peerio.Action.showFileSelect({preselected: this.state.attachments.slice()});
        },
        acceptFileSelection: function (selection) {
            this.setState({attachments: selection});
        },

        detachFile: function (id) {
            this.setState({removed: id});
            var index = this.state.attachments.indexOf(id);

            setTimeout(() => {
                if(index != -1) {
                    this.state.attachments.splice(index, 1);
                    this.setState({attachments: this.state.attachments});
                      this.setState({removed: null});
                }},350);
        },

        //--- RENDER
        render: function () {
            var r = this.state.recipients.map(function (username) {
                var c = Peerio.user.contacts.dict[username];
                return <span className="name-selected" key={username}>
                {c && c.fullName || ''} &bull; {username}</span>;
            });
            return (
                <div className="content without-tab-bar">
                    <div id="new-message">
                        <Peerio.UI.Tappable className="recipients" onTap={this.openContactSelect}>
                            <div className="to">To:</div>
                            <div className="names">{r}</div>
                            <div className="add-btn">
                                <i className="material-icons">person</i>
                <span
                    className={'icon-counter' + (this.state.recipients.length ? '' : ' hide')}>{this.state.recipients.length}</span>
                            </div>
                        </Peerio.UI.Tappable>
                        <div className="subject-inputs">
                            <input type="text" ref="subject" className="subject" placeholder="Subject"/>

                            <Peerio.UI.Tappable className="attach-btn" onTap={this.openFileSelect}>
                                <i className="material-icons">attach_file</i>
                <span
                    className={'icon-counter' + (this.state.attachments.length ? '' : ' hide')}>{this.state.attachments.length}</span>
                </Peerio.UI.Tappable>
                        </div>
                        <ul className={'attached-files' + (this.state.attachments.length ? '' : ' removed')}>
                          {this.state.attachments.map(id => {
                              var file = Peerio.user.files.dict[id];

                              return (<li className={'attached-file' + (this.state.removed === id ? ' removed':'')}>
                                  { this.state.attachments.length ? file.name : null }
                                  <Peerio.UI.Tappable element="i" ref="{id}" className="material-icons" onTap={this.detachFile.bind(this, id)}>
                                    highlight_off
                                  </Peerio.UI.Tappable>
                                </li>); })
                              }

                        </ul>
                        <textarea ref="message" className="message" placeholder="Type your message"></textarea>
                    </div>
                </div>
            );
        }
    });

}());
