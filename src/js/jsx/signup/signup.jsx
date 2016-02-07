(function () {
    'use strict';

    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    Peerio.UI.Signup = React.createClass({
        mixins: [ReactRouter.Navigation],

        doSignup: function () {

            this.setState({activeStep: 4});

            Peerio.Auth.signup(this.state.username, this.state.passphrase, this.state.firstName, this.state.lastName)
            .then(() => {
                //todo: terrible, transfer this through router
                Peerio.autoLogin = {
                    username: this.state.username,
                    passphrase: this.state.passphrase
                };
                
                this.transitionTo('root');
            })
            .catch( (error) => {
                Peerio.Action.showAlert({text: 'Error creating account: ' + error});
                this.setState( this.getInitialState );
            });
        },

        getInitialState: function () {
            return {
                steps: [],
                activeStep: 0,
                usernameValid: null,
                username: '',
                auth_method: null,
                passphrase: '',
                passphrase_reentered: '',
                passphrase_valid: false,
                firstNameValid: true,
                firstName: '',
                lastNameValid: true,
                lastName: '',
                activeModalID: null
            };
        },
        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onSetPassphrase(this.processReturnedPassphrase),
            ];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },

        processReturnedPassphrase : function() {
            L.info('processing returned passphrase, lol');
        },

        handleDataOptIn: function (enable) {
            (enable ? Peerio.DataCollection.enable() : Peerio.DataCollection.disable())
            .then( () => {
                Peerio.DataCollection.Signup.startSignup();
                this.handleNextStep();
            });
        },

        handleNextStep: function (e) {
            if (this.state.activeStep === 1) {
                this.setState({
                    username: this.refs.username.getDOMNode().value,
                    firstName: this.refs.firstName.getDOMNode().value,
                    lastName: this.refs.lastName.getDOMNode().value
                });
            }

            this.setState({activeStep: ++this.state.activeStep}, function () {
                if (this.state.activeStep === 2) this.generatePassphrase();
            });

        },

        handlePreviousStep: function () {
            if (this.state.activeStep >= 1)
                this.setState({activeStep: --this.state.activeStep});
            else
                this.transitionTo('/');
        },

        handleAuthMethod: function (auth_method) {
            this.setState({auth_method: auth_method});
        },

        handleSMSCode: function (e) {
            //e.preventDefault();
            this.setState({auth_method: 'sms_sent'});
        },

        validateUsername: function () {
            var username = this.refs.username.getDOMNode().value;
            this.setState({username: username});
            Peerio.Net.validateUsername(username).then(function (valid) {
                this.setState({usernameValid: valid});
            }.bind(this)).catch(function () {
                this.setState({usernameValid: false});
            }.bind(this));

        },

        validateFirstName: function () {
            var name = this.refs.firstName.getDOMNode().value;
            this.setState({
                firstNameValid: Peerio.Helpers.isNameValid(name),
                firstName: name
            });
        },

        validateLastName: function () {
            var name = this.refs.lastName.getDOMNode().value;
            this.setState({
                lastNameValid: Peerio.Helpers.isNameValid(name),
                lastName: name
            });
        },

        showModal: function() {
            this.transitionTo('set_passphrase', {passphrase: this.state.passphrase} );
        },

        generatePassphrase: function () {
            Peerio.PhraseGenerator.getPassPhrase(this.refs.lang.getDOMNode().value, this.refs.wordCount.getDOMNode().value)
            .then(function (phrase) {
                this.setState({passphrase: phrase});
            }.bind(this));
        },

        render: function () {

            var steps = [];
            var authMethod = '';

            switch (this.state.auth_method) {
                case 'sms':
                    authMethod = this.renderSMS();
                    break;
                case 'captcha':
                    authMethod = this.renderCaptcha();
                    break;
                case 'sms_sent':
                    authMethod = this.renderSMSSent();
                    break;
            }
            steps.push(this.renderDataOptIn());
            steps.push(this.renderStep0(authMethod));
            steps.push(this.renderStep1());
            // step 2 is in modal window
            steps.push(this.renderStep3());
            steps.push(this.renderSpinner());

            var activeStep = this.state.activeStep;
            var currentStep = steps[activeStep];
            var progressBarSteps = [];

            for (var i = 0; i < steps.length; i++) {
                var activeClass = (i === activeStep) ? 'active progress-bar-step' : 'progress-bar-step';
                progressBarSteps.push(<div className={activeClass}></div>);
            }

            return (
                <div>
                    <div className="content-wrapper-signup flex-grow-1 flex-col">
                        <div className="progress-bar">
                            {progressBarSteps}
                        </div>

                        <div className="signup-form flex-col flex-grow-1">
                            <ReactCSSTransitionGroup transitionName="animate" className="flex-shrink-0 flex-grow-1">
                                {currentStep}
                            </ReactCSSTransitionGroup>


                          <div className={'flex-row' + (this.state.activeStep === 0 ? ' flex-justify-end' : ' flex-justify-between')}>
                            <Peerio.UI.Tappable element='div' className={'btn-back' + (this.state.activeStep === 0 ? ' hide' : '')}
                                onTap={this.handlePreviousStep}><i
                                    className="material-icons">chevron_left</i>back
                            </Peerio.UI.Tappable>

                            <Peerio.UI.Tappable  element="div" className="btn" onTap={this.transitionTo.bind(this,'login')}>Exit</Peerio.UI.Tappable>
                          </div>
                        </div>
                    </div>
                    <RouteHandler passphrase={this.state.passphrase} doSignup={this.doSignup}/>
                </div>
            );
        },
        renderSpinner: function () {
            return <fieldset><i className="fa fa-circle-o-notch fa-spin"
                    style={{ marginLeft: '45%',fontSize: '400%',marginTop: '50%'}}></i></fieldset>;
        },
        renderSMS: function () {
            return (<div>
                <div className="input-group col-6">
                  <label htmlFor="phone_country_code">Country</label>
                    <select name="phone_country_code" id="phone_country_code"
                        required="required">
                        <option value="" disabled selected>Country</option>
                        <option value="1">USA</option>
                        <option value="1">Canada</option>
                        <option value="1">Cyprus</option>
                        <option value="1">Russia</option>
                        <option value="1">Not Spain</option>
                        <option value="1">United Kingdom</option>
                    </select>

                </div>

                <div className="input-group col-6">
                    <label htmlFor="user_phone">Phone number</label>
                    <input type="tel" name="user_phone" id="user_phone" required="required"/>
                </div>
                <Peerio.UI.Tappable className="btn-safe" onTap={this.handleSMSCode}> Send SMS
                    code</Peerio.UI.Tappable>
            </div>);
        },
        renderCaptcha: function () {
            return (<div>
                <img src="media/img/captcha-example.jpg"/>

                <div className="input-group">
                    <label htmlFor="user_captcha">Enter captcha text</label>
                    <input type="text" name="user_captcha" id="user_captcha" required="required"/>
                </div>
            </div>);
        },
        renderSMSSent: function () {
            return (<div className="input-group">
                <label htmlFor="sms_code">Enter SMS Code</label>
                <input type="tel" name="sms_code" id="sms_code" required="required"/>
            </div>);
        },

        renderDataOptIn: function () {
            return (
              <div className="animate-enter">
                  <div className="headline">Would you like to help with usability research?</div>
                  <p>By enabling anonymous data collection, we will collect non-identifying and non-content information to share with researchers and improve Peerio.</p>
                  <p>We understand your data has value. When you opt in, we will add 25MB to your account everyday as thanks for your contribution.</p>
                  <div className="buttons">
                    <Peerio.UI.Tappable element="div" className="btn-primary" onTap={this.handleDataOptIn.bind(this, false)}>Not right now</Peerio.UI.Tappable>
                    <Peerio.UI.Tappable element="div" className="btn-safe" onTap={this.handleDataOptIn.bind(this, true)}>Ok</Peerio.UI.Tappable>
                  </div>
              </div>);
        },

        renderStep0: function (authMethod) {
            return (<fieldset key={'signup-step-0'} className="animate-enter">
                          <div className="headline">Basic Information</div>
                          <Peerio.UI.TrackSubState name="basic"/>

                          <div className="input-group">
                              {(this.state.usernameValid === null || this.state.usernameValid === true)
                                  ? <label htmlFor="user_name">Desired username</label>
                                  : <label style={{color: '#FF7272', fontWeight:600}} htmlFor="user_name">Please pick a different username</label>
                              }
                              <input type="text" value={this.state.username} name="user_name"
                                  id="user_name"
                                  ref='username' required="required" autoComplete="off" autoCorrect="off" autoCapitalize="off"
                                  spellCheck="false"
                                  onChange={this.validateUsername}/>
                          </div>

                          <div className="input-group">
                              {(this.state.firstNameValid === null || this.state.firstNameValid === true)
                                  ? <label htmlFor="user_first_name">First name</label>
                                  : <label htmlFor="user_first_name" style={{color: '#FF7272', fontWeight:600}}>Invalid name</label>
                              }
                              <input type="text" name="user_first_name" id="user_first_name"
                                  value={this.state.firstName}
                                  ref="firstName"
                                  onChange={this.validateFirstName} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                                  spellCheck="false"/>
                          </div>

                          <div className="input-group">
                              {(this.state.lastNameValid === null || this.state.lastNameValid === true)
                                  ? <label htmlFor="user_last_name">Last name</label>
                                  : <label htmlFor="user_last_name" style={{color: '#FF7272', fontWeight:600}}>Invalid name</label>
                              }
                                <input type="text" name="user_last_name" id="user_last_name" ref="lastName"
                                    value={this.state.lastName}
                                    onChange={this.validateLastName} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                                    spellCheck="false"/>
                          </div>

                          {/* <h2 className="headline-sm">authenticate via:</h2>

                              <div className="centered-text">
                              <input type="radio" name="auth_method" id="auth_captcha" value="captcha" className="sr-only radio-button"
                              onChange={this.handleAuthMethod.bind(this, "captcha")}/>
                              <label className="radio-label" htmlFor="auth_captcha">captcha</label>

                              <input type="radio" name="auth_method" id="auth_sms" value="sms" className="sr-only radio-button"
                                  onChange={this.handleAuthMethod.bind(this, "sms")}/>
                                  <label className="radio-label" htmlFor="auth_sms">SMS</label>
                                  </div>

                                  {authMethod}*/}
                          <div className="buttons">
                              {this.state.usernameValid === true && this.state.firstNameValid && this.state.lastNameValid
                                  ? <Peerio.UI.Tappable element='div' className="btn-safe" onTap={this.handleNextStep}>
                                      continue</Peerio.UI.Tappable>
                                  : null }
                          </div>
                      </fieldset>);
        },
        renderStep1: function () {
            return ( <fieldset key={'signup-step-1'}>
                <div className="headline">Your Passphrase</div>
                <Peerio.UI.TrackSubState name="passphrase"/>

                <p className='info'>This is your secure randomly generated passphrase. If you lose it, you
                    will <strong>permanently</strong> lose access to your account.</p>

                <p className="txt-lrg">
                    {this.state.passphrase}
                </p>
                <div className="flex-row">
                    <div className="input-group flex-grow-1">
                        <label>Language</label>
                        <select ref="lang" onChange={this.generatePassphrase}>
                            <option value="en">English</option>
                            <option value="fr">Francais</option>
                            <option value="de">Deutsch</option>
                            <option value="es">Español</option>
                            <option value="it">Italiano</option>
                            <option value="ru">Русский</option>
                            <option value="zh-CN">汉语</option>
                            <option value="nb-NO">Norsk (Bokmål)</option>
                            <option value="tr">Türkçe</option>
                            <option value="hu">Magyar</option>
                        </select>

                    </div>

                    <div className="input-group">
                        <label>Length</label>
                        <select ref="wordCount" onChange={this.generatePassphrase}>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="8">7</option>
                            <option value="8">8</option>
                            <option value="8">9</option>
                            <option value="10">10</option>
                        </select>
                    </div>
                </div>
                <div className="buttons">
                  <Peerio.UI.Tappable element='div' className="btn-safe" onTap={this.showModal}> I'll remember my
                      passphrase</Peerio.UI.Tappable>
                    <Peerio.UI.Tappable element='div' className="btn-primary" onTap={this.generatePassphrase}> I don't like
                      this passphrase</Peerio.UI.Tappable>
                </div>

            </fieldset>);
        },
        renderStep3: function () {
            return (  <fieldset key={'signup-step-3'}>
                <div className="headline">Set a device passcode</div>

                <p> Instead of entering your passphrase each time you login, you can set a shorter passcode for this
                    device.
                    Only set passcodes on devices you trust. </p>

                <div className="input-group">
                    <label htmlFor="user_device_passcode">Device passcode</label>
                    <input type="text" name="user_device_passcode" id="user_device_passcode"
                        required="required"/>

                </div>
                <Peerio.UI.Tappable element="div" className="btn" onTap={this.handleNextStep}>Login with this device
                    passcode</Peerio.UI.Tappable>
                <Peerio.UI.Tappable element="div" className="btn" onTap={this.handleNextStep}>Login without a
                    device passcode</Peerio.UI.Tappable>
            </fieldset>);
        }
    });

}());
