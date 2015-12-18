(function () {
    'use strict';

    Peerio.UI.FullViewSpinner = React.createClass({

        render: function () {
            return <div
                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%', backgroundColor: '#eee'}}>
                <div
                    style={{position: 'absolute', top: '45%', fontSize: '2em', left: '50%', marginLeft: '-.52em', color:'#58D0C7'}}
                    className="fa fa-circle-o-notch fa-spin"></div>
            </div>;
        }

    });

}());
