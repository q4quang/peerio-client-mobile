/**
 * Sidebar menu UI component
 */
(function () {
  'use strict';

  Peerio.UI.SideBar = React.createClass({

    mixins: [ReactRouter.Navigation],
    //--- REACT EVENTS
    getInitialState: function () {
      return {
        open: false,
        newPinCode: "",
        modalID: ""
      }
    },
    componentDidMount: function () {
      Peerio.Dispatcher.onSidebarToggle(this.toggle);
      Peerio.Dispatcher.onHardMenuButton(this.toggle);
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.toggle);
    },
    //--- CUSTOM FN
    toggle: function () {
      this.setState({open: !this.state.open});
    },
    removePIN: function () {
      if (confirm('Are you sure you want to remove your PIN code?')) {
        Peerio.Auth.removePIN();
        alert('Your PIN was removed.');
        this.forceUpdate();
      }
    },
    newPinCodeText: function (val) {
      this.setState({newPinCode: val.target.value})
    },
    showPINmodal: function () {
      var setPinText = (<div>
        <span>Please enter the PIN you want to set up for this device</span><br/>
        <input type="text" onChange={this.newPinCodeText}/>
      </div>);
      var btn = <button className="btn-md" onTouchEnd={this.setPIN}>Set PIN code</button>;
      var modal = {id: uuid.v4(), text: setPinText, btns: btn};
      this.setState({modalID: modal.id});
      Peerio.Action.showAlert(modal);
    },
    setPIN: function () {
      Peerio.Action.removeModal(this.state.modalID);

      if (this.state.newPinCode) {
        Peerio.Auth.setPIN(this.state.newPinCode, Peerio.user.username, Peerio.user.passphrase).then(function () {
          Peerio.Action.showAlert({text: "Your PIN is set"});
          this.forceUpdate();
        }.bind(this));
      }
    },
    //TODO: this should be a generic helper function, placed elsewhere.
    formatBytes: function (bytes, decimals) {
      if (bytes == 0) return '0 Byte';
      var k = 1024;
      var dm = decimals + 1 || 3;
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    },
    toggleAndTransition: function (route) {
      this.toggle();
      this.transitionTo(route);
    },
    // todo: this is bad. find a way to share this chunk of code with contact list view
    handleAddContact: function () {
      this.toggle();
      var name = prompt('Please enter username of the contact you want to add');
      if (!name) return;
      Peerio.Contacts.addContact(name);
    },
    handleNewMessage: function () {
      this.toggle();
      this.transitionTo('new_message');
    },
    //--- RENDER
    render: function () {
      var className = this.state.open ? 'open' : '';
      var pinNode;
      var twoFactor;
      var user = Peerio.user;
      if (!user || !user.settings) return null;
      var quotaUsed = this.formatBytes(user.settings.quota.user);
      var quota = this.formatBytes(user.settings.quota.total);
      var quotaPercent = Math.floor(user.settings.quota.user / (user.settings.quota.total / 100));

      if (user.isPINSet)
        pinNode = <li onTouchStart={this.removePIN}><i className="fa fa-lock"></i> Remove PIN code</li>;
      else
        pinNode = <li onTouchStart={this.showPINmodal}><i className="fa fa-unlock"></i> Set new PIN code</li>;

      if (user.settings.twoFactorAuth)
        twoFactor = <li><i className="fa fa-mobile"></i> {user.settings.twoFactorAuth} Disable two factor auth</li>;
      else
        twoFactor = <li><i className="fa fa-mobile"></i> {user.settings.twoFactorAuth} Enable two factor auth</li>;

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
                  <Peerio.UI.Tappable tag='li' onTap={this.handleNewMessage} className="icon-with-label flex-col-1">
                    <i className="fa fa-pencil circle"/>
                    <span className="icon-label">New Message</span>
                  </Peerio.UI.Tappable>
                  <Peerio.UI.Tappable tag="li" onTap={alert.bind(window, 'Not yet functional. Coming soon.')}
                                      className="icon-with-label flex-col-1">
                    <i className="fa fa-cloud-upload circle"/>
                    <span className="icon-label">Upload File</span>
                  </Peerio.UI.Tappable>
                  <Peerio.UI.Tappable tag="li" onTap={this.handleAddContact} className="icon-with-label flex-col-1">
                    <i className="fa fa-user-plus circle"/>
                    <span className="icon-label">Add Contact</span>
                  </Peerio.UI.Tappable>
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
                    <span className="info-small"><i className="fa fa-tachometer"></i>{quotaUsed} / {quota}
                      ({quotaPercent}%) used</span>
                  </li>
                </ul>
                <div className="col-6 col-first">
                  <button className="btn-md txt-sm"
                          onTouchStart={this.toggleAndTransition.bind(this, 'account_settings')}><i
                    className="fa fa-user"></i> Profile
                  </button>
                </div>
                <div className="col-6 col-last">
                  <button className="btn-md txt-sm"
                          onTouchStart={this.toggleAndTransition.bind(this, 'preference_settings')}><i
                    className="fa fa-cog"></i> Preferences
                  </button>
                </div>
              </div>

              <div className="flex-0">
                <button className="btn-dark btn-md" onTouchStart={function(){window.location.reload()}}><i
                  className="fa fa-power-off"></i> Sign Out
                </button>
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
