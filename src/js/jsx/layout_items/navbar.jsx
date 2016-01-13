/**
 * Topmost navigation bar
 */
(function () {
  'use strict';

  Peerio.UI.NavBar = React.createClass({
    mixins: [ReactRouter.Navigation],

    //--- REACT EVENTS
    getInitialState: function () {
      return {
        socketConnected: true, // red/green connection status. when false, 'loading' is ignored
        loading: false //shows loading indicator animation
      };
    },
    componentWillMount: function () {
      var d = Peerio.Dispatcher;
      var fn = Peerio.Helpers.getStateUpdaterFn;
      this.subscrIds = [d.onConnected(fn(this, {socketConnected: true})),
        d.onDisconnected(fn(this, {socketConnected: false})),
        d.onLoading(fn(this, {loading: true})),
        d.onLoadingDone(fn(this, {loading: false}))];
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.subscrIds);
      this.subscrIds = null;
    },
    handleSidebarToggle: function(){
      Peerio.Action.sidebarToggle();
    },
    //--- RENDER
    render: function () {
      var connectionClass;
      if (this.state.socketConnected)
        connectionClass = this.state.loading ? 'loading' : 'connected';

      return (
        <div id="navbar" className="flex-row flex-align-center">
          <div id="sidemenu-toggle" ref="toggle" onTouchStart={this.handleSidebarToggle}>
            <i className="fa fa-bars"></i>
          </div>
          <div className="logo" onTouchStart={devmode.summon}>
              <img src="media/img/peerio-short-logo-white.png" className="peerio-logo"/>
          </div>
          {/* not sure why but the spacer doesn't work correcly on iOS
            TODO: replace table with floats
          */}

            <div id="app-lock">
              <Peerio.UI.Tappable onTap={this.transitionTo.bind(this, 'new_message')}>
                <i className="fa fa-pencil-square-o"></i>
              </Peerio.UI.Tappable>
            </div>

          <div id="connection-status" className={connectionClass}>{this.state.socketConnected?'':'connecting...'}</div>
        </div>
      );
    }
  });

}());
