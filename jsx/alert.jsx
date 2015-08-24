/**
 * This is a custom alert component, which is a test of how React portals work.
 *
 * This to universal alert/prompt/confirm component,
 * it communicates through Peerio Actions and allows multiple alerts
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

      var btns;
      var text;

      if (this.props.btns)
        btns = this.props.btns
      else
        btns =  <div>
          <button type="button" className="btn-lrg" onTouchStart={this.handleClose}>OK</button>
        </div>

      if (this.props.text)
        text = this.props.text;
      else
        text =  "alert text"

      return (
        <div>
          <div className="modal alert text-center">
            <div className="alert-content">
              <div className="alert-content-text">
                {text}
              </div>
              <div className="alert-content-btns">
                {btns}
              </div>
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
