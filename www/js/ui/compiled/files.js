(function () {
  'use strict';

  Peerio.UI.Files = React.createClass({displayName: "Files",
    mixins: [Peerio.UI.Mixins.GlobalTap],
    getInitialState: function () {
      return {openFile: null};
    },
    componentDidMount: function () {
      this.subscriptions = [
        Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null)),
        Peerio.Dispatcher.onNavigateBack(Peerio.Helpers.getStateUpdaterFn(this, {openFile: null})),
        Peerio.Dispatcher.onUploadFile(alert.bind(window, 'File upload feature will be available soon!'))
      ];
      Peerio.Data.loadFiles()
        .catch(function (error) {
          console.log('Error loading files:', error);
          alert('Failed to load files.');
        });
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.subscriptions);
    },
    globalTapHandler: function (e) {
      var item = Peerio.Helpers.getParentWithClass(e.target, 'file-list-item');
      if (!item || item.attributes['data-fileid'] == null) return;
      var fileId = item.attributes['data-fileid'].value;
      this.setState({openFile: Peerio.user.files[fileId]});
    },

    render: function () {
      if (this.state.openFile)
        return ( React.createElement(Peerio.UI.FileView, {file: this.state.openFile}));

      var H = Peerio.Helpers;
      var nodes = [];

      _.forOwn(Peerio.user.files, function (item) {
        var iconClass = 'file-type fa fa-' + H.getFileIconByName(item.name) + (item.cached ? ' cached' : '');
        var downloadStateNode = null;
        if (item.downloadState) {
          var ds = item.downloadState;
          downloadStateNode = (
            React.createElement("div", {className: "download"}, ds.state, " ", 
              ds.progress === null ? null : ds.progress + '%'
            ));
        }
        nodes.push(
          React.createElement("div", {className: "file-list-item", key: item.localName, "data-fileid": item.id}, 
            React.createElement("i", {className: iconClass}), 
            React.createElement("span", {className: "name"}, item.name), 
            React.createElement("br", null), 
            React.createElement("span", {className: "size"}, H.bytesToSize(item.size)), 
            downloadStateNode
          )
        );
      });

      return (
        React.createElement("div", {className: "content", id: "file-list", onTouchStart: this.registerTouchStart, onTouchEnd: this.registerTouchEnd}, 
          nodes
        )
      );
    }
  });

  Peerio.UI.FileView = React.createClass({displayName: "FileView",
    componentDidMount: function () {
      // this.subscription = Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null));
      Peerio.Actions.navigatedIn();
      Peerio.Actions.tabBarHide();
    },
    componentWillUnmount: function () {
      // Peerio.Dispatcher.unsubscribe(this.subscription);
      Peerio.Actions.navigatedOut();
      Peerio.Actions.tabBarShow();
    },
    handleOpen: function () {
      Peerio.Data.openCachedFile(this.props.file)
        .catch(function (code) {
          if (code === 1) {
            alert('No suitable Applications found for this file type.');
          } else {
            console.log('Error opening file.');
          }
        });
    },
    handleDownload: function () {
      Peerio.Data.downloadFile(this.props.file);
    },
    handleRemoveLocal: function () {
      if (!confirm('Remove file from this device? (it will still be available in your cloud)')) return;
      Peerio.Data.removeCachedFile(this.props.file)
        .catch(function (error) {
          console.log('Error deleting local file:', error);
          alert('Failed to remove file from device.');
        });
    },
    handleRemove: function () {
      if (!confirm('Remove this file? (it will be deleted from your device and cloud, but will be available for users who you may have shared it with)')) return;
      Peerio.Data.removeFile(this.props.file)
        .then(Peerio.Actions.navigateBack())
        .catch(function (error) {
          console.log('Error deleting file:', error);
          alert('Failed to remove file.');
        });
    },
    handleNuke: function () {
      if (!confirm('Destroy file completely? (it will be deleted from your device, cloud and from the clouds of other users who you may have shared it with.)')) return;
      Peerio.Data.removeFile(this.props.file, true)
        .then(Peerio.Actions.navigateBack())
        .catch(function (error) {
          console.log('Error deleting file:', error);
          alert('Failed to remove file.');
        });
    },
    render: function () {
      var f = this.props.file;
      var sender = f.sender ? (React.createElement("div", {className: "block"}, 
        React.createElement("div", {className: "block-title"}, "Sent to you by"), 
        React.createElement("div", {className: "block-content"}, f.sender)
      )) : null;
      var downloadStateNode = null, buttonsNode = null;
      if (f.downloadState) {
        var ds = f.downloadState;
        downloadStateNode = (
          React.createElement("div", {className: "download"}, ds.state, " ", 
              ds.progress === null ? null : ds.progress + '%'
          ));
      } else {
        buttonsNode = (
          React.createElement("div", null, 
            f.cached ? React.createElement("div", {className: "btn btn-safe", onTouchEnd: this.handleOpen}, "Open")
                      : React.createElement("div", {className: "btn btn-safe", onTouchEnd: this.handleDownload}, "Download"), 

            f.cached ? React.createElement("div", {className: "btn btn-danger", onTouchEnd: this.handleRemoveLocal}, "Remove from this device") : null, 

            f.cached ? React.createElement("div", {className: "btn btn-danger", onTouchEnd: this.handleRemove}, "Remove from this device and your cloud")
              : React.createElement("div", {className: "btn btn-danger", onTouchEnd: this.handleRemove}, "Remove from your cloud"), 

          f.creator === Peerio.user.username ? React.createElement("div", {className: "btn btn-danger", onTouchEnd: this.handleNuke}, "Unshare and destroy in all clouds") : null
          ));
      }

      // TODO: replace onTouchEnd with globalTapHandler mixin. these buttons need tap event, because scroll is a possibility
      return (
        React.createElement("div", {className: "content without-tab-bar file-view"}, 
          React.createElement("div", {className: "head"}, 
            React.createElement("i", {className: 'file-type fa fa-' + Peerio.Helpers.getFileIconByName(f.name)}), 
            f.name
          ), 
          React.createElement("div", {className: "info-blocks"}, 
            React.createElement("div", {className: "block"}, 
              React.createElement("div", {className: "block-title"}, "File size"), 
              React.createElement("div", {className: "block-content"}, Peerio.Helpers.bytesToSize(f.size))
            ), 
            React.createElement("div", {className: "block"}, 
              React.createElement("div", {className: "block-title"}, "Location"), 
              React.createElement("div", {className: "block-content"}, f.cached ? 'On this device and in the cloud' : 'In the cloud')
            ), 
            React.createElement("div", {className: "block"}, 
              React.createElement("div", {className: "block-title"}, "Uploaded by"), 
              React.createElement("div", {className: "block-content"}, f.creator === Peerio.user.username ? 'You' : f.creator)
            ), 
            React.createElement("div", {className: "block"}, 
              React.createElement("div", {className: "block-title"}, "Uploaded at"), 
              React.createElement("div", {className: "block-content"}, new Date(f.timestamp).toLocaleString())
            ), 
            sender
          ), 
        downloadStateNode || buttonsNode

        )
      );

    }
  });

}());
