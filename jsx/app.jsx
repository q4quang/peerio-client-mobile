(function () {
  'use strict';
  // Main component, entry point for React app
  Peerio.UI.App = React.createClass({
    render: function() {
      return (
        <div>
          <RouteHandler/>
          <Peerio.UI.Portal/>
        </div>
      )
    }
  });

}());
