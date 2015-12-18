(function () {
    'use strict';

    Peerio.UI.ConversationInfo = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],
        getInitialState: function () {
            return {conversation: null};
        },
        componentWillMount: function () {
            Peerio.Conversation(this.props.params.id)
                .load()
                .then(c => c.loadStats())
                .then(c => {
                    this.setState({conversation: c, fileIds: c.fileIds, msgCount: c.messageCount});
                });
        },
        render: function () {
            var conv = this.state.conversation;

            if (!conv || !this.state.fileIds) return <Peerio.UI.FullViewSpinner/>;

            return (
                <div className="content-padded">

                    <h1 className="headline">{conv.subject}</h1>

                    <h2 className="subhead">
                        <span className="icon-with-label"><i
                            className="fa fa-calendar-o"/>&nbsp;{conv.createdMoment.format('L')}</span>
                        <span className="icon-with-label"><i
                            className="fa fa-comment-o"/>&nbsp;{this.state.msgCount}</span>
                        <span className="icon-with-label"><i className="fa fa-file-o"/>&nbsp;{this.state.fileIds.length}</span>
                        <span className="icon-with-label"><i
                            className="fa fa-users"/>&nbsp;{conv.participants.length + conv.exParticipants.length}</span>
                    </h2>

                    <br/>

            <span className="info-label">
              Participants
            </span>

                    <div className="compact-list-view">
                        {conv.participants.map(p => <ContactNode username={p} key={p}/>)}
                        {conv.exParticipants.map(p => <ContactNode username={p.u} leftAt={p.moment} key={p.u}/>) }
                    </div>

                    <br/>

            <span className="info-label">
              Shared Files
            </span>
                    <div className="compact-list-view">
                        { this.state.fileIds.map(f =>  <FileNode id={f} key={f}/>)}
                    </div>
                </div>
            );
        }
    });

    //FileNode renders a single file in the conversation info component.
    var FileNode = React.createClass({
        mixins: [ReactRouter.Navigation],
        getInitialState: function () {
            return {file: Peerio.user.files.dict[this.props.id]};
        },
        openFileView: function (id) {
            this.transitionTo('file', {id: id});
        },
        render: function () {
            var f = this.state.file
            // todo, maybe notice?
            if (!f) return null;

            return (
                <Peerio.UI.Tappable onTap={this.openFileView.bind(this, f.shortId)}>
                    <div className="list-item">
                        <div className="list-item-thumb">
                            <i className={'file-type fa fa-' + Peerio.Helpers.getFileIconByName(f.name)}></i>
                        </div>
                        <div className="list-item-content txt-sm">
                            <span>{f.name}</span>
                            <div className="list-item-description">
                                Shared by <em>{f.sender || f.creator}</em>&nbsp;&bull;&nbsp;{f.moment.format('L')}
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
        openContactView: function () {
            this.transitionTo('contact', {id: this.props.username});
        },
        render: function () {
            var eventInfo = false;
            if (this.props.leftAt) {
                eventInfo = <div className="list-item-description">left : {this.props.leftAt.calendar()}</div>;
            }
            return (
                <Peerio.UI.Tappable onTap={this.openContactView.bind(this, this.props.username)}>
                    <div className="contact list-item">
                        <div className="list-item-thumb">
                            <Peerio.UI.Avatar username={this.props.username}/>
                        </div>
                        <div className="list-item-content">
                            <span
                                className={this.props.leftAt ? 'text-crossout':''}>{Peerio.user.contacts.getPropValByKey(this.props.username, 'fullName')}
                                ({this.props.username})</span>
                            {eventInfo}
                        </div>
                    </div>
                </Peerio.UI.Tappable>

            );
        }
    });

})();