(function () {
    'use strict';

    /**
     * Message list item component
     */
    Peerio.UI.ConversationsItem = React.createClass({
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
            //<React.addons.CSSTransitionGroup style={{width:'100%', display:'flex'}} transitionName="fade" transitionAppear={true}
            //                                 transitionAppearTimeout={250}>
            return (
                <Peerio.UI.Tappable element="div" onTap={this.props.onTap} key={this.props.key} className={classes}>
                    <Peerio.UI.Swiper onSwipeLeft={this.openSwipe} onSwipeRight={this.closeSwipe}
                                      className="list-item-swipe-wrapper">

                        <div className="list-item-thumb">
                            {this.props.hasFiles ?
                                (<div className="icon-with-label">
                                    <i className={'fa fa-paperclip attachment'}></i>
                                </div>)
                                : null}
                        </div>

                        <div className="list-item-content">
                            <div className="list-item-sup">{this.props.username}</div>
                            {this.props.fullName && <div className="list-item-title">{this.props.fullName}</div>}
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
