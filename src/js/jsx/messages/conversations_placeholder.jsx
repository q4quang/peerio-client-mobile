(function () {
    'use strict';

    /**
     * Message list item component
     */
    Peerio.UI.ConversationsPlaceholder = React.createClass({
        mixins: [ReactRouter.Navigation],
        render: function () {
            return (
                <div className='content list-view'>
                <div className="content-intro">
                <img className="peerio-logo" src="media/img/peerio-logo-light.png"/>
                <h1 className="headline-lrg">Welcome to Peerio!</h1>
                <div>
                <p>Peerio lets you send messages securely. Add a contact and try it out.</p>
                </div> 
                <img src="media/img/paper-plane.png"/>
                </div>
                </div>
            );
        }
    });

}());
