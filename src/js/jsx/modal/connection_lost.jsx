/**
 * This view appears if the connection is lost somewhere in the sensitive place
 */

(function () {
    'use strict';

    Peerio.UI.ConnectionLost = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function() {
            return {
                inProgress: false
            };
        },

        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onConnected(this.handleConnect),
                Peerio.Dispatcher.onDisconnected(this.handleDisconnect)
            ];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },

        handleConnect: function() {
            this.goBack();
        },

        handleDisconnect: function() {
            this.setState({ inProgress: false });
        },

        tryAgain: function() {
            this.setState({ inProgress: true });
            Peerio.Net.resumeConnection();
            // we wait 10 seconds for connection to be restarted
            // then we assume the trick has failed
            window.setTimeout( () => {
                this.setState({ inProgress: false});
            }, 10000);
        },

        //--- RENDER
        render: function () {
            return (
                <div className="content-inline-dialog no-scroll-hack">
                    <div className="info-label">Connection lost</div>
                    <div>   
                        <div>
                            <p className="info-small col-12"> 
                                Peerio cannot connect to the internet. Please check
                                your connection and try again.
                            </p>
                        </div>
                        <p className="info-small col-12"> 
                            {this.state.message}
                        </p>
                        <Peerio.UI.TalkativeProgress
                            enabled={this.state.inProgress}
                            showSpin="true"
                        />
                        <Peerio.UI.Tappable element="div" className="btn" 
                            hidden={this.state.inProgress}
                            onTap={this.tryAgain}> 
                            Try again
                        </Peerio.UI.Tappable>
                    </div>
                </div>
            );
        }
    });

}());
