/**
 * Footer bar
 */
(function () {
  'use strict';

  Peerio.UI.Footer = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State],
    getRouteName: function () {
      var routes = this.getRoutes();
      if (!routes || !routes.length) return null;
      return routes[routes.length - 1].name;
    },
    // to know when to hide back button
    backButtonlessRoutes: ['messages', 'files', 'contacts'],
    showBackButton: function () {
      return this.backButtonlessRoutes.indexOf(this.getRouteName()) < 0;
    },
    componentWillMount: function () {
      // route name: { button text, button action }
      // default action is Peerio.Action.bigGreenButton
      this.mainButtonActions = {
        messages: {name: 'New message', action: this.transitionTo.bind(this, 'new_message')},
        //files: {name: 'Upload file', action: this.transitionTo.bind(this, '')},
        contacts: {name: 'Add contact'},
        new_message: {name: 'Send'},
        conversation: {name: 'Send'}
      };

    },
    //--- RENDER
    render: function () {
      var greenButton = this.mainButtonActions[this.getRouteName()];
      if (greenButton)
        greenButton = (
          <div className="accept-button" onTouchEnd={greenButton.action || Peerio.Action.bigGreenButton}>
            {greenButton.name}
          </div>);

      return (
        <div id="footer">
          <div id="global-back" className={this.showBackButton() ? '' : 'hide'} onTouchEnd={this.goBack}>
            <i className="fa fa-chevron-left"></i>&nbsp;back
          </div>
          <div className="toolbar-fill"></div>
          {greenButton}
        </div>
      );
    }
  });

}());
