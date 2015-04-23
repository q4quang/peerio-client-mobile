/**
 * Footer bar
 */
(function () {
  'use strict';

  Peerio.UI.Footer = React.createClass({displayName: "Footer",
    //--- INSTANCE VARS
    // 0 navigation level buttons
    tabActions: [ {name: 'new message', action: Peerio.Actions.newMessageViewOpen},
                  {name: 'upload file', action: Peerio.Actions.uploadFile},
                  {name: 'add contact', action: Peerio.Actions.addContact}
    ],
    // we make this an instance variable because this array will change
    // only in pair with state.navLevel and it's easier and faster to manipulate an array out of react state
    actionButtonStack: [],
    //--- REACT EVENTS
    getInitialState: function () {
      return {
        navLevel: 0
      };
    },
    componentWillMount: function(){
      this.actionButtonStack.push(this.tabActions[0]);
    },
    componentDidMount: function () {
      Peerio.Dispatcher.onNavigatedIn(this.levelIn);
      Peerio.Dispatcher.onNavigatedOut(this.levelOut);
      Peerio.Dispatcher.onTabChange(this.handleTabChange);
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.levelIn, this.levelOut, this.handleTabChange);
    },
    //--- CUSTOM FN
    handleTabChange: function(tab){
      this.actionButtonStack[0] =this.tabActions[tab];
      this.forceUpdate();
    },
    levelIn: function(buttonName, buttonAction){
      // adding new or the same button on the top of a stack
      if(buttonName && buttonAction)
        this.actionButtonStack.push({name: buttonName, action: buttonAction});
      else
        this.actionButtonStack.push(this.actionButtonStack[this.state.navLevel]);

      this.setState({navLevel: this.state.navLevel + 1});
    },
    levelOut: function(){
      if(this.state.navLevel === 0) return; // should not happen, but to be safe
      this.actionButtonStack.pop();
      this.setState({navLevel: this.state.navLevel - 1});
    },
    //--- RENDER
    render: function () {
      var actionBtn = this.actionButtonStack[this.state.navLevel];
      return (
        React.createElement("div", {id: "footer"}, 
          React.createElement("div", {id: "global-back", className: this.state.navLevel > 0 ? '' : 'hide', 
            onTouchEnd: Peerio.Actions.navigateBack}, 
            React.createElement("i", {className: "fa fa-chevron-left"}), " back"
          ), 
          React.createElement("div", {className: "toolbar-fill"}), 
          React.createElement("div", {className: "accept-button", onTouchEnd: actionBtn.action}, actionBtn.name)
        )
      );
    }
  });

}());
