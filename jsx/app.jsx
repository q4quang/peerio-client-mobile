(function () {
  'use strict';
  // Main component for app in authenticated state
  Peerio.UI.App = React.createClass({
    render: function () {
      return (
        <div>
          <Peerio.UI.NavBar/>
          <RouteHandler/>
          <Peerio.UI.Footer/>
        </div>
      );
    }
  });

}());
