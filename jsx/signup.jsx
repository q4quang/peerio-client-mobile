(function () {
  'use strict';

  Peerio.UI.Signup = React.createClass({
    mixins: [ReactRouter.Navigation],
    doSignup: function(){
      var username = this.refs.username.getDOMNode().value;
      var pass = this.refs.pass.getDOMNode().value;
      Peerio.Auth.signup(username, pass)
        .then(function(){
          Peerio.Auth.login(username, pass);
        });

    },
    render: function () {
      return (
        <div>
          signup<br/>
          <br/>
          Username: <input type='text' ref='username'/><br/><br/>
          Passphrase: <input type='text' ref='pass'/><br/><br/>

          <button className='btn' onClick={this.doSignup}>Signup</button>
          <br/><br/>
          <button className='btn' onClick={this.goBack}>Back</button>
        </div>
      );
    }
  });

}());
