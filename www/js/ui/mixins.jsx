(function () {
  'use strict';

  Peerio.UI.Mixins = {};

  /**
   * Custom Tap event implementation.
   * Usage:
   * 1. Set onTouchStart={this.registerTouchStart} and onTouchEnd={this.registerTouchEnd}
   * 2. Implement globalTapHandler(event) function
   * 3. Inside globalTapHandler you can detect tap target with event.target
   *    or find appropriate container with Peerio.Helpers.getParentWithClass(event.target, 'class-name')
   */
  Peerio.UI.Mixins.GlobalTap = {
    registerTouchStart: function (e) {
      this.touchStartStamp = Date.now();
      this.touchStartX = e.changedTouches[0].clientX;
      this.touchStartY = e.changedTouches[0].clientY;

    },
    registerTouchEnd: function (e) {
      if ((Date.now() - this.touchStartStamp) > 500) return;
      var touchEndX = e.changedTouches[0].clientX;
      var touchEndY = e.changedTouches[0].clientY;
      if (Math.abs(this.touchStartX - touchEndX) > 10) return;
      if (Math.abs(this.touchStartY - touchEndY) > 10) return;
      this.globalTapHandler(e);
    }
  };

}());
