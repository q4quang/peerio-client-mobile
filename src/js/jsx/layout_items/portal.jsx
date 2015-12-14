/**
 * React portal for modal manager.
 * ===============================
 *
 * Portal components are a bit tricky compared to normal ones,
 * so we wrap ModalManager in this minimalistic portal component.
 * And ModalManager in its turn can work as regular component.
 *
 *   Using modals as a normal (non-portal) React component is not a good idea
 *   because it creates strange problems with z-index on iOS WebView,
 *   and it will be hard to layer multiple alerts properly.
 *
 */
(function () {
  'use strict';

  Peerio.UI.Portal = React.createClass({
    render: function () {
      // open react portal
      return null;
    },
    // render it through the portal once, when mounted
    componentDidMount: function () {
      this.portal = document.createElement('div');
      document.body.appendChild(this.portal);
      this.renderModalManager();
    },
    renderModalManager: function () {
      React.render(<Peerio.UI.ModalManager/>, this.portal);
    },
    // destroy portal
    componentWillUnmount: function () {
      React.unmountComponentAtNode(this.portal);
    }
  });

}());
