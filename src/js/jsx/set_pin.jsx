(function () {
    'use strict';

    Peerio.UI.SetPin = React.createClass({
        mixins:[ReactRouter.Navigation],

        getInitialState: function () {
            return {
                hasPin: true
            };
        },

        deleteDevicePin: function() {

        },

        setDevicePin: function() {

        },
        //--- RENDER
        render: function () {
            return (
                <div className="content-padded">
                    <div className="info-label">Device PIN</div>
                    <Peerio.UI.Tappable
                        element="div"
                        className="btn-sm"
                        onTap={this.deleteDevicePin}>Delete existing PIN</Peerio.UI.Tappable>
                    <input className="text-input text-center"
                           type="text" required="required" placeholder="Enter a device PIN"/>
                    <Peerio.UI.Tappable
                        element="div"
                        className="btn-sm"
                        onTap={this.setDevicePin}>Set new PIN</Peerio.UI.Tappable>
                </div>
            );
        }
    });

}());