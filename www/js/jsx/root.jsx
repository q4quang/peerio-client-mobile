(function () {
  'use strict';
  // Main component, entry point for React app
  Peerio.UI.Root = React.createClass({
    componentWillMount: function () {
      Peerio.Dispatcher.onPause(Peerio.Net.pauseConnection);
      Peerio.Dispatcher.onResume(Peerio.Net.resumeConnection);
      // no need to unsubscribe, this is the root component
    },
    render: function () {
      return (
        <div>
          <RouteHandler/>
          <Peerio.UI.Portal/>
          {Peerio.runtime.platform === 'ios' ? <div className="ios-titlebar"></div> : null}
        </div>
      );
    }
  });

}());
