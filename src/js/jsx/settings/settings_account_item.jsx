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
                        <div className="col-8" onClick={this.setPrimaryAddress.bind(this, address.value)}>
                            <span className="text-mono">{address.value}</span>
                        </div>
                        <div className="col-2 text-center" onClick={this.setPrimaryAddress.bind(this, address.value)}>
                            <input type="radio"
                                   name="address_default"
                                   className="sr-only radio-button"
                                   checked={this.props.data.isPrimary}/>
                            <label htmlFor={'address_default_'+index}
                                   className="radio-label"></label>
                        </div>
                        <div className="col-2 text-center">
                            <i className="fa fa-trash-o" onClick={removeAddress.bind(this, address.value)}/>
                        </div>
                    </div>

                    </div>;
        }
    });
}());
