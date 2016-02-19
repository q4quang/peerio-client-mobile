(function () {
    'use strict';

    Peerio.UI.SetupWizardStart = React.createClass({
        mixins: [ReactRouter.Navigation],
        getInitialState: function () {
            return {
                activeStep: 0
            };
        },
        nextStep: function () {
          this.props.onSuccess();
        },

        render: function () {
           return (
             <div>
                  <div>
                      <div className="headline">Welcome to Peerio!</div>
                      <p>
                        In order to optimize your experience, we recommend you complete this short, 3 step, setup wizard.
                      </p>
                      <p>
                        All steps are optional. You can safely exit the wizard at any point and skip steps that don't apply to you.
                      </p>
                  </div>
                  <div className="buttons">
                      <Peerio.UI.Tappable element='div' className="btn-safe"
                        key={'next' + this.state.activeStep} onTap={this.nextStep}>
                        Get started
                      </Peerio.UI.Tappable>

                      <Peerio.UI.Tappable element='div' className='btn-primary'
                        onTap={this.transitionTo.bind(this, 'messages')}>
                        Maybe later
                      </Peerio.UI.Tappable>
                  </div>
              </div>
            );
        },
    });

}());
