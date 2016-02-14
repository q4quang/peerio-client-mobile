(function () {
    'use strict';

    Peerio.UI.SignupWizardPassphrase = React.createClass({
        mixins: [ReactRouter.Navigation],

        getInitialState: function () {
            return this.props.data.pass 
            || {
                passphrase: '',
                passphrase_reentered: '',
                passphrase_valid: false,
            };
        },

        componentDidMount: function () {
            if(!this.state.passphrase) this.generatePassphrase();
            this.subscriptions = [
                Peerio.Dispatcher.onSetPassphrase(this.processReturnedPassphrase),
            ];
        },

        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },

        generatePassphrase: function () {
            if(!this.trackedGeneration) {
                this.trackedGeneration = true; 
            } else {
                Peerio.DataCollection.Signup.generatePassphrase();
            };
            Peerio.PhraseGenerator.getPassPhrase(this.refs.lang.getDOMNode().value, this.refs.wordCount.getDOMNode().value)
            .then(function (phrase) {
                this.setState({passphrase: phrase});
            }.bind(this));
        },

        handleNextStep: function () {
            this.props.handleNextStep({ pass: this.state });
        },

        render: function () {
            return ( 
                    <fieldset key={'signup-step-1'}>
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
                            <Peerio.UI.Tappable element='div' className="btn-safe" onTap={this.handleNextStep}> I'll remember my
                                passphrase</Peerio.UI.Tappable>
                            <Peerio.UI.Tappable element='div' className="btn-primary" onTap={this.generatePassphrase}> I don't like
                                this passphrase</Peerio.UI.Tappable>
                        </div>
                    </fieldset>);
        },
    });
}());
