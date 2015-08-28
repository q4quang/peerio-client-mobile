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
        <div className="list-item">
          <div className="list-item-content">
            <div className="animated-background">
              <div className="mask1"></div>
              <div className="mask2"></div>
              <div className="mask3"></div>
            </div>
          </div>
        </div>
      );
   }
  });

Peerio.UI.UserPlaceholder = {
    "settings": {
        "enterToSend":false,
        "useSounds":false,
        "localeCode":"en",
        "sendReadReceipts":true,
        "twoFactorAuth":false,
        "receiveMessageNotifications":true,
        "receiveContactNotifications":false,
        "receiveContactRequestNotifications":false
    },
    "addresses":[{"type":"email","value":"jan.drewniak@gmail.com","isPrimary":true,"isConfirmed":true}],
    "paymentPlan":"free",
    "firstName":"Sample",
    "lastName":"User",
    "publicKeyString":"KGQS1sVa5CztxXCuZM9UNzUS3PzmKbcK4fLEsbUtPLDyh",
    "username":"sample_username",
    "quota":{"user":51720519,"total":1493172224}
}


}());
