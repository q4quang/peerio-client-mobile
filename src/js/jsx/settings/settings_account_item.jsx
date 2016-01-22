(function () {
    'use strict';
    Peerio.UI.AccountSettingsItem = React.createClass({

        setPrimaryAddress: function(address) {
            this.props.setPrimaryAddress(address);
        },

        render: function() {
            var address = this.props.data;
            var index = this.props.id;
            var removeAddress = this.props.removeAddress;

            return <div>
              <div>
                <Peerio.UI.Tappable element="div" className="col-8" onTap={this.setPrimaryAddress.bind(this, address.value)}>
                  <span className="text-mono">{address.value}</span>
                </Peerio.UI.Tappable>
                <Peerio.UI.Tappable element="div" className="col-2 text-center" onTap={this.setPrimaryAddress.bind(this, address.value)}>
                  <input type="radio"
                    name="address_default"
                    className="sr-only radio-button"
                  checked={this.props.data.isPrimary}/>
                  <label htmlFor={'address_default_'+index}
                  className="radio-label"></label>
                </Peerio.UI.Tappable>
                <div className="col-2 text-center">
                  <Peerio.UI.Tappable element="i" className="material-icons"
                    onTap={removeAddress.bind(this, address.value)}>delete</Peerio.UI.Tappable>
                        </div>
                    </div>

                    </div>;
        }
    });
}());
