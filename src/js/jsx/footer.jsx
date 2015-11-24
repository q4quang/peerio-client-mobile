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
        files: {name: 'Upload file', action: Peerio.Action.showFileUpload, icon:"cloud-upload"},
        contacts: {name: 'Add contact', icon: "user-plus"},
        contact: {name: 'Send Message', icon: "pencil"},
        add_contact_import: {name: 'Import & Invite Contacts', icon: "user-plus"},
        add_contact_search: {name: 'Add Selected Contact', icon: "user-plus"},
        new_message: {name: 'Send', icon: "paper-plane-o"},
        conversation: {name: 'Send', icon: "paper-plane-o"}
      };

    },
    //--- RENDER
    render: function () {
      var greenButton = this.mainButtonActions[this.getRouteName()];
      if (greenButton)
        greenButton = (
          <Peerio.UI.Tappable element="div" className="accept-button" onTap={greenButton.action || Peerio.Action.bigGreenButton}>
            <i className={"fa fa-"+greenButton.icon}/>&nbsp;{greenButton.name}
          </Peerio.UI.Tappable>);

      return (
        <div id="footer">
          <Peerio.UI.Tappable element="div" id="global-back" className={this.isAppRoot() ? 'hide' : ''} onTap={this.goBack}>
            <i className="fa fa-chevron-left"></i>&nbsp;back
          </Peerio.UI.Tappable>
          <div className="toolbar-fill"></div>
          {greenButton}
        </div>
      );
    }
  });

}());
