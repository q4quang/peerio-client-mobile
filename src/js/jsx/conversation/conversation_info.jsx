(function () {
    'use strict';

    Peerio.UI.ConversationInfo = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],
        componentWillMount: function () {

            var conversation = Peerio.user.messages.dict[this.props.params.id];

            //TODO:fix when fileIDs are exposed to conversation.fileIDs
            var files = [];
            _.each(conversation.messages, function (message) {
                _.each(message.fileIDs, function (messageFileID) {
                    files.push(Peerio.user.files.dict[messageFileID]);
                });
            });
            this.setState({conversation: conversation, files: files});
        },
        render: function () {

            var c = this.state.conversation;
            var f = this.state.files;
            var info = {
                subject: c.original.subject,
                timestamp: c.original.moment.format('L'),
                messageCount: c.messageCount,
                fileCount: c.fileCount,
                participantCount: c.allParticipants.length,
                participants: c.allParticipants.map(function (p) {
                    return ( <ContactNode username={p} events={c.events}/> );
                }),
                files: f.map(function (f) {
                    return ( <FileNode file={f}/> );
                })
            };

            return (
                <div className="content-padded">

                    <h1 className="headline">{info.subject}</h1>

                    <h2 className="subhead">
                        <span className="icon-with-label"><i className="fa fa-calendar-o"/>&nbsp;{info.timestamp}</span>
                        <span className="icon-with-label"><i
                            className="fa fa-comment-o"/>&nbsp;{info.messageCount}</span>
                        <span className="icon-with-label"><i className="fa fa-file-o"/>&nbsp;{info.fileCount}</span>
                        <span className="icon-with-label"><i
                            className="fa fa-users"/>&nbsp;{info.participantCount}</span>
                    </h2>

                    <br/>

            <span className="info-label">
              Participants
            </span>

                    <div className="compact-list-view">
                        {info.participants}
                    </div>

                    <br/>

            <span className="info-label">
              Shared Files
            </span>
                    <div className="compact-list-view">
                        {info.files}
                    </div>
                </div>
            );
        }
    });

    //FileNode renders a single file in the conversation info component.
    var FileNode = React.createClass({
        mixins: [ReactRouter.Navigation],
        openFileView: function (id) {
            this.transitionTo('file', {id: id});
        },
        render: function () {
            var icon = Peerio.Helpers.getFileIconByName(this.props.file.name);
            var timestamp = moment(this.props.file.timestamp).format('L');
            var sharedBy = this.props.file.sender || this.props.file.creator;
            return (
                <Peerio.UI.Tappable onTap={this.openFileView.bind(this, this.props.file.shortId)}>
                    <div className="list-item">
                        <div className="list-item-thumb">
                            <i className={'file-type fa fa-'+icon}></i>
                        </div>
                        <div className="list-item-content txt-sm">
                            <span>{this.props.file.name}</span>
                            <div className="list-item-description">
                                Shared by <em>{sharedBy}</em>&nbsp;&bull;&nbsp;{timestamp}
                            </div>
                        </div>
                    </div>
                </Peerio.UI.Tappable>
            );
        }
    });

    //ContactNode renders a single contact in the conversation info component.
    var ContactNode = React.createClass({
        mixins: [ReactRouter.Navigation],
        componentWillMount: function () {
            var props = this.props;
            var contact = Peerio.user.contacts.dict[props.username];
            if (!contact) contact = {username: props.username, fullName: ''};

            contact.event = {};

            //_.each provides 'undefined' handling.
            _.each(this.props.events, function (event) {
                if (props.username === event.participant) {
                    contact = Peerio.user.contacts.dict[props.username];
                    contact.event = event;
                }
            });
            this.setState({username: this.props.username, contact: contact});
        },
        openContactView: function (username) {
            this.transitionTo('contact', {id: username});
        },
        render: function () {
            var timestamp = this.state.contact.event.timestamp ? moment(this.state.contact.event.timestamp).calendar() : false;
            var removed = this.state.contact.event.type == 'remove';
            var eventInfo = false;
            if (removed) {
                eventInfo = <div className="list-item-description">removed : {timestamp}</div>;
            }
            return (
                <Peerio.UI.Tappable onTap={this.openContactView.bind(this, this.state.contact.username)}>
                    <div className="contact list-item">
                        <div className="list-item-thumb">
                            <Peerio.UI.Avatar username={this.state.username}/>
                        </div>
                        <div className="list-item-content">
                            <span className={removed ? 'text-crossout':''}>{this.state.contact.fullName}
                                ({this.state.contact.username})</span>
                            {eventInfo}
                        </div>
                    </div>
                </Peerio.UI.Tappable>

            );
        }
    });

})();