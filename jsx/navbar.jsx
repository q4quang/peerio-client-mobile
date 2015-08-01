/**
 * Topmost navigation bar
 */
(function () {
  'use strict';

  Peerio.UI.NavBar = React.createClass({
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
      this.subscrIds = [ d.onSocketConnect(fn(this, {socketConnected: true})),
                         d.onSocketDisconnect(fn(this, {socketConnected: false})),
                         d.onLoading(fn(this, {loading: true})),
                         d.onLoadingDone(fn(this, {loading: false}))];
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.subscrIds);
      this.subscrIds = null;
    },
    //--- RENDER
    render: function () {
      var connectionClass;
      if (this.state.socketConnected)
        connectionClass = this.state.loading ? 'loading' : 'connected';

      return (
        <div id="navbar">
          <div id="sidemenu-toggle" ref="toggle" onTouchStart={Peerio.Action.sidebarToggle}>
            <i className="fa fa-bars"></i>
          </div>
          <div className="logo"><img src="media/img/peerio-short-logo-white.png" className="peerio-logo" /></div>
          <div id="search">
            <input id="search-keyword" type="text"/>
            <i id="search-button" className="fa fa-search"></i>
          </div>
          <div id="app-lock">
            <i className="fa fa-lock"></i>
          </div>
          <div id="connection-status" className={connectionClass}></div>
        </div>
      );
    }
  });

}());
