Peerio.UI.NotFound = React.createClass({render: function () {return (<div>Route not found</div>);}});

Peerio.UI.Routes = (
  <Route name='root' path='/' handler={Peerio.UI.Root}>
    <DefaultRoute handler={Peerio.UI.Login}/>
    <NotFoundRoute handler={Peerio.UI.NotFound}/>
    <Route name="signup" path="signup" handler={Peerio.UI.Signup} />
    <Route name="app" path="app" handler={Peerio.UI.App}>
      <DefaultRoute handler={Peerio.UI.Tabs}/>
    </Route>
    <Route name="sidebar" path="app/sidebar" handler={Peerio.UI.SideBar}/>

  </Route>
);


