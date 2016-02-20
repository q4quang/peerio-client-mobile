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
              'get started', 'skip', 'no thanks','finish'
            ];

            Peerio.UI.TouchId.isFeatureAvailable()
            .then(() => {
                this.steps[1] = Peerio.UI.SetupWizardTouchID;
            });
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

        handlePreviousStep: function() {
          this.setState( { activeStep: this.state.activeStep - 1 } );
        },

        render: function () {
            var currentStep = React.createElement(
                this.steps[this.state.activeStep], { key: 'step' + this.state.activeStep, onSuccess: this.handleNextStep });
            var button = (

                <div className={classNames(
                    'flex-row',
                    this.state.activeStep === 1  ?
                        ' flex-justify-end' : ' flex-justify-between',
                    this.state.activeStep === 0 ?
                        ' hide' : ''
                )}>
                    <Peerio.UI.Tappable
                        element='div'
                        className={classNames(
                            'btn-back', {'hide': this.state.activeStep < 2}
                        )}
                        onTap={this.handlePreviousStep}>
                        <i className="material-icons">chevron_left</i>
                        back
                    </Peerio.UI.Tappable>
                    <Peerio.UI.Tappable
                        element="div"
                        className="btn"
                        key={'next' + this.state.activeStep} onTap={this.handleNextStep}>
                        {this.state.activeStep !== this.steps.length - 1 ? 'Skip' : 'Finish'}
                    </Peerio.UI.Tappable>
                </div>
            );
            var progressBarSteps = [];

            for (var i = 0; i < this.steps.length; i++) {
                var activeClass = (i === this.state.activeStep) ? 'active progress-bar-step' : 'progress-bar-step';
                progressBarSteps.push(<div className={activeClass}></div>);
            }

            return (

                    <div className="content-wrapper-signup flex-col">
                        <div className="progress-bar">
                            {progressBarSteps}
                        </div>
                        <ReactCSSTransitionGroup
                            transitionName="animate"
                            className="flex-grow-1 flex-shrink-0"
                            transitionEnterTimeout={1000} transitionLeaveTimeout={200}>
                            <div  key={'cont'+this.state.activeStep} className="">
                                {currentStep}

                            </div>
                        </ReactCSSTransitionGroup>
                        {button}
                    </div>
            );
        },
    });

}());
