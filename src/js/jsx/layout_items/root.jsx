(function () {
    'use strict';
    // Main component, entry point for React app
    Peerio.UI.Root = React.createClass({
        componentWillMount: function () {
            Peerio.Dispatcher.onPause(Peerio.Net.pauseConnection);
            Peerio.Dispatcher.onResume(Peerio.Net.resumeConnection);

            Peerio.Dispatcher.onSetOnline( () => {
                L.info('Navigator tells me that he got the connection back');
                Peerio.Net.resumeConnection();
            });

            Peerio.Dispatcher.onSetOffline( () => {
                L.info('Navigator tells me that he is offline');
                Peerio.Net.pauseConnection();
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
