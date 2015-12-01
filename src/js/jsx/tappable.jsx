(function () {
    'use strict';

    Peerio.UI.Tappable = React.createClass({
        getInitialState: function () {
            return {tapState: ''};
        },
        maxDistanceX: 10, // pixels
        maxDistanceY: 13, // pixels
        maxDelay: 500,   // milliseconds
        handleTouchStart: function (e) {
            e.stopPropagation();
            this.touchStartStamp = Date.now();
            this.touchStartX = e.changedTouches[0].clientX;
            this.touchStartY = e.changedTouches[0].clientY;
            this.setState({tapState: 'on-touchstart'});
        },
        handleTouchEnd: function (e) {
            e.stopPropagation();
            e.preventDefault();

            setTimeout(function () {
                if (!this.isMounted()) return;
                this.setState({tapState: ''});
            }.bind(this), 300);

            if ((Date.now() - this.touchStartStamp) > this.maxDelay) return;
            var touchEndX = e.changedTouches[0].clientX;
            var touchEndY = e.changedTouches[0].clientY;
            if (Math.abs(this.touchStartX - touchEndX) > this.maxDistanceX) return;
            if (Math.abs(this.touchStartY - touchEndY) > this.maxDistanceY) return;
            setTimeout(this.props.onTap, 200);
        },
        render: function () {
            var tag = this.props.element || 'span';
            var props = _.assign({onTouchStart: this.handleTouchStart, onTouchEnd: this.handleTouchEnd}, this.props);
            props.className = this.props.className + ' ' + this.state.tapState;
            var reactElement = React.createElement(tag, props, this.props.children);
            return reactElement;
        }

    });

}());
