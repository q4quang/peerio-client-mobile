(function () {
    'use strict';

    var PIN_LENGTH = 6;

    Peerio.UI.PinInput = React.createClass({
        statics: {
            getPinLength: function() {
                return PIN_LENGTH;
            }
        },

        getInitialState: function() {
            return {
                pin: ''
            };
        },

        getDefaultProps: function() {
            return {
                pinLength: PIN_LENGTH 
            };
        },

        handleNumTap: function(num) {
            if(this.state.pin.length >= this.props.pinLength) {
                return;
            }
            this.setState( { pin: this.state.pin + num }, () => {
                if(this.state.pin.length == this.props.pinLength) {
                    this.props.onEnterPin(this.state.pin);
                    this.setState( { pin: '' } );
                }
            });
        },

        renderTextButton: function(item) {
            return (
                <Peerio.UI.Tappable 
                    tag="div"
                    className="pin-pad-key"
                    onTap={item.handler}>
                    <div className="number-key-content">{item.text}</div>
                </Peerio.UI.Tappable>
            );
        },

        renderNumButton: function(num) {
            return (
                <Peerio.UI.Tappable 
                    tag="div"
                    className="number-key"
                    onTap={this.handleNumTap.bind(this, num)}>
                    <div className="number-key-content">{num}</div>
                </Peerio.UI.Tappable>
            );
        },

        renderRow: function(nums) {
            return (
                <div className="flex-row flex-justify-center margin-small">
                    { nums.map( (num) =>
                               num.text ? this.renderTextButton(num) : this.renderNumButton(num) ) }
                </div>
            );
        },

        renderIndicators: function(activeLength, maxLength) {
            return (
                <div className="pin-code pin-code flex-justify-center flex-row flex-justify-center">
                    { Array.apply(null, new Array(activeLength)).map( () => 
                        <div className="pin-indicator active"></div>
                    )}

                    { Array.apply(null, new Array(maxLength - activeLength)).map( () => 
                        <div className="pin-indicator"></div>
                    )}
                 </div>
            );
        },

        render: function () {
           return (
               <div className="modal pin-pad flex-col flex-justify-center">
                 <div className="headline-md text-center margin-small padding-small text-overflow">
                   Welcome back, <strong>{this.props.username}</strong>
                 </div>
                 {this.renderIndicators(this.state.pin.length, this.props.pinLength) }
                 {this.renderRow( [1, 2, 3] ) }
                 {this.renderRow( [4, 5, 6] ) }
                 {this.renderRow( [7, 8, 9] ) }
                 {this.renderRow( [ 
                                 { text: 'Change User', handler: this.props.onChangeUser }, 
                                 0,
                                 window.PeerioTouchIdKeychain ?
                                 { text: 'Touch ID', handler: this.props.onTouchID } : { text: ' ' }
                 ] ) }
              </div>);
        }              
    });

}());
