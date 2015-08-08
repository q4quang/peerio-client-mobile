(function () {
  'use strict';

  Peerio.UI.Signup = React.createClass({
    mixins: [ReactRouter.Navigation],
    doSignup: function(){
      Peerio.Auth.signup(this.refs.username.getDOMNode().value, this.refs.pass.getDOMNode().value);
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
