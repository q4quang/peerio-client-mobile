(function () {
    'use strict';
    Peerio.UI.AccountSettingsItem = React.createClass({

        setPrimaryAddress: function(address) {
            this.props.setPrimaryAddress(address);
        },

        removeAddress: function(address) {
            this.props.removeAddress(address);
        },

        render: function() {
            var address = this.props.data;
            var index = this.props.id;

            return <div className="address" >
              <Peerio.UI.Tappable element="div" onTap={this.setPrimaryAddress.bind(this, address.value)}
              className="text-mono flex-row text-overflow flex-align-center">
                <input type="radio"
                  name="address_default"
                  className="sr-only radio-button"
                  readOnly="yes"
                  checked={this.props.data.isPrimary}/>
                <label htmlFor={'address_default_'+index}
                className="radio-label">
                    <i className="material-icons"></i>
                </label>

                {address.value}
              </Peerio.UI.Tappable>

              <Peerio.UI.Tappable element="i" className="material-icons"
              onTap={this.removeAddress.bind(this, address.value)}>delete</Peerio.UI.Tappable>

            </div>;

            }
    });
}());
