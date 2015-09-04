(function () {
  'use strict';

  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

  // Main component, entry point for React app
  Peerio.UI.Tabs = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State],
    getInitialState: function(){
      return {currentPath: this.getPath(), reverseAnimation:false}
    },
    componentWillReceiveProps: function(){
      var previousPath = this.state.currentPath;
      var currentPath = this.getPath();
      var tabOrder = ['/app/tabs/messages', '/app/tabs/files', '/app/tabs/contacts'];
      var back = tabOrder.indexOf(currentPath) < tabOrder.indexOf(previousPath);
      this.setState({currentPath: currentPath, reverseAnimation: back })
    },
    render: function () {
      return (
        <div>
          <Peerio.UI.TabBar/>
          <ReactCSSTransitionGroup transitionName={this.state.reverseAnimation ? "page-animate-reverse": "page-animate"}>
            {React.cloneElement(<RouteHandler/>, { key: this.state.currentPath })}
          </ReactCSSTransitionGroup>
        </div>
      )
    }
  });

}());
