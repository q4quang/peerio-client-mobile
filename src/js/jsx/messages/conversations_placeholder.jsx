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
                        <div className="headline">Welcome to Peerio!</div>
                        <p>Peerio lets you send messages securely. Add a contact and try it out.</p>
                      <img src="media/img/paper-plane.png" className="paper-plane-padding"/>
                    </div>
                </div>
            );
        }
    });

}());
