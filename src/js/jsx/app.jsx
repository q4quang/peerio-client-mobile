(function () {
    'use strict';
    // Main component for app in authenticated state
    Peerio.UI.App = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State, Peerio.UI.Mixins.RouteTools],
        componentWillMount: function(){
            this.subscriptions = [
                Peerio.Dispatcher.onHardBackButton(this.handleHardwareBack),
                Peerio.Dispatcher.onTransitionTo(this.handleTransition),
                Peerio.Dispatcher.onTwoFactorAuthRequested(this.handle2FA)
            ];
        },
        componentWillUnmount: function(){
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        handleHardwareBack: function(){
            if(this.isAppRoot()) return;
            this.goBack();
        },
        // hack to allow out of router context components to navigate
        handleTransition: function(){
            this.transitionTo.apply(this, arguments);
        },
        handle2FA: function() {
            L.info('2fa requested');
            L.info(cachedRequest);
            this.transitionTo('/2fa');
        },
        render: function () {
            return (
                <div>
                    <Peerio.UI.NavBar/>
                    <Peerio.UI.SideBar/>
                    <RouteHandler/>
                    <Peerio.UI.Footer/>
                </div>
            );
        }
    });

}());
