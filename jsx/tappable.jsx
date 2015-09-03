(function () {
  'use strict';

  Peerio.UI.Tappable = React.createClass({
    maxDistanceX: 10, // pixels
    maxDistanceY: 13, // pixels
    maxDelay: 500,   // milliseconds
    handleTouchStart: function (e) {
      this.touchStartStamp = Date.now();
      this.touchStartX = e.changedTouches[0].clientX;
      this.touchStartY = e.changedTouches[0].clientY;

    },
    handleTouchEnd: function (e) {
      if ((Date.now() - this.touchStartStamp) > this.maxDelay) return;
      var touchEndX = e.changedTouches[0].clientX;
      var touchEndY = e.changedTouches[0].clientY;
      if (Math.abs(this.touchStartX - touchEndX) > this.maxDistanceX) return;
      if (Math.abs(this.touchStartY - touchEndY) > this.maxDistanceY) return;
      this.props.onTap(e);
    },
    render: function(){
      var tag = this.props.element || "span";
      var reactElement = React.createElement(tag,
                          { onTouchStart:this.handleTouchStart,
                            onTouchEnd:this.handleTouchEnd,
                            className: this.props.className,
                            key: this.props.key
                          }, this.props.children);

      return reactElement;
    }

  });

}());
