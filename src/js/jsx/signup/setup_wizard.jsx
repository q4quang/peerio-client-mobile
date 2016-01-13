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
                <Peerio.UI.Tappable element='div' className="btn-lrg"
                    key={'next' + this.state.activeStep} onTap={this.handleNextStep}>
                    next
                </Peerio.UI.Tappable>
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
                                    <fieldset  key={'cont'+this.state.activeStep} style={ {position: 'absolute'}}>
                                        {currentStep}
                                        <br/>
                                        {button}
                                    </fieldset>
                                </ReactCSSTransitionGroup>
                            </div>
                            <div className="text-center">
                                <p> </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        },
    });

}());
