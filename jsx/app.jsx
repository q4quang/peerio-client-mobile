(function () {
  'use strict';
  // Main component for app in authenticated state
  Peerio.UI.App = React.createClass({
    getInitialState: function () {
      return {
      };
    },
    componentWillMount: function () {
    },
    componentWillUnmount: function () {
    },
    render: function () {
      //rendering root elements
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
