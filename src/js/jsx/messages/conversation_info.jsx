(function () {
    'use strict';

    Peerio.UI.ConversationInfo = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],
        getInitialState: function () {
            return {conversation: null};
        },
        componentWillMount: function () {
            Peerio.Dispatcher.onConversationsUpdated(this.loadConversation);
            this.loadConversation();
        },
        componentWillUnmout: function () {
            Peerio.Dispatcher.unsubscribe(this.loadConversation);
        },
        loadConversation: function (event) {
            if (event
                && event.updated && event.updated.length && event.updated.indexOf(this.props.params.id) === -1
                && event.deleted && event.deleted.length && event.deleted.indexOf(this.props.params.id) === -1)
                return;

            Peerio.Conversation(this.props.params.id)
                .load()
                .then(c => c.loadStats())
                .then(c => {
                    this.setState({conversation: c});
                })
                .catch(()=>this.goBack());
        },
        render: function () {
            var c = this.state.conversation;

            if (!c) return <Peerio.UI.FullViewSpinner/>;

            return (
                <div className="content without-tab-bar without-footer">
                  <div className="headline">{c.subject}</div>
                  <div className="subhead flex-row">
                    <span className="icon-with-label"><i
                      className="material-icons">event</i> {c.createdMoment.format('L')}</span>
                    <span className="icon-with-label"><i
                      className="material-icons">mode_comment</i> {c.messageCount}</span>
                    <span className="icon-with-label"><i
                      className="material-icons">insert_drive_file</i> {c.fileIDs.length}</span>
                    <span className="icon-with-label"><i
                      className="material-icons">people</i> {c.participants.length + c.exParticipantsArr.length}</span>
                  </div>


                  <ul className="compact-list-view">
                    <li>
                      <label>Participants</label>
                    </li>
                    {c.participants.map(u => <ContactNode username={u} key={u}/>)}
                    {c.exParticipantsArr.map(u => <ContactNode username={u} leftAt={c.exParticipants[u].moment} key={u}/>) }
                  </ul>



                    <ul className="compact-list-view">
                      <li><label>Shared Files</label></li>
                      { c.fileIDs.map(f => <FileNode id={f} key={f}/>)}
                    </ul>
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
            var f = this.state.file;
            // todo, maybe notice?
            if (!f) return null;

            return (
                <Peerio.UI.Tappable onTap={this.openFileView.bind(this, f.shortID)} element="li" className="list-item">
                        <i className={'file-type fa fa-' + Peerio.Helpers.getFileIconByName(f.name)}></i>
                        <div className="list-item-content txt-sm">
                            <span>{f.name}</span>
                            <div className="list-item-description">
                                Shared by <em>{f.sender || f.creator}</em> &bull; {f.moment.format('L')}
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
                <Peerio.UI.Tappable onTap={this.openContactView.bind(this, this.props.username)} element="li" className="contact list-item">

                        <Peerio.UI.Avatar username={this.props.username}/>

                        <div className="list-item-content">
                            <span
                                className={this.props.leftAt ? 'text-crossout':''}>{Peerio.user.contacts.getPropValByKey(this.props.username, 'fullName')}
                                ({this.props.username})</span>
                            {eventInfo}
                        </div>

                </Peerio.UI.Tappable>

            );
        }
    });

})();
