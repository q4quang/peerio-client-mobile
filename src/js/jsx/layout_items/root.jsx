(function () {
    'use strict';
    // Main component, entry point for React app
    Peerio.UI.Root = React.createClass({
        componentWillMount: function () {
            // TODO: fix plugin
            // text inputs and text areas lose focus after initial keyboard show
            // we have this bloody hack to fix it
            Peerio.Dispatcher.onKeyboardDidShow(() => {
                if (document.activeElement && !this.keyboardHack) {
                    var activeElement = document.activeElement;
                    window.setTimeout(() => activeElement.blur(), 0);
                    window.setTimeout(() => activeElement.focus(), 0);
                    this.keyboardHack = true;
                    window.setTimeout(() => {
                        this.keyboardHack = null;
                    }, 1000);
                }
            });

            Peerio.Dispatcher.onTwoFactorAuthRequested(this.handle2FA);

            Peerio.Dispatcher.onOnline(() => {
                L.info('ONLINE event received from Navigator. Connecting socket. ');
                Peerio.Socket.connect();
            });

            Peerio.Dispatcher.onOffline(() => {
                L.info('OFFLINE event received from Navigator. Connecting socket. ');
                Peerio.Socket.disconnect();
            });

            Peerio.Dispatcher.onKeyboardDidShow(function () {
                if (!document.activeElement)return;
                var el = document.activeElement;
                if (Peerio.Helpers.getParentWithClass(el, 'no-scroll-hack')) {
                    return;
                }
                el.scrollIntoView({block: 'start', behavior: 'smooth'});
                // ios hack to make input update and move cursor to the right position
                el.value = el.value;
            });

            // version check might already be done by now
            if (Peerio.runtime.expired) this.notifyOnUpdate(true);
            else if (Peerio.runtime.updateAvailable) this.notifyOnUpdate();

            Peerio.Dispatcher.onUpdateAvailable(this.notifyOnUpdate);
            // no need to unsubscribe, this is the root component
        },
        notifyOnUpdate: function (expired) {
            var text = expired
                ? 'Your Peerio client is out-of-date and can’t connect to the server, please update to connect!'
                : 'An update is available, would you like to get the latest version of Peerio?';

            Peerio.Action.showConfirm({
                headline: 'Update',
                text: text,
                onAccept: ()=>Peerio.NativeAPI.openInBrowser('https://peerio.com')
            });
        },

        handle2FA: function (resolve, reject, retry) {
            L.info('2fa requested');
            Peerio.UI.Prompt.show({
                text: retry ? 'Code is incorrect. Please try again:' :'Please enter 2FA code:',
                inputType: 'numeric',
                autoSubmitLength: 6
            })
            .then( (code) => {
                L.info('2fa resend requested');
                Peerio.Net.validate2FA(code, Peerio.user.username, Peerio.user.publicKey)
                    .then(() => {
                        resolve('successfully entered 2fa code');
                    })
                    .catch(() => {
                        this.handle2FA(resolve, reject, true);
                    });
            })
            .catch( () => {
                L.info('2fa rejected by user');
                reject({
                    code: 411, // any special code for user cancel?
                    message: '2FA authentication cancelled by user'
                });
            });
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
