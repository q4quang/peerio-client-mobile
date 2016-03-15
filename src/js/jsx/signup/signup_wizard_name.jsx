(function () {
    'use strict';

    var MAX_USERNAME_LEN = 16;

    Peerio.UI.SignupWizardName = React.createClass({
        mixins: [ReactRouter.Navigation, Peerio.UI.AutoFocusMixin],

        getDefaultProps: function() {
            return {
                autoFocus: true,
                focusNode: 'username',
                focusDelay: 1000
            };
        },

        getInitialState: function () {
            return this.props.data.name
            || {
                usernameValid: null,
                username: '',
                auth_method: null,
                firstNameValid: true,
                firstName: '',
                lastNameValid: true,
                lastName: ''
            };
        },

        validateUsername: function () {
            var username = this.refs.username.getDOMNode().value;

            if(username.length > MAX_USERNAME_LEN) return;
            username = username.toLowerCase();
            this.setState({username: username});
            Peerio.Net.validateUsername(username)
            .then( (valid) => {
                this.setState({usernameValid: valid});
            })
            .catch( () => {
                this.setState({usernameValid: false});
            });
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

        handleNextStep: function () {
            this.props.handleNextStep({ name: this.state });
        },

        render: function () {
            return (
                <fieldset key={'signup-step-0'} className="animate-enter">
                    <div className="headline">Basic Information</div>
                    <Peerio.UI.TrackSubState name="basic"/>

                    <div className="input-group">{
                        (this.state.usernameValid === null || this.state.usernameValid === true)
                        ? <label htmlFor="user_name">Desired username</label>
                        : <label className="red-bold" htmlFor="user_name">Please pick a different username</label>}
                        <input type="text" value={this.state.username} name="user_name"
                            id="user_name"
                            ref='username' required="required" autoComplete="off" autoCorrect="off" autoCapitalize="off"
                            spellCheck="false"
                            className="lowercase"
                            onChange={this.validateUsername}/>
                    </div>
                    <div className="input-group">{
                        (this.state.firstNameValid === null || this.state.firstNameValid === true)
                        ? <label htmlFor="user_first_name">First name</label>
                        : <label htmlFor="user_first_name" className="red-bold">Invalid name</label>
                        }
                        <input type="text" name="user_first_name" id="user_first_name"
                            value={this.state.firstName}
                            ref="firstName"
                            onChange={this.validateFirstName} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                            spellCheck="false"/>
                    </div>
                    <div className="input-group">{
                        (this.state.lastNameValid === null || this.state.lastNameValid === true)
                        ? <label htmlFor="user_last_name">Last name</label>
                        : <label htmlFor="user_last_name" className="red-bold">Invalid name</label>
                        }
                        <input type="text" name="user_last_name" id="user_last_name" ref="lastName"
                            value={this.state.lastName}
                            onChange={this.validateLastName} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                            spellCheck="false"/>
                    </div>

                    <div className="buttons">{
                        this.state.usernameValid === true && this.state.firstNameValid && this.state.lastNameValid
                        ? <Peerio.UI.Tappable
                            element='div'
                            className="btn-safe"
                            onTap={this.handleNextStep}>
                            continue</Peerio.UI.Tappable>
                        : null }
                    </div>
                </fieldset>
            );
        },
    });

}());
