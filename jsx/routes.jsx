Peerio.UI.NotFound = React.createClass({render: function () {return (<div>Route not found</div>);}});

Peerio.UI.Routes = (
  <Route name='root' path='/' handler={Peerio.UI.Root}>
    <DefaultRoute handler={Peerio.UI.Login}/>
    <NotFoundRoute handler={Peerio.UI.NotFound}/>
    <Route name="signup" path="signup" handler={Peerio.UI.Signup}/>
    <Route name="app" path="app" handler={Peerio.UI.App}>
      <Route name='tabs' handler={Peerio.UI.Tabs}>
        <Route name='messages' handler={Peerio.UI.Messages}/>
        <Route name='files' handler={Peerio.UI.Files}/>
        <Route name='contacts' handler={Peerio.UI.Contacts}/>
      </Route>
      <Route name="conversation" path="/app/conversation/:id" handler={Peerio.UI.Conversation} />
    </Route>
  </Route>
);


