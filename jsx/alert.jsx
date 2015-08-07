/**
 * This is a custom alert component, which is a test of how React portals work.
 * Currently only login page uses it, the rest of the code uses window.alert/prompt/confirm
 *
 * We need to develop this to universal alert/prompt/confirm component,
 * and it should communicate through Peerio Actions and allow multiple alerts
 * active at the same time.
 *
 * Using it as a normal (non-portal) React component is not a good idea
 * because it creates strange problems with z-index on iOS WebView,
 * and it will be hard to layer multiple alerts properly.
 *
 */
(function () {
  'use strict';

  Peerio.UI.Alert = React.createClass({
    render: function () {
      return (
        <div>
          <div className="modal alert text-center">
            <div className="vertical-center">
              {this.props.children}
              <button type="button" id="alertCloseBtn" onTouchStart={this.handleClose}>OK</button>
            </div>
          </div>
          <div className="modal dim-background"></div>
        </div>
      );
    },
    handleClose: function (e) {
      e.preventDefault();
      this.props.onClose();
    }

  });

}());
