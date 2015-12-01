(function () {
    'use strict';

    Peerio.UI.Messages = React.createClass({
        mixins: [ReactRouter.Navigation],
        getInitialState: function () {
            return {currentYear: new Date().getFullYear()};
        },
        componentWillMount: function () {

        },
        componentDidMount: function () {
            Peerio.Messages.getAllConversations();

            this.subscriptions =
                [
                    Peerio.Dispatcher.onMessageAdded(function () {
                        this.forceUpdate();
                    }.bind(this)),
                    Peerio.Dispatcher.onConversationsUpdated(this.forceUpdate.bind(this, null))
                ];
            //used to format timestamp
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        openConversation: function (id) {
            this.transitionTo('conversation', {id: id});
        },
        destroyConversation: function (id) {
            Peerio.Messages.removeConversation(id);
        },
        render: function () {
            var nodes = Peerio.Messages.cache
                ? this.renderNodes()
                : Peerio.UI.ItemPlaceholder.getPlaceholdersArray();

            //New account placeholder
            //TODO: when new user has no contacts, add contact popup should appear instead of transitioning to contacts page.
            if (Peerio.Messages.cache && Peerio.Messages.cache.length === 0) {
                var intro_content = Peerio.user.contacts.arr.length > 1
                    ? <div>
                    <p>Peerio lets you send messages securely. Try it out by sending a message to one of your
                        contacts.</p>
                    <Peerio.UI.Tappable element="div" className="btn-md"
                                        onTap={this.transitionTo.bind(this, 'new_message')}>
                        <i className="fa fa-pencil"></i>&nbsp;Send a new message
                    </Peerio.UI.Tappable>
                </div>
                    : <div>
                    <p>Peerio lets you send messages securely. Add a contact and try it out.</p>
                    <Peerio.UI.Tappable element="div" className="btn-md"
                                        onTap={this.transitionTo.bind(this, 'contacts', null, {trigger:true})}>
                        <i className="fa fa-user-plus"></i>&nbsp;Add a contact
                    </Peerio.UI.Tappable>
                </div>;

                nodes = <div className="content-intro">
                    <img className="peerio-logo" src="media/img/peerio-logo-light.png"/>
                    <h1 className="headline-lrg">Welcome to Peerio!</h1>
                    {intro_content}
                    <img src="media/img/paper-plane.png"/>
                </div>;
            }

            return (
                <div className="content list-view" id="Messages" ref="messageList">
                    {nodes}
                </div>
            );
        },
        renderNodes: function () {
            return Peerio.Messages.cache.map(function (conv) {
                // building name to display for conversation item.
                // it should be in format "John Smith +3"
                // and it should not display current user's name,
                // unless he is the only one left in conversation
                if (!conv.username) {
                    var displayName = '';
                    for (var i = 0; i < conv.allParticipants.length; i++) {
                        var username = conv.allParticipants[i];
                        if (username === Peerio.user.username) continue;
                        var contact = Peerio.user.contacts.dict[username];
                        displayName = (contact && contact.fullName) || '';
                        break;
                    }
                    //displayName = displayName || Peerio.user.fullName;
                    if (conv.allParticipants.length > 2) {
                        displayName += ' [+' + (conv.allParticipants.length - 2) + ']';
                    }
                    conv.displayName = displayName;
                    conv.username = username;
                }

                return (
                    <Peerio.UI.MessagesItem onTap={this.openConversation.bind(this, conv.id)} key={conv.id}
                                            unread={conv.isModified} fullName={conv.displayName}
                                            username={conv.username}
                                            fileCount={conv.fileCount} timeStamp={moment(+conv.lastTimestamp)}
                                            messageCount={conv.messageCount} subject={conv.original.subject}
                                            onSwipe={this.toggleSwipe} swiped={this.state.swiped}
                                            currentYear={this.state.currentYear}
                                            destroyConversation={this.destroyConversation.bind(this, conv.id)}/>
                );
            }.bind(this));

        }
    });

    /**
     * Message list item component
     */
    Peerio.UI.MessagesItem = React.createClass({
        getInitialState: function () {
            return {swiped: false};
        },
        closeSwipe: function () {
            this.setState({swiped: false});
        },
        openSwipe: function () {
            this.setState({swiped: true});
        },
        destroyConversationAfterAnimate: function () {
            setTimeout(this.props.destroyConversation, 600);
        },
        destroyConversation: function () {
            this.setState({destroyAnimation: true}, this.destroyConversationAfterAnimate);
        },
        showDestroyDialog: function () {
            Peerio.Action.showConfirm({
                text: 'are you sure you want do delete this conversation? You will no longer receive messages or files within this conversation.',
                onAccept: this.destroyConversation
            });
        },
        render: function () {
            var cx = React.addons.classSet;
            var classes = cx({
                'list-item': true,
                'unread': this.props.unread,
                'swiped': this.state.swiped,
                'list-item-animation-leave': this.state.destroyAnimation
            });
            return (
                <Peerio.UI.Tappable element="div" onTap={this.props.onTap} key={this.props.key} className={classes}>
                    <Peerio.UI.Swiper onSwipeLeft={this.openSwipe} onSwipeRight={this.closeSwipe}
                                      className="list-item-swipe-wrapper">

                        <div className="list-item-thumb">
                            {this.props.fileCount ?
                                (<div className="icon-with-label">
                                    <i className={'fa fa-paperclip attachment'}></i>
                                    <span
                                        className="icon-label">{this.props.fileCount > 0 ? this.props.fileCount : null}</span>
                                </div>)
                                : ''}
                        </div>

                        <div className="list-item-content">
                            <div className="list-item-sup">{this.props.username}</div>
                            {this.props.fullName&&<div className="list-item-title">{this.props.fullName}</div>}
                            <div className="list-item-description">{this.props.subject}</div>
                        </div>

                        <div className="list-item-content text-right">
                            <div className="list-item-description">
                                {this.props.currentYear == this.props.timeStamp.year() ? this.props.timeStamp.format('MMM D') : this.props.timeStamp.format('MMM D, YYYY')}
                            </div>
                            <div className="list-item-description">
                                {this.props.timeStamp.format('h:mm a')}
                            </div>
                        </div>

                        <div className="list-item-forward">
                            <i className="fa fa-chevron-right"></i>
                        </div>

                        <Peerio.UI.Tappable className="list-item-swipe-content" onTap={this.showDestroyDialog}>
                            <i className="fa fa-trash-o"></i>
                        </Peerio.UI.Tappable>

                    </Peerio.UI.Swiper>
                </Peerio.UI.Tappable>

            );
        }
    });

}());
