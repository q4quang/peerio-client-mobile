(function () {
    'use strict';

    Peerio.UI.TalkativeProgress = React.createClass({
        getInitialState: function () {
            var user = Peerio.user;
            return {
                progressMsg: ''
            };
        },

		progressMessages: [
			'making sun shine brighter...',
			'getting Daenerys closer to Westeros...',
			'calculating the width of a unicorn hair...',
			'42!',
			'processing ciphertext...',
			'some unparallelizable code...',
			'mathing...',
			'taking a quick break...',
			'are those new shoes?',
			'you\'re looking sharp!',
			'that haircut is algebraic!',
			'I think you would like my friend Alice...',
			'I think you would like my friend Bob...',
			'turing test passed...',
			'herding cats...',
			'calculating last digit of pi...',
			'poking Schrödinger\'s cat...',
			'turning keys...',
			'correcting battery staples...',
			'Yo dawg, I heard you like logging in',
		],

        updateProgressMessage: function () {
            var ind = Math.floor(Math.random() * this.progressMessages.length);
            this.setState({progressMsg: this.progressMessages[ind]});
        },
        startProgress: function () {
            this.updateProgressMessage();
            if(this.progressInterval) {
                this.stopProgress();
            }
            this.progressInterval = window.setInterval(this.updateProgressMessage, 1800);
        },
        stopProgress: function () {
            window.clearInterval(this.progressInterval);
            this.progressInterval = null;
        },
        componentWillReceiveProps : function(nextProps) {
            if(nextProps.enabled) {
                this.startProgress();
            } else {
                this.stopProgress();
            }
        },
        componentWillUnmount : function() {
            this.stopProgress();
        },
        render: function () {
            return (
                    this.props.enabled ?
                    <div className="text-center">
                        {!this.props.hideText ?
                        <div>{this.state.progressMsg}</div>
                        : null}
                        {this.props.showSpin ?
                        <div><i className="fa fa-circle-o-notch fa-spin"></i></div>
                        : null}
                    </div> : null
            );
        }
    });

}());
