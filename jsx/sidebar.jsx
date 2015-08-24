/**
 * Sidebar menu UI component
 */
(function () {
  'use strict';

  Peerio.UI.SideBar = React.createClass({

    mixins: [ReactRouter.Navigation],
    //--- REACT EVENTS
    getInitialState: function () {
      return {open: false,
              user: this.getUserData()
      }
    },
    componentDidMount: function () {
      Peerio.Dispatcher.onSidebarToggle(this.toggle);
      Peerio.Dispatcher.onHardMenuButton(this.toggle);
      this.setState({user: this.getUserData()});
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.toggle);
    },
    //--- CUSTOM FN
    toggle: function () {
      this.setState({open: !this.state.open});
    },
    getUserData: function(){
      if (Peerio.user && Peerio.user.isMe) {
        return Peerio.user.settings
      } else {
        return Peerio.UI.UserPlaceholder
      }
    },
    removePIN: function () {
      if (confirm('Are you sure you want to remove your PIN code?'))
        Peerio.Data.removePIN().finally(function () {
          alert('Your PIN was removed.');
          Peerio.user.PIN = false;
          this.forceUpdate();
        }.bind(this));
    },
    setPIN: function () {
      var setPinText = <div>
                        <span>Please enter the PIN you want to set up for this device</span>
                        <input type="text"/>
                      </div>
      var setPinBtn = <button className="btn-md">Set PIN</button>
      Peerio.Action.showAlert({text:setPinText, btns: setPinBtn});

      //var p = prompt('Please enter the PIN you want to set up for this device');
      if (p) {
        Peerio.Data.setPIN(p).then(function () {
          alert('Your pin is set!');
          this.forceUpdate();
        }.bind(this));
      }
    },
    //TODO: this should be a generic helper function, placed elsewhere.
    formatBytes: function(bytes,decimals) {
      if(bytes == 0) return '0 Byte';
      var k = 1000;
      var dm = decimals + 1 || 3;
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    },
    //--- RENDER
    render: function () {
      var className = this.state.open ? 'open' : '';
      var pinNode;
      var twoFactor;
      var user = this.state.user;
      var quotaUsed = this.formatBytes(user.quota.user);
      var quota = this.formatBytes(user.quota.total);
      var quotaPercent = parseInt( user.quota.user / user.quota.total * 100 );
      var setPin = this.setPin;
      var removePin = this.removePin;
      if ( user.PIN )
        pinNode = <li onTouchStart={this.removePIN}><i className="fa fa-lock"></i> Remove PIN code</li>;
      else
        pinNode = <li onTouchStart={this.setPIN}><i className="fa fa-unlock"></i> Set new PIN code</li>;

      if (user.twoFactorAuth)
        twoFactor = <li><i className="fa fa-mobile"></i> {user.twoFactorAuth} Disable two factor auth</li>;
      else
        twoFactor = <li><i className="fa fa-mobile"></i> {user.twoFactorAuth} Enable two factor auth</li>;
      if (Peerio)
        return (
          <div>
            <div className={className + " sidebar"}>

              <div className="flex-0 centered-text">
                <img className="avatar" src="media/img/avatar-sample.png"/>
                <h3 className="headline-md">{user.firstName} {user.lastName}</h3>
                <span className="subhead-inline">{user.username}</span>
              </div>

              <div className="flex-1" ref="menu">
                <ul className="flex-row">
                  <li className="icon-with-label flex-col-1">
                    <i className="fa fa-pencil"/>
                    <span className="icon-label">New Message</span>
                  </li>
                  <li className="icon-with-label flex-col-1">
                    <i className="fa fa-cloud-upload"/>
                    <span className="icon-label">Upload File</span>
                  </li>
                  <li className="icon-with-label flex-col-1">
                    <i className="fa fa-user-plus"/>
                    <span className="icon-label">Add Contact</span>
                  </li>
                </ul>

                <h3 className="subhead">Security</h3>
                <ul>
                  {pinNode}
                  {twoFactor}
                </ul>
                <h3 className="subhead">Account</h3>
                <ul>
                  <li>
                    <span className="info-label">Storage</span>
                    <span className="info-small"><i className="fa fa-tachometer"></i>{quotaUsed} / {quota} ({quotaPercent}%) used</span>
                  </li>
                  <li>
                    <button className="btn-md" onTouchStart={Peerio.Action.signOut}><i className="fa fa-user"></i> Edit Profile</button>
                  </li>
                </ul>
              </div>


              <div className="flex-0">
                <button className="btn-dark btn-md" onTouchStart={Peerio.Action.signOut}><i className="fa fa-power-off"></i> Sign Out</button>
                <div className="sidebar-footer-text">
                  <span className="feedback">Send Feedback</span>
                  <div className="app-version">Peerio version: {Peerio.NativeAPI.getAppVersion()}</div>
                </div>
              </div>

            </div>

            <div id="sidebar-dimmer" ref="dimmer" className={className} onTouchStart={this.toggle}></div>
          </div>
        );
    }

  });

}());
