/**
 * Sync progress
 */

(function () {
    'use strict';

    Peerio.UI.Sync = React.createClass({
        getInitialState: function () {
            return {progressValue: 0, current: 0, max: 0, message: 'starting...', doRender: false};
        },
        componentWillMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onSyncProgress(this.updateProgress),
                Peerio.Dispatcher.onSyncEnded(this.props.onClose)
            ];
        },
        updateProgress: function (current, max, message) {
            var perc = max / 100.0;
            this.setState({
                current: current,
                max: max,
                progressValue: perc ? (current / perc) + '%' : 0,
                message: message
            });
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        render: function () {
            if (!this.state.doRender) {
                window.setTimeout(()=> {
                    if (!this.isMounted()) return;
                    this.setState({doRender: true});
                }, 2000);
                return null;
            }
            var progressDetails = this.state.max > 1 ? '(' + this.state.current + '/' + this.state.max + ')' : '';

            var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
            return (
                <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionAppearTimeout={250}>
                    <div className="modal alert sync flex-col" key="sync">
                        <img className="sync-logo" src="media/img/peerio-logo-white-beta.png" alt="Peerio"
                             onTouchEnd={devmode.summon}/>

                        <div className="sync-info">
                            <div className="fa fa-info-circle sync-info-icon"></div>
                            <div className="sync-info-text">
                                For optimal experience and performance Peerio stores some of your encrypted data on your
                                device. This may take a moment if you have a lot of new messages.
                            </div>
                        </div>

                        <div className="sync-stage">
                        </div>

                        <div className="sync-progress-caption">{this.state.message} {progressDetails}</div>
                        <div className="sync-progress">
                            <div className="sync-progress-bar"
                                 style={{transition: this.state.progressValue=='0%'?'none':'width 500ms ease', width: this.state.progressValue }}>
                            </div>
                        </div>
                    </div>
                </ReactCSSTransitionGroup>
            );

        }
    });

}());