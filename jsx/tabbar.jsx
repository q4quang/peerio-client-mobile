(function () {
  'use strict';

  /**
   * UI component containing messages/files/contacts tab selector
   */
  Peerio.UI.TabBar = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State],
    //--- RENDER
    render: function () {
      var routes = this.getRoutes();
      var tab = routes[routes.length - 1].name;
      return (
        <div id="tabbar">
          <Peerio.UI.TabBarButton text="Messages" active={tab === 'messages'}
                                  onActivate={this.transitionTo.bind(this, 'messages')}
                                  icon="comments-o"
                                  showBadge={false}/>

          <Peerio.UI.TabBarButton text="Files" active={tab === 'files'}
                                  onActivate={this.transitionTo.bind(this, 'files')}
                                  icon="files-o"
                                  showBadge={false}/>

          <Peerio.UI.TabBarButton text="Contacts" active={tab === 'contacts'}
                                  onActivate={this.transitionTo.bind(this, 'contacts')}
                                  icon="users"
                                  showBadge={false}/>

        </div>
      );
    }
  });

  /**
   * UI component for 1 tab in tabbar
   */
  Peerio.UI.TabBarButton = React.createClass({
    render: function () {
      var tabClasses = 'tab';
      if (this.props.active) tabClasses += ' active';

      var badgeClasses = 'fa fa-circle badge';
      if (!this.props.showBadge) badgeClasses += ' hide';

      return (
        <div ref="tab" className={tabClasses} onTouchStart={this.props.onActivate}>
          <i className={'tab-icon fa fa-'+this.props.icon}></i>
          {this.props.text}
          <i className={badgeClasses}></i>
        </div>
      );

    }
  });

}());
