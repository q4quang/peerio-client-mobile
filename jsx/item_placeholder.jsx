(function(){
  'use strict';

  Peerio.UI.ItemPlaceholder = React.createClass({
   statics:{
      placeholdersArray: null,
      getPlaceholdersArray: function(){
        if(Peerio.UI.ItemPlaceholder.placeholdersArray === null){
          Peerio.UI.ItemPlaceholder.placeholdersArray = [];
          for(var i=0;i<10;i++)
            Peerio.UI.ItemPlaceholder.placeholdersArray.push(<Peerio.UI.ItemPlaceholder key={i}/>);
      }
      return Peerio.UI.ItemPlaceholder.placeholdersArray;
    }
   },
   render: function(){
     return (
        <div className="list-item placeholder">
          <div className="animated-background">
            <div className="mask1"></div>
            <div className="mask2"></div>
            <div className="mask3"></div>
          </div>
        </div>
      );
   }
  });


}());
