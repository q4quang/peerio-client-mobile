(function(){
  'use strict';

  Peerio.UI.ItemPlaceholder = React.createClass({displayName: "ItemPlaceholder",
   statics:{
      placeholdersArray: null,
      getPlaceholdersArray: function(){
        if(Peerio.UI.ItemPlaceholder.placeholdersArray === null){
          Peerio.UI.ItemPlaceholder.placeholdersArray = [];
          for(var i=0;i<10;i++)
            Peerio.UI.ItemPlaceholder.placeholdersArray.push(React.createElement(Peerio.UI.ItemPlaceholder, {key: i}));
      }
      return Peerio.UI.ItemPlaceholder.placeholdersArray;
    }
   },
   render: function(){
     return (
        React.createElement("div", {className: "list-item placeholder"}, 
          React.createElement("div", {className: "animated-background"}, 
            React.createElement("div", {className: "mask1"}), 
            React.createElement("div", {className: "mask2"}), 
            React.createElement("div", {className: "mask3"})
          )
        )
      );
   }
  });


}());
