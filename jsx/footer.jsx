/**
 * Footer bar
 */
(function () {
  'use strict';

  Peerio.UI.Footer = React.createClass({
    mixins: [ReactRouter.Navigation, ReactRouter.State],
    //--- REACT EVENTS
    getInitialState: function () {
      return {};
    },
    componentWillMount: function(){
    },
    componentDidMount: function () {
    },
    componentWillUnmount: function () {
    },
    //--- RENDER
    render: function () {

      return (
        <div id="footer">
          <div id="global-back" className={true ? '' : 'hide'}
            onTouchEnd={this.goBack}>
            <i className="fa fa-chevron-left"></i>&nbsp;back
          </div>
          <div className="toolbar-fill"></div>
          <div className="accept-button" onTouchEnd={alert}>{'do smth'}</div>
        </div>
      );
    }
  });

}());
