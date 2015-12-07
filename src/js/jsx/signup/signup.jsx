(function () {
    'use strict';

    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    Peerio.UI.Signup = React.createClass({
        mixins: [ReactRouter.Navigation],

        doSignup: function () {

            this.setState({activeStep: 3});

            Peerio.Auth.signup(this.state.username, this.state.passphrase, this.state.firstName, this.state.lastName)
            .then(() => {
                //todo: terrible, transfer this through router
                Peerio.autoLogin = {username: this.state.username, passphrase: this.state.passphrase};
                this.transitionTo('root');
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
                firstNameValid: null,
                firstName: '',
                lastNameValid: null,
                lastName: '',
                activeModalId: null
            };
        },
        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onSetPassphrase(this.processReturnedPassphrase),
            ];
        },

        processReturnedPassphrase : function() {
            console.log('processing returned passphrase, lol');
        },

        handleNextStep: function (e) {
            if (this.state.activeStep === 0) {
                this.setState({
                    username: this.refs.username.getDOMNode().value,
                    firstName: this.refs.firstName.getDOMNode().value,
                    lastName: this.refs.lastName.getDOMNode().value
                });
            }

            this.setState({activeStep: ++this.state.activeStep}, function () {
                if (this.state.activeStep === 1) this.generatePassphrase();
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
        validatePassPhrase: function () {
            var passphrase_confirmed = event.target.value === this.state.passphrase;
            this.setState({
                passphrase_reentered: event.target.value,
                passphrase_valid: passphrase_confirmed
            });
        },
        validateFirstName: function () {
            var name = this.refs.firstName.getDOMNode().value;
            this.setState({
                firstNameValid: !!name.match(/^[a-zãâàâåáéèêëîïôûùüÿýçñæœößøòôõóìîíùûúà .\-']{1,20}$/i),
                firstName: name
            });
        },
        validateLastName: function () {
            var name = this.refs.lastName.getDOMNode().value;
            this.setState({
                lastNameValid: !!name.match(/^[a-zãâàâåáéèêëîïôûùüÿýçñæœößøòôõóìîíùûúà .\-']{1,20}$/i),
                lastName: name
            });
        },

        passPhraseIsValid: function () {
            if (this.state.passphrase_valid) {
                Peerio.Action.removeModal(this.state.activeModalId);
                this.doSignup();
            } else      Peerio.Action.showAlert({text: 'Passphrases do not match'});

        },

        removeModal: function (e) {
            //e.stopPropagation();
            Peerio.Action.removeModal(this.state.activeModalId);
        },

        showModal: function() {
            this.transitionTo('set_passphrase');
        },

        showModalObsolete: function () {
            var modalText = (<div key={'singup-step-2'}>
                <legend className="headline-md">Please enter your passphrase to continue</legend>
                <textarea className="txt-lrg textarea-transparent" autoFocus="true" autoComplete="off" autoCorrect="off"
                    autoCapitalize="off" spellCheck="false"
                    onChange={this.validatePassPhrase}></textarea>
            </div>);
            var modalBtns = (<div>
                <Peerio.UI.Tappable element="div" className="btn-lrg" onTap={this.passPhraseIsValid}> Create my
                    account</Peerio.UI.Tappable>
                <Peerio.UI.Tappable element="div" className="btn-subtle" onTap={this.removeModal}> Let me see my
                    passphrase again</Peerio.UI.Tappable>
            </div>);
            var modalContent = {id: uuid.v4(), text: modalText, btns: modalBtns};
            Peerio.Action.showAlert(modalContent);
            this.setState({activeModalId: modalContent.id});

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
                <div className="content-wrapper-signup">

                    <div className="progress-bar">
                        {progressBarSteps}
                    </div>

                    <form className="signup-form">
                        <ReactCSSTransitionGroup transitionName="animate">
                            {currentStep}
                        </ReactCSSTransitionGroup>
                    </form>
                </div>
            );
        },
        renderSpinner: function () {
            return <fieldset><i className="fa fa-circle-o-notch fa-spin"
                    style={{ marginLeft: '45%',fontSize: '400%',marginTop: '50%'}}></i></fieldset>;
        },
        renderSMS: function () {
            return (<div>
                <div className="text-input-group col-6">
                    <select className="select-input" name="phone_country_code" id="phone_country_code"
                        required="required">
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
                    <input className="text-input" type="tel" name="user_phone" id="user_phone" required="required"/>
                    <label className="text-input-label" htmlFor="user_phone">Phone number</label>
                </div>
                <Peerio.UI.Tappable className="btn-md btn-safe" onTap={this.handleSMSCode}> Send SMS
                    code</Peerio.UI.Tappable>
            </div>);
        },
        renderCaptcha: function () {
            return (<div>
                <img src="media/img/captcha-example.jpg"/>

                <div className="text-input-group">
                    <input className="text-input" type="text" name="user_captcha" id="user_captcha"
                        required="required"/>
                    <label className="text-input-label" htmlFor="user_captcha">Enter captcha text</label>
                </div>
            </div>);
        },
        renderSMSSent: function () {
            return (<div className="text-input-group">
                <input className="text-input" type="tel" name="sms_code" id="sms_code" required="required"/>
                <label className="text-input-label" htmlFor="sms_code">Enter SMS Code</label>
            </div>);
        },
        renderStep0: function (authMethod) {
            return (<fieldset key={'singup-step-0'} className="animate-enter">
                <h1 className="headline-lrg">Basic Information</h1>

                <div className="text-input-group">
                    <input className="text-input" type="text" value={this.state.username} name="user_name"
                        id="user_name"
                        ref='username' required="required" autoComplete="off" autoCorrect="off" autoCapitalize="off"
                        spellCheck="false"
                        onChange={this.validateUsername}/>
                    {
                        (this.state.usernameValid === null || this.state.usernameValid === true)
                            ? <label
                                className={this.state.username.length > 0 ? 'text-input-label up' : 'text-input-label'}
                                htmlFor="user_name">Desired username</label>
                            :
                                <label className={this.state.username.length > 0  ? 'text-input-label up' : 'text-input-label'}
                                    style={{color: '#FF7272', fontWeight:600}} htmlFor="user_name">Please
                                    pick a different username</label>
                                }
                            </div>

                            <div className="text-input-group">
                                <input className="text-input" type="text" name="user_first_name" id="user_first_name"
                                    value={this.state.firstName}
                                    ref="firstName"
                                    onChange={this.validateFirstName} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                                    spellCheck="false"/>
                                {(this.state.firstNameValid === null || this.state.firstNameValid === true)
                                    ? <label
                                        className={this.state.firstName.length > 0  ? 'text-input-label up' : 'text-input-label'}
                                        htmlFor="user_first_name">First name</label>
                                    : <label
                                        className={this.state.firstName.length > 0  ? 'text-input-label up' : 'text-input-label'}
                                        htmlFor="user_first_name" style={{color: '#FF7272', fontWeight:600}}>Invalid
                                        name</label>}
                                </div>

                                <div className="text-input-group">
                                    <input className="text-input" type="text" name="user_last_name" id="user_last_name" ref="lastName"
                                        value={this.state.lastName}
                                        onChange={this.validateLastName} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                                        spellCheck="false"/>
                                    {(this.state.lastNameValid === null || this.state.lastNameValid === true)
                                        ? <label
                                            className={this.state.lastName.length > 0  ? 'text-input-label up' : 'text-input-label'}
                                            htmlFor="user_last_name">Last name</label>
                                        : <label
                                            className={this.state.firstName.length > 0  ? 'text-input-label up' : 'text-input-label'}
                                            htmlFor="user_last_name" style={{color: '#FF7272', fontWeight:600}}>Invalid
                                            name</label>}
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
                                    <div className="col-4 col-first">
                                        <Peerio.UI.Tappable element='div' className="btn-lrg btn-lrg-back"
                                            onTap={this.handlePreviousStep}><i
                                                className="fa fa-chevron-left"></i>back
                                        </Peerio.UI.Tappable>
                                    </div>
                                    <div className="col-8 col-last">
                                        {this.state.usernameValid === true && this.state.firstNameValid && this.state.lastNameValid
                                            ? <Peerio.UI.Tappable element='div' className="btn-lrg" onTap={this.handleNextStep}>
                                                continue</Peerio.UI.Tappable>
                                            : null }
                                        </div>
                                        </fieldset>);
        },
        renderStep1: function () {
            return ( <fieldset key={'singup-step-1'}>
                <h1 className="headline-lrg">Your Passphrase</h1>

                <p className='info'>This is your secure randomly generated passphrase. If you lose it, you
                    will<strong>&nbsp;
                        permanently&nbsp;</strong>
                    lose access to your account.</p>

                <p className="txt-lrg">
                    {this.state.passphrase}
                </p>

                <div className="text-input-group col-6">
                    <select className="select-input" ref="lang" onChange={this.generatePassphrase}>
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
                    <label className="text-input-label-static">Language</label>
                </div>

                <div className="text-input-group col-6">
                    <select className="select-input" ref="wordCount" onChange={this.generatePassphrase}>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="8">7</option>
                        <option value="8">8</option>
                        <option value="8">9</option>
                        <option value="10">10</option>
                    </select>
                    <label className="text-input-label-static">Length</label>
                </div>

                <Peerio.UI.Tappable element='div' className="btn-lrg" onTap={this.showModal}> I'll remember my
                    passphrase</Peerio.UI.Tappable>
                <Peerio.UI.Tappable element='div' className="btn-subtle" onTap={this.generatePassphrase}> I don't like
                    this
                    passphrase</Peerio.UI.Tappable>

                <Peerio.UI.Tappable element='div' className="btn-md btn-lrg-back" onTap={this.handlePreviousStep}><i
                        className="fa fa-chevron-left"></i>back
                </Peerio.UI.Tappable>

            </fieldset>);
        },
        renderStep3: function () {
            return (  <fieldset key={'singup-step-3'}>
                <h1 className="headline-lrg">Set a device passcode</h1>

                <p> Instead of entering your passphrase each time you login, you can set a shorter passcode for this
                    device.
                    Only set passcodes on devices you trust. </p>

                <div className="text-input-group">
                    <input className="text-input" type="text" name="user_device_passcode" id="user_device_passcode"
                        required="required"/>
                    <label className="text-input-label" htmlFor="user_device_passcode">Device passcode</label>
                </div>
                <Peerio.UI.Tappable element="div" className="btn-lrg" onTap={this.handleNextStep}>Login with this device
                    passcode</Peerio.UI.Tappable>
                <Peerio.UI.Tappable element="div" className="btn-subtle" onTap={this.handleNextStep}>Login without a
                    device passcode</Peerio.UI.Tappable>
            </fieldset>);
        }
    });

}());



