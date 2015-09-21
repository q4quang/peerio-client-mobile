(function () {
  'use strict';

  Peerio.UI.Mixins = {};

  Peerio.UI.Mixins.RouteTools = {
    getRouteName: function () {
      var routes = this.getRoutes();
      if (!routes || !routes.length) return null;
      return routes[routes.length - 1].name;
    },
    // to know when to hide back button
    rootRoutes: ['messages', 'files', 'contacts'],
    isAppRoot: function () {
      return this.rootRoutes.indexOf(this.getRouteName()) >= 0;
    }
  };

}());
