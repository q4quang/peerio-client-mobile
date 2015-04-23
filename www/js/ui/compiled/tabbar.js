(function () {
  'use strict';

  /**
   * UI component containing messages/files/contacts tab selector
   */
  Peerio.UI.TabBar = React.createClass({displayName: "TabBar",
    //--- REACT EVENTS
    getInitialState: function () {
      return {
        selectedTab: this.props.tab
      };
    },
    componentWillMount: function () {
      // this will make not-so-pretty duplicated action call
      // but it's fine, because there is a check if tab was actually changed
      // and this is cleaner then introducing additional action
      Peerio.Dispatcher.onTabChange(this.changeTab);
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.changeTab);
    },
    //--- CUSTOM FN
    changeTab: function (tab) {
      if (tab === this.state.selectedTab) return;
      this.setState({selectedTab: tab}, function () {
        Peerio.Actions.tabChange(tab);
      });

    },

    //--- RENDER
    render: function () {
      return (
        React.createElement("div", {id: "tabbar"}, 
          React.createElement(Peerio.UI.TabBarButton, {text: "Messages", active: this.state.selectedTab === 0, 
            onActivate: this.changeTab.bind(this, 0), showBadge: false}), 

          React.createElement(Peerio.UI.TabBarButton, {text: "Files", active: this.state.selectedTab === 1, 
            onActivate: this.changeTab.bind(this, 1), showBadge: false}), 

          React.createElement(Peerio.UI.TabBarButton, {text: "Contacts", active: this.state.selectedTab === 2, 
            onActivate: this.changeTab.bind(this, 2), showBadge: false})
        )
      );
    }
  });

  /**
   * UI component for 1 tab in tabbar
   */
  Peerio.UI.TabBarButton = React.createClass({displayName: "TabBarButton",
    render: function () {
      var tabClasses = 'tab';
      if (this.props.active) tabClasses += ' active';

      var badgeClasses = 'fa fa-circle badge';
      if (!this.props.showBadge) badgeClasses += ' hide';

      return (
        React.createElement("div", {ref: "tab", className: tabClasses, onTouchStart: this.props.onActivate}, 
          this.props.text, 
          React.createElement("i", {className: badgeClasses})
        )
      );

    }
  });

}());
