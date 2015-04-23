/**
 * Topmost navigation bar
 */
(function () {
  'use strict';

  Peerio.UI.NavBar = React.createClass({displayName: "NavBar",
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
        React.createElement("div", {id: "navbar"}, 
          React.createElement("div", {id: "sidemenu-toggle", ref: "toggle", onTouchStart: Peerio.Actions.sidebarToggle}, 
            React.createElement("i", {className: "fa fa-bars"})
          ), 
          React.createElement("div", {className: "logo"}, React.createElement("img", {src: "media/img/peerio-short-logo-white.png", className: "peerio-logo"})), 
          React.createElement("div", {id: "search"}, 
            React.createElement("input", {id: "search-keyword", type: "text"}), 
            React.createElement("i", {id: "search-button", className: "fa fa-search"})
          ), 
          React.createElement("div", {id: "app-lock"}, 
            React.createElement("i", {className: "fa fa-lock"})
          ), 
          React.createElement("div", {id: "connection-status", className: connectionClass})
        )
      );
    }
  });

}());
