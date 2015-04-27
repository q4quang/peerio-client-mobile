(function () {
  'use strict';
  // Main component, entry point for React app
  Peerio.UI.App = React.createClass({
    //--- CONSTANTS
    maxTabIndex: 2, // we have 3 tabs
    // enumeration of pseudo-routes/views that App component can switch between
    views: {
      login: 0,
      tabs: 1,
      newMessage: 2
    },
    //--- REACT EVENTS
    getInitialState: function () {
      return {
        currentView: this.views.login,
        selectedTab: 0,   // by default we open messaging tab
        tabBarVisible: true
      };
    },
    componentWillMount: function () {
      // subscribing to global events
      var d = Peerio.Dispatcher;
      var sfn = Peerio.Helpers.getStateUpdaterFn;
      this.subscriptions = [
        d.onLoginSuccess(sfn(this, {currentView: this.views.tabs})),
        d.onLoginFail(sfn(this, {currentView: this.views.login})),
        d.onTabChange(sfn(this, null, {selectedTab: 0})), // mapped property to arguments[0]
        d.onNewMessageViewOpen(sfn(this, {currentView: this.views.newMessage})),
        d.onNewMessageViewClose(sfn(this, {currentView: this.views.tabs})),
        d.onTabBarShow(sfn(this, {tabBarVisible: true})),
        d.onTabBarHide(sfn(this, {tabBarVisible: false})),
        d.onSwipeLeft(this.handleSwipe.bind(this, 'left')),
        d.onSwipeRight(this.handleSwipe.bind(this, 'right')),
        d.onTOFUFail(this.TOFUFail),
        d.onSignOut(this.signOut),
        d.onTwoFARequest(this.twoFA),
        d.onTwoFAValidateFail(this.twoFA)
      ];
      // mapping hardware back button to navigate back action
      this.subscriptions.push(d.onHardBackButton(Peerio.Actions.navigateBack));

      // pre-creating tabs
      this.tabs = [<Peerio.UI.Messages/>, <Peerio.UI.Files/>, <Peerio.UI.Contacts/>];
    },
    componentWillUnmount: function () {
      // unsubscribing from global events
      // technically, we don't need to do this as the App component will unmount only with page close/reload
      // but we do it just for the sake of integrity and safety of possible future changes to the app flow
      Peerio.Dispatcher.unsubscribe(this.subscriptions);
    },
    //--- CUSTOM FUNCTIONS
    twoFA: function(callback){
      alert('Please use your computer to disable two-factor authentication before proceeding.');
      Peerio.Actions.loginFail();
      return;
      var code = prompt('Please enter your two-factor authentication code.');
      if(!code) return;
      Peerio.Data.validate2FA(code, callback);
    },
    handleSwipe: function (direction) {
      // change tabs if we are on the root navigation level
      if (Peerio.AppState.navigationLevel === 0 && this.state.currentView === this.views.tabs) {
        if (direction === 'right') {
          if (this.state.selectedTab > 0)
            Peerio.Actions.tabChange(this.state.selectedTab - 1);
        } else {
          if (this.state.selectedTab < this.maxTabIndex)
            Peerio.Actions.tabChange(this.state.selectedTab + 1);
        }
      }

      if (direction === 'left') Peerio.Actions.navigateBack();
    },
    signOut: function () {
      //TODO check for unsaved changes (save draft?) before exit
      window.location.reload();
    },
    TOFUFail: function () {
      alert('TOFU fail'); // TODO: proper alert
    },
    //--- RENDER
    render: function () {
      var content;

      switch (this.state.currentView) {
        case this.views.login:
          return <Peerio.UI.LoginScreen/>;
        case this.views.tabs:
          content = this.tabs[this.state.selectedTab];
          break;
        case this.views.newMessage:
          content = <Peerio.UI.NewMessage/>;
          break;
      }

      var tabBar = this.state.tabBarVisible ? <Peerio.UI.TabBar tab={this.state.selectedTab}/> : null;
      //rendering root elements
      return (
        <Peerio.UI.Swiper id="app-container" key="app-container" onSwipeLeft={this.handleSwipe.bind(this, 'left')}
                          onSwipeRight={this.handleSwipe.bind(this, 'right')}>
          <Peerio.UI.NavBar/>
          {tabBar}
          <Peerio.UI.SideBar/>
          {content}
          <Peerio.UI.Footer/>
          <Peerio.UI.FileSelect/>
        </Peerio.UI.Swiper>
      );

    }
  });

}());
