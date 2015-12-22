(function () {
    'use strict';

    // Main component, entry point for React app
    Peerio.UI.Conversation = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],
        //----- REACT EVENTS
        getInitialState: function () {
            return {
                // unsent attachments to the message that will be sent next, if user taps "send"
                attachments: [],
                conversation: null
            };
        },
        componentWillMount: function () {
            Peerio.Conversation(this.props.params.id)
                .load()
                .then(c => this.setState({conversation: c}, this.disableIfLastParticipant)) //todo, also call disable on conv update
                .catch(err => {
                    Peerio.Action.showAlert({text: 'Failed to load covnersations'});
                    L.error('Failed to load conversations. {0}', err);
                });
        },
        componentDidMount: function () {

            // Peerio.Messages.markAsRead(this.state.conversation);

            this.subscriptions = [
                Peerio.Dispatcher.onBigGreenButton(this.sendMessage),
                Peerio.Dispatcher.onFilesSelected(this.acceptFileSelection)
            ];

            // to update relative timestamps
            this.renderInterval = window.setInterval(this.forceUpdate.bind(this), 20000);

        },
        componentWillUnmount: function () {
            window.clearInterval(this.renderInterval);
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        componentDidUpdate: function () {
//            this.scrollToBottom();
        },
        //----- CUSTOM FN
        openFileSelect: function () {
            Peerio.Action.showFileSelect({preselected: this.state.attachments.slice()});
        },
        acceptFileSelection: function (selection) {
            this.setState({attachments: selection});
        },

        sendAck: function () {
            Peerio.Messages.sendACK(this.state.conversation);
        },
        sendMessage: function () {
            var node = this.refs.reply.getDOMNode();
            if (node.value.isEmpty()) return;
            //Peerio.Messages.sendMessage(this.state.conversation.participants, '', node.value, this.state.attachments, this.state.conversation.id);
            node.value = '';
            this.resizeTextAreaAsync();
            this.setState({attachments: []});
        },
        resizeTextAreaAsync: function () {
            setTimeout(this.resizeTextArea, 0);
        },
        // grows textarea height with content up to max-height css property value
        // or shrinks down to 1 line
        resizeTextArea: function () {
            var node = this.refs.reply.getDOMNode();
            node.style.height = 'auto';
            node.style.height = node.scrollHeight + 'px';
        },
        scrollToBottom: function () {
            if (!this.refs.content)return;
            //bug #153 https://github.com/PeerioTechnologies/peerio-client-mobile/issues/153
            //on android, webview doesn't resize until after focus,
            //so we set a delay and hope the webview is resized by the time we scroll.
            var contentNode = this.refs.content.getDOMNode();
            setTimeout(function () {
                TweenLite.to(contentNode, .5, {scrollTo: {y: contentNode.scrollHeight}});
            }, 500);
        },
        disableIfLastParticipant: function () {
            // If I'm the only one who has left in this conversation
            if (this.state.conversation.participants.length === 1) {
                // But there were other people before
                if (this.state.conversation.exParticipants.length > 0) {
                    // then disable reply
                    this.setState({
                        textEntryDisabled: true,
                        placeholderText: 'There are no participants left in this conversation'
                    });
                } else {
                    // otherwise just inform user that this was never shared with anyone
                    this.setState({placeholderText: 'You are the only person in this conversation.'});
                }
            }
            else {
                // normal case
                this.setState({placeholderText: 'Type your message...'});
            }
        },

        getPrevPage: function (lastItem, pageSize) {
            var lastSeqID = lastItem ? lastItem.seqID : Number.MAX_SAFE_INTEGER;

            return Peerio.Conversation.getNextMessagesPage(this.props.params.id, lastSeqID, pageSize);
        },

        getPage: function (lastItem, pageSize) {
            var lastSeqID = lastItem ? lastItem.seqID : 0;
            return Peerio.Conversation.getPrevMessagesPage(this.props.params.id, lastSeqID, pageSize);
        },


        getPageMock: function (lastItem, pageSize) {
            return new Promise( (resolve, reject) => {
                var ds = this.state.conversation.messages;
                var rightIndex = lastItem ? 
                    ds.indexOf(lastItem) + pageSize + 1 : ds.length;
                var startIndex = rightIndex - pageSize;
                startIndex = startIndex < 0 ? 0 : startIndex;
                var itemsPage = ds.slice(startIndex, rightIndex);
                resolve( itemsPage ) ;
            });
        },

        getPrevPageMock: function (lastItem, pageSize) {
            return new Promise( (resolve, reject) => {
                var ds = this.state.conversation.messages;
                var startIndex = (lastItem ? 
                    ds.indexOf(lastItem) - pageSize : ds.length - pageSize);
                var rightIndex = startIndex + pageSize;
                startIndex = startIndex < 0 ? 0 : startIndex;
                var itemsPage = ds.slice(startIndex, rightIndex).reverse();
                resolve( itemsPage ) ;
            });
        },

        //----- RENDER
        render: function () {
            // todo: loading state
            if (!this.state.conversation) return <Peerio.UI.FullViewSpinner/>;
            // todo: more sophisticated logic for sending receipts, involving scrolling message into view detection
            // todo: also not trying to send receipts that were already sent?
            //Peerio.Data.sendReceipts(this.props.conversationId);
            var conversation = this.state.conversation;
            var participants = conversation.participants.map(function (username) {
                if (username === Peerio.user.username) return null;
                return (
                    <div key={username}>
                        <Peerio.UI.Avatar username={username}/>
                        {Peerio.user.contacts.getPropValByKey(username, 'fullNameAndUsername')}
                    </div>
                );
            });
            conversation.exParticipants.forEach(function (item) {
                participants.push(
                    <div key={item.u} className='former-participant'>
                    <Peerio.UI.Avatar username={item.u}/>
                    {Peerio.user.contacts.getPropValByKey(item.u, 'fullNameAndUsername')}
                    </div>
                );
            });

            // note: reply has fixed positioning and should not be nested in .content,
            // this causes unwanted scroll when typing into text box
            return (
                <div>
                    <Peerio.UI.ConversationHead 
                    subject={conversation.subject} 
                    participants={participants}
                    activeParticipantsCount={conversation.participants.length}
                    allParticipantsCount={conversation.participants.length+conversation.exParticipants.length}
                    conversationId={conversation.id}/>
 
                    <Peerio.UI.VScroll 
                    onGetPage={this.getPage} 
                    onGetPrevPage={this.getPrevPage} 
                    itemKeyName='id' 
                    itemComponent={Peerio.UI.ConversationItem}
                    itemParentData={conversation}
                    className="content with-reply-box without-tab-bar conversation" 
                    ref="content" 
                    key="content"
                    reverse="true"
                    />
                                                
                    <div id="reply">
                    <div className="reply-ack">
                    <i className="fa fa-thumbs-o-up icon-btn" onTouchEnd={this.sendAck}></i>
                    </div>

                    <textarea className={this.state.textEntryDisabled ?  'reply-input placeholder-warning':'reply-input'}
                    rows="1" ref="reply" placeholder={this.state.placeholderText} onKeyUp={this.resizeTextArea}
                    disabled={this.state.textEntryDisabled} onChange={this.resizeTextArea}
                    onFocus={this.scrollToBottom}></textarea>

                    <div className="reply-attach">
                    <i className="fa fa-paperclip icon-btn"
                    onTouchEnd={this.openFileSelect}>{this.state.attachments.length || ''}</i>
                    </div>
                    </div>
                </div>
            );
        }
    });
}());
