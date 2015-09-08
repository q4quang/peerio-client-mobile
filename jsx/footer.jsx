/**
 * Footer bar
 */
(function () {
  'use strict';

  Peerio.UI.Footer = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State, Peerio.UI.Mixins.RouteTools],

    componentWillMount: function () {
      // route name: { button text, button action }
      // default action is Peerio.Action.bigGreenButton
      this.mainButtonActions = {
        messages: {name: 'Compose message', action: this.transitionTo.bind(this, 'new_message'), icon: "pencil"},
        //files: {name: 'Upload file', action: this.transitionTo.bind(this, '')},
        contacts: {name: 'Add contact', icon: "user-plus"},
        new_message: {name: 'Send', icon: "paper-plane-o"},
        conversation: {name: 'Send', icon: "paper-plane-o"}
      };

    },
    //--- RENDER
    render: function () {
      var greenButton = this.mainButtonActions[this.getRouteName()];
      if (greenButton)
        greenButton = (
          <div className="accept-button" onTouchEnd={greenButton.action || Peerio.Action.bigGreenButton}>
            <i className={"fa fa-"+greenButton.icon}/>&nbsp;{greenButton.name}
          </div>);

      return (
        <div id="footer">
          <div id="global-back" className={this.isAppRoot() ? 'hide' : ''} onTouchEnd={this.goBack}>
            <i className="fa fa-chevron-left"></i>&nbsp;back
          </div>
          <div className="toolbar-fill"></div>
          {greenButton}
        </div>
      );
    }
  });

}());
