(function () {
  'use strict';
  Peerio.UI.Avatar = React.createClass({
    render: function () {
      var user = Peerio.user.contacts[this.props.username];
      var icons, classes = 'avatar';

      if (user) {
        if (this.props.size === 'big') {
          icons = user.identicons18;
          classes += ' big';
        } else
          icons = user.identicons12;
      }

      if (icons && icons.length === 4)
        return (
          <div className={classes}>
            <img className="pic" src={icons[0]}/>
            <img className="pic" src={icons[1]}/>
            <img className="pic" src={icons[2]}/>
            <img className="pic" src={icons[3]}/>
          </div>
        );
      else return (
        <div className={classes}>
          <i className="fa fa-user-secret"></i>
        </div>
      );
    }
  });

}());
