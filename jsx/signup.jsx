(function () {
  'use strict';

  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


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

    getInitialState: function () {
      return {
        steps:[], 
        activeStep: 0,
        userData: {}, 
        auth_method: null,
        passphrase_sample: "volume recorder speech badges expert buffy",
        passphrase_sample_reentered: "",
        passphrase_valid: false,
        activeModalId: null
      };
    },

    handleNextStep: function(e){
      event.preventDefault();
      this.setState({activeStep: ++this.state.activeStep })
    },

    handlePreviousStep: function(e){
      e.preventDefault();
      this.setState({activeStep: --this.state.activeStep })
    },

    handleAuthMethod: function(auth_method){
      this.setState({auth_method: auth_method})
    }, 
    handleSMSCode: function(e){
      e.preventDefault();
      this.setState({auth_method: 'sms_sent'})
    },
    validatePassPhrase: function(){
      var passphrase_confirmed = event.target.value === this.state.passphrase_sample
      this.setState({
        passphrase_sample_reentered: event.target.value,
        passphrase_valid:passphrase_confirmed
      })
    },
    passPhraseIsValid: function(){
      if (this.state.passphrase_valid) {
        Peerio.Action.removeAlert(this.state.activeModalId);
        this.handleNextStep();
      }
    },
    removeModal: function(){
      Peerio.Action.removeAlert(this.state.activeModalId);
    },
    showModal: function(){
      var modalText = <div key={'singup-step-2'}>
        <legend className="headline-md">Please enter your passphrase to continue</legend>
        <textarea className="txt-lrg textarea-transparent" autoFocus="true" onChange={this.validatePassPhrase}></textarea>
      </div>
      var modalBtns = <div>
        <button className="btn-lrg" onTouchEnd={this.passPhraseIsValid}> Create my account </button>
        <button className="btn-subtle" onTouchEnd={this.removeModal}> Let me see my passphrase again </button>
      </div>
      var modalContent = {id: uuid.v4(), text:modalText, btns: modalBtns};
      Peerio.Action.showAlert(modalContent);
      this.setState({activeModalId: modalContent.id});

    },
    render: function(){

      var steps = []; 
      var auth_method = "";

      switch (this.state.auth_method) {
        case "sms":
          auth_method = <div>
                          <div className="text-input-group col-6">
                            <select className="select-input" name="phone_country_code" id="phone_country_code" required="required" >
                              <option value="" disabled selected>Country</option>
                              <option value="1">USA</option>
                              <option value="1">Canada</option>
                              <option value="1">Cyprus</option>
                              <option value="1">Russia</option>
                              <option value="1">Not Spain</option>
                              <option value="1">United Kingdom</option>
                            </select>
                            <label className="text-input-label" htmlFor="phone_country_code">Country</label>
                          </div>

                          <div className="text-input-group col-6">
                            <input className="text-input" type="tel" name="user_phone" id="user_phone" required="required" />
                            <label className="text-input-label" htmlFor="user_phone">Phone number</label>
                          </div>
                          <button className="btn-md btn-safe" onTouchEnd={this.handleSMSCode}> Send SMS code</button>
                        </div>
          break;
        case "captcha":
          auth_method = <div>
                          <img src="media/img/captcha-example.jpg"/>
                          <div className="text-input-group">
                            <input className="text-input" type="text" name="user_captcha" id="user_captcha" required="required" />
                            <label className="text-input-label" htmlFor="user_captcha">Enter captacha text</label>
                          </div>
                        </div>

          break;
        case "sms_sent":
          auth_method = <div className="text-input-group">
                          <input className="text-input" type="tel" name="sms_code" id="sms_code" required="required" />
                          <label className="text-input-label" htmlFor="sms_code">Enter SMS Code</label>
                        </div>
          break;
        default:
      }
      steps.push(
        <fieldset key={'singup-step-0'} className="animate-enter">
          <h1 className="headline-lrg">Basic Information</h1>
          
          <div className="text-input-group">
            <input className="text-input" type="text" name="user_name" id="user_name" required="required"/>
            <label className="text-input-label" htmlFor="user_name">Desired username</label> 
          </div> 

          <div className="text-input-group">
            <input className="text-input" type="text" name="user_first_name" id="user_first_name" required="required"/>
            <label className="text-input-label" htmlFor="user_first_name">First name</label> 
          </div> 

          <div className="text-input-group">
            <input className="text-input" type="text" name="user_last_name" id="user_last_name" required="required"/>
            <label className="text-input-label" htmlFor="user_last_name">Last name</label> 
          </div> 

          <h2 className="headline-sm">authenticate via:</h2>
          
          <div className="centered-text">
            <input type="radio" name="auth_method" id="auth_captcha" value="captcha" className="sr-only radio-button" onChange={this.handleAuthMethod.bind(this, "captcha")}/>  
            <label className="radio-label" htmlFor="auth_captcha">captcha</label> 
            
            <input type="radio" name="auth_method" id="auth_sms" value="sms" className="sr-only radio-button" onChange={this.handleAuthMethod.bind(this, "sms")}/>
            <label className="radio-label" htmlFor="auth_sms">SMS</label>   
          </div>

          {auth_method}

          <button className="btn-lrg" onTouchEnd={this.handleNextStep}> continue </button>
        </fieldset> 
      )
      steps.push(
        <fieldset  key={'singup-step-1'}>
          <h1 className="headline-lrg">Your Passphrase</h1>

          <p className='info'>This is your secure randomly generated passphrase. If you loose it, you will <strong>permanently</strong> loose access to your account. </p>

          <p className="txt-lrg">
            volume recorder speech badges expert buffy
          </p>

          <div className="text-input-group col-6">
            <select className="select-input">
              <option value="en">English</option>
            </select>
            <label className="text-input-label-static">Language</label>
          </div>

          <div className="text-input-group col-6">
            <select className="select-input">
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="10">10</option>
            </select>
            <label className="text-input-label-static">Length</label>
          </div>

          <button className="btn-lrg" onTouchEnd={this.showModal}> I'll remember my passphrase </button>
          <button className="btn-subtle" onTouchEnd={this.handlePreviousStep}> I don't like this passphrase </button>
        </fieldset> 
      )

      steps.push(
        <fieldset  key={'singup-step-3'}>
          <h1 className="headline-lrg">Set a device passcode</h1>
          <p> Instead of entering your passphrase each time you login, you can set a shorter passcode for this device. Only set passcodes on devices you trust. </p>
          <div className="text-input-group">
            <input className="text-input" type="text" name="user_device_passcode" id="user_device_passcode" required="required"/>
            <label className="text-input-label" htmlFor="user_device_passcode">Device passcode</label>
          </div>
          <button className="btn-lrg" onTouchEnd={this.handleNextStep}>Login with this device passcode</button>
          <button className="btn-subtle" onTouchStart={this.handleNextStep}>Login without a device passcode</button>
        </fieldset>
      )

      var activeStep = this.state.activeStep; 
      var currentStep = steps[activeStep]; 
      var progressBarSteps = []; 

      //the third step is a modal dialog, so we display both previous and current step
      //var modalStep = "";
      /*if (activeStep === 2){
        currentStep = steps[activeStep-1];
        modalStep = steps[activeStep];
      }*/

      for (var i=0; i < steps.length; i++){
        var activeClass = (i === activeStep) ? "active progress-bar-step": "progress-bar-step";
        progressBarSteps.push(
          <div className={activeClass}></div>
        )
      }


      return (
          <div className="content-wrapper-signup">
            
            <div className="progress-bar">
              {progressBarSteps}
            </div> 
            
            <form className="signup-form">
              <ReactCSSTransitionGroup transitionName="animate">
              {currentStep }
              </ReactCSSTransitionGroup>
            </form>
          </div>
      ); 
    }
  }); 

}());



