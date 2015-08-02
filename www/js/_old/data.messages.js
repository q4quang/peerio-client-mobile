/**
 * Peerio Data/Business logic layer
 * --------------------------------
 * Provides abstracted access to Peerio core javascript,
 * since it was written for angular desktop app and is not fully decoupled/abstracted yet.
 *
 * Peerio.Data provides API for direct use,
 * but mostly it should react on Actions and generate Actions in response.
 *
 */
(function () {
    'use strict';

    window.Peerio = window.Peerio || {};
    Peerio.ACK_MSG = ':::peerioAck:::';

    Peerio.Data = Peerio.Data || {};

    Peerio.Data.sendMessage = function (conversation, body, guid, files) {
      Peerio.Action.loading();
      // in case of super fast sending, avoid wrong event order
      Peerio.message.new({
        isDraft: false,
        recipients: conversation.original.decrypted.participants,
        subject: conversation.original.decrypted.subject,
        body: body,
        fileIDs: files || [],
        conversationID: conversation.id,
        sequence: Object.keys(conversation.messages).length
      }, function (messageObject, failed) {
        var temporaryID = guid;//'sending' + Base58.encode(nacl.randomBytes(8));
        Peerio.network.createMessage(messageObject, function (result) {

          if (result.hasOwnProperty('error')) {
            if (result.error === 413) alert('quota error'); // todo proper alert
            else alert('unknown error');  // todo proper alert
            Peerio.Action.messageSentStatus(guid, Peerio.Action.Statuses.Fail);
            Peerio.Action.loadingDone();
            return false;
          }

          Peerio.message.getMessages([result.id], function (data) {
            conversation.messages[result.id] = conversation.messages[temporaryID];
            delete conversation.messages[temporaryID];
            conversation.messages[result.id].timestamp = data.messages[result.id].timestamp;
            conversation.messages[result.id].id = result.id;
            conversation.messages[result.id].decrypted = data.messages[result.id].decrypted;
            conversation.lastTimestamp = data.messages[result.id].timestamp;
            Peerio.user.conversations[conversation.id].lastTimestamp = data.messages[result.id].timestamp;
            //Peerio.storage.db.get('conversations', function (err, conversations) {
            //  if (conversations.hasOwnProperty(conversation.id)) {
            //    conversations[conversation.id].lastTimestamp = data.messages[result.id].timestamp;
            //    Peerio.storage.db.put(conversations, function () {
            //    });
            //  }
            //});
            Peerio.Action.messageSentStatus(guid, Peerio.Action.Statuses.Success);
            Peerio.Action.loadingDone();
          });
        });
        // TODO "failed" can really be only array? I think i saw it returning bool in some cases
        if (failed.length) {
          console.log(failed);
          alert('unknown error');
        }

        messageObject.timestamp = Date.now();
        messageObject.id = temporaryID;
        messageObject.isModified = false;
        messageObject.sender = Peerio.user.username;
        messageObject.decrypted = {
          // fileIDs: $scope.messagesSection.attachFileIDs,
          message: body,
          receipt: '',
          sequence: Object.keys(conversation.messages).length,
          subject: conversation.original.decrypted.subject
        };
        conversation.messages[temporaryID] = messageObject;
        Peerio.Action.messageSentStatus(guid, Peerio.Action.Statuses.Pending);
      });
    };

    Peerio.Data.sendNewMessage = function (recipients, subject, message, files) {
      Peerio.Action.loading();

      recipients.push(Peerio.user.username);
      Peerio.message.new({
        isDraft: false,
        recipients: recipients,
        subject: subject,
        body: message,
        sequence: 0,
        fileIDs: files || []
      }, function (messageObject, failed) {
        Peerio.network.createMessage(messageObject, function (result) {
          if (({}).hasOwnProperty.call(result, 'error')) {
            if (result.error === 413) {
              alert("quota error"); //todo proper alert
            }
            else {
              alert("unknown error"); //todo proper alert
            }
            Peerio.Action.loadingDone();
            return;
          }
          else {
            if (failed.length) {
              alert('error: ' + failed.join(', ')); //todo proper alert
            }
            Peerio.Data.refreshConversation(result.conversationID, true);
            Peerio.Action.loadingDone();
          }
        });
      });
    };
    // Peerio.Data.loadConversations = function () {};
    //todo: ugly. attempt to make conversation loading fast on mobile
    Peerio.Data.loadConversations = function () {
      if (Peerio.user.messagesLoaded) return;
      Peerio.user.messagesLoaded = true;
      Peerio.Action.loading();
      Peerio.network.getConversationIDs(function (idData) {
        var request = idData.conversationID;
        for (var i = 0; i < request.length; i++) {
          request[i] = {id: request[i], page: 'none'};
        }
        Peerio.network.getConversationPages(request, function (cData) {
          var ts = new Date();
          var conversations = [];
          _.forOwn(cData.conversations, function (conv) {
            conv.lastTimestamp = +conv.lastTimestamp;
            conv.original = conv.messages[conv.original];
            conversations.push(conv);
          });
          conversations.sort(function (a, b) { return a.lastTimestamp < b.lastTimestamp ? 1 : (a.lastTimestamp > b.lastTimestamp ? -1 : 0); });
          //Promise.settle(promises).then(function () {
          //  Peerio.Action.conversationsLoaded();
          //  Peerio.Action.loadingDone();
          //  console.log("YAY");
          //  console.log(new Date() - ts);
          //
          //});
          var c = 0;
          var notifyCounter = 0;
          var decrypt = function () {
            if (c >= conversations.length) {
              Peerio.Action.conversationsLoaded();
              Peerio.Action.loadingDone();
              console.log('conversations decrypted in: ' + (new Date() - ts) / 1000 + ' seconds');
              return;
            }
            var conv = conversations[c++];
            Peerio.crypto.decryptMessage(conv.original, function (decrypted) {
              conv.original.decrypted = decrypted;
              Peerio.user.conversations[conv.id] = conv;
              if (++notifyCounter > 5) {
                notifyCounter = 0;
                Peerio.Action.conversationsLoaded();
              }
              window.setTimeout(decrypt, 0);
            });
          };
          decrypt();
          //var aLaPromise = function (fn) {
          //  if (decryptedCount > 0) window.setTimeout(fn.bind(null, fn), 300);
          //  else {
          //    Peerio.Action.conversationsLoaded();
          //    Peerio.Action.loadingDone();
          //    console.log("YAY");
          //    console.log(new Date()-ts);
          //  }
          //};
          //aLaPromise(aLaPromise);
        });
      });
      //  Peerio.storage.db.get('conversations', function (err, conversations) {
      //    // Peerio.user.conversations = conversations;
      //    Peerio.message.getAllConversations(function () {
      //      Peerio.Action.conversationsLoaded();
      //      Peerio.Action.loadingDone();
      //    });
      //  });
    };

    Peerio.Data.refreshMessages = function () {
      Peerio.Action.loading();
      // todo: internally this method should be optimised to make one request for modified messages
      // todo: instead of getting ids and then messages
      Peerio.message.getModifiedMessages(function (modified) {
        var newConversations = [];
        modified.forEach(function (message) {

          var conversation = Peerio.user.conversations[message.conversationID];
          // if we don't have this conversation yet
          if (!conversation) {
            newConversations.push(message.conversationID);
            return;
          }
          if (conversation.messages.hasOwnProperty(message.id))
            conversation.messages[message.id].recipients = message.recipients;
          else
            conversation.messages[message.id] = message;

          if (message.sender !== Peerio.user.username) {
            conversation.original.isModified = true;
            conversation.lastTimestamp = message.timestamp;
            // why not save just one object?
            //Peerio.storage.db.get('conversations', function (err, conversations) {
            //  if (conversations.hasOwnProperty(message.conversationID)) {
            //    var conv = conversations[message.conversationID];
            //    conv.messages[conv.original].isModified = true;
            //    conv.lastTimestamp = message.timestamp;
            //    Peerio.storage.db.put(conversations, function () {});
            //  }
            //});
          }

        }); // forEach message end

        if (newConversations.length) {
          Peerio.message.getConversationPages(newConversations, true, function () {
            Peerio.Action.messagesUpdated();
            Peerio.Action.loadingDone();
          });
        } else {
          Peerio.Action.messagesUpdated();
          Peerio.Action.loadingDone();
        }
      });
    };

    /**
     * (re)loads conversation gradually, page by page, firing event every time new page is loaded
     * @param {string} conversationId
     * @param {bool} onlyLast - pass 'true' if u only want to load last 10 messages in conversation
     */
    Peerio.Data.refreshConversation = function (conversationId, onlyLast) {
      Peerio.Action.loading();
      Peerio.message.getConversationPages([conversationId], true, function () {
        Peerio.Action.conversationUpdated();
        if (onlyLast || Peerio.user.conversations[conversationId].messageCount <= 10) {
          Peerio.Action.loadingDone();
          return;
        }
        Peerio.message.getConversationPages([conversationId], false, function () {
          Peerio.Action.conversationUpdated();
          Peerio.Action.loadingDone();
        });
      });
    };

    /**
     * Finds modified messages in conversation, sends receipts and marks messages as not modified
     * @param conversationId
     */
    Peerio.Data.sendReceipts = function (conversationId) {
      var read = [];
      Peerio.Helpers.forEachMessage(conversationId, function (item) {
        if (!(item.isModified && item.decrypted)) return;
        item.isModified = false;
        read.push(
          {
            id: item.id,
            receipt: item.decrypted.receipt,
            sender: item.sender
          });
      });
      if (read.length) Peerio.message.readMessages(read);
    };

  }()
)
;