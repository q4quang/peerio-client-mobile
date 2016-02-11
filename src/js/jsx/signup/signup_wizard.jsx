(function () {
    'use strict';

    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    Peerio.UI.SignupWizard = React.createClass({
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

        componentWillMount: function() {
            this.steps = [
                Peerio.UI.SignupWizardOptIn,
                Peerio.UI.SignupWizardName,
                Peerio.UI.SignupWizardPassphrase,
                Peerio.UI.SignupWizardSpinner,
            ];
        },

        processReturnedPassphrase : function() {
            L.info('processing returned passphrase, lol');
        },

        handleNextStep: function (childState) {
            if(childState) this.childState = childState;
            if(this.state.activeStep >= this.steps.length - 1) {
                return;
            }
            this.setState( { activeStep: this.state.activeStep + 1 } );

            /** 
                if (this.state.activeStep === 1) {
                this.setState({
                    username: this.refs.username.getDOMNode().value,
                    firstName: this.refs.firstName.getDOMNode().value,
                    lastName: this.refs.lastName.getDOMNode().value
                });
            }

            this.setState({activeStep: ++this.state.activeStep}, function () {
                if (this.state.activeStep === 2) this.generatePassphrase();
            }); **/
        },

        handlePreviousStep: function () {
            if (this.state.activeStep >= 1)
                this.setState({activeStep: --this.state.activeStep});
            else
                this.transitionTo('/');
        },

        render: function () {

            var activeStep = this.state.activeStep;
            var currentStep = React.createElement(this.steps[activeStep], { 
                key: 'step' + activeStep,
                handleNextStep: this.handleNextStep,
                state: this.childState
            });
            var progressBarSteps = [];

            for (var i = 0; i < this.steps.length; i++) {
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
                            <div className={classNames(
                                'flex-row', 
                                this.state.activeStep === 0 ? 
                                    ' flex-justify-end' : ' flex-justify-between'
                            )}>
                                <Peerio.UI.Tappable 
                                    element='div' 
                                    className={classNames(
                                        'btn-back', {'hide': this.state.activeStep === 0}
                                    )}
                                    onTap={this.handlePreviousStep}>
                                    <i className="material-icons">chevron_left</i>
                                    back
                                </Peerio.UI.Tappable>
                                <Peerio.UI.Tappable  
                                    element="div" 
                                    className="btn" 
                                    onTap={this.transitionTo.bind(this,'login')}>
                                    Exit
                                </Peerio.UI.Tappable>
                            </div>
                        </div>
                    </div>
                    <RouteHandler passphrase={this.state.passphrase} doSignup={this.doSignup}/>
                </div>
            );
        },
    });

}());
