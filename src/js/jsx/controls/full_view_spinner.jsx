(function () {
    'use strict';

    Peerio.UI.FullViewSpinner = React.createClass({

        render: function () {
            return <div
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%', 'background-color': '#fff'}}>
                <div
                    style={{position: 'absolute', top: '45%', 'font-size': '2em', left: '50%', 'margin-left': '-.52em', color:'#2281C5'}}
                    className="fa fa-circle-o-notch fa-spin"></div>
            </div>;
        }

    });

}());
