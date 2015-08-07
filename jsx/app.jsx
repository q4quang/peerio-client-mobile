(function () {
  'use strict';
  // Main component, entry point for React app
  Peerio.UI.App = React.createClass({
    render: function() {
      return (
        <div>
          <h1>I'm not in router</h1>
          <RouteHandler/>
        </div>
      )
    }
  });

}());
