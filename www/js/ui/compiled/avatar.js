(function () {
  'use strict';
  Peerio.UI.Avatar = React.createClass({displayName: "Avatar",
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
          React.createElement("div", {className: classes}, 
            React.createElement("img", {className: "pic", src: icons[0]}), 
            React.createElement("img", {className: "pic", src: icons[1]}), 
            React.createElement("img", {className: "pic", src: icons[2]}), 
            React.createElement("img", {className: "pic", src: icons[3]})
          )
        );
      else return (
        React.createElement("div", {className: classes}, 
          React.createElement("i", {className: "fa fa-user-secret"})
        )
      );
    }
  });

}());
