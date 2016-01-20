(function () {
    'use strict';

    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    Peerio.UI.SetupWizard = React.createClass({
        mixins: [ReactRouter.Navigation],

        getInitialState: function () {
            return {
                activeStep: 0
            };
        },

        componentWillMount: function () {
            this.steps = [
                Peerio.UI.SetupWizardStart,
                Peerio.UI.SetupWizardPin,
                Peerio.UI.SetupWizardEmail,
                Peerio.UI.SetupWizardCoupon,
            ];

            this.stepButtons = [
              'get started', 'next', 'almost done','finish'
            ];
        },

        componentWillUnmount: function () {
        },

        handleNextStep: function () {
            if(this.state.activeStep >= this.steps.length - 1) {
                this.transitionTo('messages');
                return;
            }
            this.setState( { activeStep: this.state.activeStep + 1 } );
        },

        render: function () {
            var currentStep = React.createElement(
                this.steps[this.state.activeStep], { key: 'step' + this.state.activeStep, onSuccess: this.handleNextStep });
            var button = (
                <div className="buttons">
                  <Peerio.UI.Tappable element='div' className="btn-safe"
                  key={'next' + this.state.activeStep} onTap={this.handleNextStep}>
                  {this.stepButtons[this.state.activeStep]}
                  </Peerio.UI.Tappable>

                  <Peerio.UI.Tappable element='div' className='btn-primary'
                    style={{display: this.steps[this.state.activeStep] === this.steps[this.steps.length - 1] ? 'none' : null }}
                    onTap={this.transitionTo.bind(this, 'messages')}>
                  {this.state.activeStep === 0 ? 'maybe later' : 'Exit'}
                    </Peerio.UI.Tappable>
                </div>
            );
            var progressBarSteps = [];

            for (var i = 0; i < this.steps.length; i++) {
                var activeClass = (i === this.state.activeStep) ? 'active progress-bar-step' : 'progress-bar-step';
                progressBarSteps.push(<div className={activeClass}></div>);
            }

            return (
                <div>
                    <div className="content-wrapper-signup">
                        <div className="progress-bar">
                            {progressBarSteps}
                        </div>
                        <div>
                            <div>
                                <ReactCSSTransitionGroup
                                    transitionName="animate"
                                    transitionEnterTimeout={1000} transitionLeaveTimeout={200}>
                                    <fieldset  key={'cont'+this.state.activeStep} className="flex-col">
                                        {currentStep}
                                        {button}
                                    </fieldset>
                                </ReactCSSTransitionGroup>
                            </div>
                        </div>
                    </div>
                </div>
            );
        },
    });

}());
