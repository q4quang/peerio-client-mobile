/**
 * Sidebar menu UI component
 */
(function () {
  'use strict';

  Peerio.UI.SideBar = React.createClass({
    //--- REACT EVENTS
    getInitialState: function () {
      return {open: false};
    },
    componentDidMount: function () {
     // Peerio.Dispatcher.onSidebarToggle(this.toggle);
     // Peerio.Dispatcher.onHardMenuButton(this.toggle);
    },
    componentWillUnmount: function () {
     // Peerio.Dispatcher.unsubscribe(this.toggle);
    },
    //--- CUSTOM FN
    toggle: function () {
      this.setState({open: !this.state.open});
    },
    hide: function () {
      this.setState({open: false});
    },
    removePIN: function () {
      this.hide();
      if (confirm('Are you sure you want to remove your PIN code?'))
        Peerio.Data.removePIN().finally(function () {
          alert('Your PIN was removed.');
          Peerio.user.PIN = false;
          this.forceUpdate();
        }.bind(this));
    },
    setPIN: function () {
      this.hide();
      var p = prompt('Please enter the PIN you want to set up for this device');
      if (p) {
        Peerio.Data.setPIN(p).then(function () {
          alert('Your pin is set!');
          this.forceUpdate();
        }.bind(this));
      }
    },
    //--- RENDER
    render: function () {
     // var className = this.state.open ? 'open' : '';
      var className = 'open';
      var pinNode;
      //if (Peerio.user.PIN)
      //  pinNode = <li onTouchStart={this.removePIN}>Remove PIN code</li>;
     // else
        pinNode = <li onTouchStart={this.setPIN}>Set new PIN code</li>;
      if (Peerio)
        return (
          <div>
            <div id="sidebar" className={className}>
              <div className="app-version">Peerio version: {Peerio.NativeAPI.getAppVersion()}</div>
              <ul ref="menu">
                <li onTouchStart={Peerio.Action.signOut}>Sign Out</li>
                <li className="header">PIN CODE IS {true ? 'SET' : 'NOT SET'}</li>
                {pinNode}
              </ul>
            </div>
            <div id="sidebar-dimmer" ref="dimmer" className={className} onTouchStart={this.hide}></div>
          </div>
        );
    }

  });

}());
