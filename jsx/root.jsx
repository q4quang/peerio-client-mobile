(function () {
  'use strict';
  // Main component, entry point for React app
  Peerio.UI.Root = React.createClass({
    render: function() {
      return (
        <Peerio.UI.Swiper id="app-container" key="app-container">
          <RouteHandler/>
          <Peerio.UI.Portal/>
        </Peerio.UI.Swiper>
      )
    }
  });

}());
