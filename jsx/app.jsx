(function () {
  'use strict';
  // Main component for app in authenticated state
  Peerio.UI.App = React.createClass({
    render: function () {
      return (
        <div>
          <Peerio.UI.NavBar/>
          <Peerio.UI.SideBar/>
          <RouteHandler/>
          <Peerio.UI.Footer/>
        </div>
      );
    }
  });

}());
