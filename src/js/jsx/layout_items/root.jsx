(function () {
    'use strict';
    // Main component, entry point for React app
    Peerio.UI.Root = React.createClass({
        componentWillMount: function () {

            Peerio.Dispatcher.onSetOnline( () => {
                L.info('ONLINE event received from Navigator. Connecting socket. ');
                Peerio.Socket.connect();
            });

            Peerio.Dispatcher.onSetOffline( () => {
                L.info('OFFLINE event received from Navigator. Connecting socket. ');
                Peerio.Socket.disconnect();
            });

            Peerio.Dispatcher.onKeyboardDidShow(function () {
                if (!document.activeElement)return;
                var el = document.activeElement;
                if(Peerio.Helpers.getParentWithClass(el, 'no-scroll-hack')) {
                    return;
                }
                el.scrollIntoView({block: 'start', behavior: 'smooth'});
                // ios hack to make input update and move cursor to the right position
                el.value = el.value;
            });
            // no need to unsubscribe, this is the root component
        },
        render: function () {
            return (
                <div>
                    <RouteHandler/>
                    <Peerio.UI.Portal/>
                </div>
            );
        }
    });

}());
