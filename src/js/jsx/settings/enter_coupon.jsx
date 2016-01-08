(function () {
    'use strict';

    Peerio.UI.EnterCoupon = React.createClass({
        mixins: [Peerio.UI.AutoFocusMixin],

        redeemCoupon: function () {
            var coupon = this.refs.textEdit.getDOMNode().value;
            Peerio.user.redeemCouponCode(coupon)
            .then( () => {
                return Peerio.UI.Alert.show({text: 'The coupon is successfully activated!'}); 
            })
            .then( () => { this.props.onSuccess && this.props.onSuccess(coupon); } )
            .catch( (error) => {
                L.error(error);
                Peerio.UI.Alert.show({text: 'Sorry, the coupon doesn\'t seem to be valid'});
            });
        },

        render: function () {
           return (
               <div>
                   <div className="col-8">
                       <input type="text" className="text-input" placeholder="enter coupon code"
                           ref="textEdit"/>
                   </div>
                   <div className="col-4 text-center">
                       <Peerio.UI.Tappable className="btn-sm btn-block" onTap={ this.redeemCoupon }>
                           redeem
                       </Peerio.UI.Tappable>
                   </div>
               </div>
            );
        },
    });

}());



