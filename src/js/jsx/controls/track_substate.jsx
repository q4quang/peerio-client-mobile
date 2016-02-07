/**
 * Sidebar menu UI component
 */
(function () {
    'use strict';

    Peerio.UI.TrackSubState = React.createClass({
        propTypes: {
            // name is used to uniquely track the state
            name: React.PropTypes.string.isRequired,
        },

        componentDidMount: function() {
            window.setTimeout( () => Peerio.DataCollection.pushSubState(this.props.name), 1000);
        },

        componentWillUnmount: function() {
            Peerio.DataCollection.popSubState();
        },

        render: function() {
            return null;
        }
    });
}());
