(function () {
  'use strict';

  Peerio.UI.ShareCode = React.createClass({
    mixins:[ReactRouter.Navigation],

    getInitialState: function() {
        return { inviteCode: null };
    },

    componentWillMount: function() {
        Peerio.user.getInviteCode()
        .then( (code) => {
            code && code.inviteCode && this.setState( { inviteCode: code.inviteCode } );
        });
    },

    render: function() {
      return (<div className="content without-tab-bar without-footer">
        <div className="headline">Free Data</div>
        <p class="lrg-txt">{this.state.inviteCode}</p>
        <p className="caption">Share this code with your friends, and when they signup you both get free storage.</p>
        <ul>
          <li>Share option 1</li>
          <li>Share option 2</li>
          <li>Share option</li>
          <li>Share more options</li>
        </ul>
      </div>);
    }
  });
})();
