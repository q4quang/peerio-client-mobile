Peerio.UI.NotFound = React.createClass({render: function () {return (<div>Route not found</div>);}});

Peerio.UI.Routes = (
  <Route path='/' handler={Peerio.UI.App}>
    <DefaultRoute handler={Peerio.UI.Login}/>
    <NotFoundRoute handler={Peerio.UI.NotFound}/>
    <Route name="signup" path="signup" handler={Peerio.UI.Signup}/>
  </Route>
);


