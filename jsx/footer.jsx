/**
 * Footer bar
 */
(function () {
  'use strict';

  Peerio.UI.Footer = React.createClass({
    //--- INSTANCE VARS
    // 0 navigation level buttons
    tabAction: [ {name: 'new message', action: Peerio.Action.newMessageViewOpen},
                  {name: 'upload file', action: Peerio.Action.uploadFile},
                  {name: 'add contact', action: Peerio.Action.addContact}
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
      this.actionButtonStack.push(this.tabAction[0]);
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
      this.actionButtonStack[0] =this.tabAction[tab];
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
        <div id="footer">
          <div id="global-back" className={this.state.navLevel > 0 ? '' : 'hide'}
            onTouchEnd={Peerio.Action.navigateBack}>
            <i className="fa fa-chevron-left"></i>&nbsp;back
          </div>
          <div className="toolbar-fill"></div>
          <div className="accept-button" onTouchEnd={actionBtn.action}>{actionBtn.name}</div>
        </div>
      );
    }
  });

}());
