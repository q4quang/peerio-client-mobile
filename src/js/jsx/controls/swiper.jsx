/**
 * Global swipe recognizer
 *
 * Unfortunately, it has to be a bit ugly and non-flexible in order to be fast
 */
(function () {
  'use strict';
  // accepts props
  // onSwipeLeft onSwipeRight
  Peerio.UI.Swiper = React.createClass({
    displayName: 'Swiper',
    minSwipeLength: 80, // swipe will not be registered if shorter
    swipeTime: 500,    // (ms) maximum time between touch start and touch end events
    startTouch: {}, // first time user touched the screen
    startTimeStamp: null,

    render: function () {
      return (
        React.createElement('div', {
            onTouchStart: this.handleTouchStart,
            onTouchEnd: this.handleTouchEnd,
            onTouchCancel: this.handleTouchCancel,
            className: this.props.className
          },
          this.props.children
        )
      );
    },

    handleTouchStart: function (e) {
      if (e.touches.length === 1) {
        var touch = e.touches[0];
        // ios changes original object on touch end so we need to clone properties we want to remember
        this.startTouch = {clientX: touch.clientX, clientY: touch.clientY};
        this.startTimeStamp = e.timeStamp;
      }
    },

    handleTouchEnd: function (endEvent) {
      if (endEvent.changedTouches.length !== 1) return;
      // if gesture took too long time
      if ((endEvent.timeStamp - this.startTimeStamp) > this.swipeTime) return;

      var endTouch = endEvent.changedTouches[0];

      var xLength = Math.abs(this.startTouch.clientX - endTouch.clientX);
      var yLength = Math.abs(this.startTouch.clientY - endTouch.clientY);

      // if swipe is longer on Y axis - it's not a horizontal swipe
      if (yLength > xLength) return;

      // checking for minimum swipe length
      if (Math.sqrt(xLength * xLength + yLength * yLength) < this.minSwipeLength) return;

      // firing an event
      if (this.startTouch.clientX > endTouch.clientX)
        this.props.onSwipeLeft();
      else
        this.props.onSwipeRight();

    },

    handleTouchCancel: function () {
      this.startTouch = null;
    }

  });

}());