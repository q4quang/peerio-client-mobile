(function () {
  'use strict';

  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

  // Main component, entry point for React app
  Peerio.UI.Tabs = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State],
    render: function () {
      return (
        <div>
          <Peerio.UI.TabBar/>
            <RouteHandler/>
        </div>
      )
    }
  });

}());
