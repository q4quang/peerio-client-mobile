/**
 * Footer bar
 */
(function () {
  'use strict';

  Peerio.UI.Footer = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State],
    //--- REACT EVENTS
    topLevelPaths: ['/app/tabs/messages', '/app/tabs/files', '/app/tabs/contacts'],
    isTopLevel: function () {
      return this.topLevelPaths.indexOf(this.getPath()) >= 0;
    },
    openNewMessageView: function () {
      this.transitionTo('new_message');
    },
    //--- RENDER
    render: function () {

      return (
        <div id="footer">
          <div id="global-back" className={this.isTopLevel() ?  'hide' : ''}
               onTouchEnd={this.goBack}>
            <i className="fa fa-chevron-left"></i>&nbsp;back
          </div>
          <div className="toolbar-fill"></div>
          <div className="accept-button" onTouchEnd={this.openNewMessageView}>New message</div>
        </div>
      );
    }
  });

}());
