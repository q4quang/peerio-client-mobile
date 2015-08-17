(function () {
  'use strict';
  // Main component, entry point for React app
  Peerio.UI.Tabs = React.createClass({
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
