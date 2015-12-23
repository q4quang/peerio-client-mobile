(function () {
    'use strict';

    /**
     * UI component containing messages/files/contacts tab selector
     */
    Peerio.UI.TabBar = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],
        componentWillMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onUnreadStateChanged(this.forceUpdate.bind(this, null))
            ];
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        //--- RENDER
        render: function () {
            var routes = this.getRoutes();
            var tab = routes[routes.length - 1].name;
            return (
                <div id="tabbar">
                    <Peerio.UI.TabBarButton text="Messages" active={tab === 'messages'}
                                            onActivate={this.transitionTo.bind(this, 'messages')}
                                            icon="comments-o"
                                            showBadge={Peerio.user.unreadState.conversations}/>

                    <Peerio.UI.TabBarButton text="Files" active={tab === 'files'}
                                            onActivate={this.transitionTo.bind(this, 'files')}
                                            icon="files-o"
                                            showBadge={Peerio.user.unreadState.files}/>

                    <Peerio.UI.TabBarButton text="Contacts" active={tab === 'contacts'}
                                            onActivate={this.transitionTo.bind(this, 'contacts')}
                                            icon="users"
                                            showBadge={Peerio.user.unreadState.contacts}/>

                </div>
            );
        }
    });

    /**
     * UI component for 1 tab in tabbar
     */
    Peerio.UI.TabBarButton = React.createClass({
        onTabTap: function () {
            //scroll to top on active tab tap.
            if (this.props.active) {
                var contentNode = _.first(document.querySelectorAll('.content'));
                TweenLite.to(contentNode, .5, {scrollTo: {y: 0}});
            } else {
                this.props.onActivate();
            }
        },
        render: function () {
            var tabClasses = 'tab';
            if (this.props.active) tabClasses += ' active';

            var badgeClasses = 'fa fa-circle badge';
            if (!this.props.showBadge) badgeClasses += ' hide';

            return (
                <Peerio.UI.Tappable element="div" ref="tab" className={tabClasses} onTap={this.onTabTap}>
                    <i className={'tab-icon fa fa-'+this.props.icon}></i>
                    {this.props.text}
                    <i className={badgeClasses}></i>
                </Peerio.UI.Tappable>
            );

        }
    });

}());
