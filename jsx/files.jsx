(function () {
  'use strict';

  Peerio.UI.Files = React.createClass({
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
        return ( <Peerio.UI.FileView file={this.state.openFile}></Peerio.UI.FileView>);

      var H = Peerio.Helpers;
      var nodes = [];

      _.forOwn(Peerio.user.files, function (item) {
        var iconClass = 'file-type fa fa-' + H.getFileIconByName(item.name) + (item.cached ? ' cached' : '');
        var downloadStateNode = null;
        if (item.downloadState) {
          var ds = item.downloadState;
          downloadStateNode = (
            <div className="download">{ds.state}&nbsp;
              {ds.progress === null ? null : ds.progress + '%'}
            </div>);
        }
        nodes.push(
          <div className="file-list-item" key={item.localName} data-fileid={item.id}>
            <i className={iconClass}></i>
            <span className="name">{item.name}</span>
            <br/>
            <span className="size">{H.bytesToSize(item.size)}</span>
            {downloadStateNode}
          </div>
        );
      });

      return (
        <div className="content" id="file-list" onTouchStart={this.registerTouchStart} onTouchEnd={this.registerTouchEnd}>
          {nodes}
        </div>
      );
    }
  });

  Peerio.UI.FileView = React.createClass({
    componentDidMount: function () {
      // this.subscription = Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null));
      //Peerio.Action.navigatedIn();
      Peerio.Action.tabBarHide();
    },
    componentWillUnmount: function () {
      // Peerio.Dispatcher.unsubscribe(this.subscription);
     // Peerio.Action.navigatedOut();
      Peerio.Action.tabBarShow();
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
        .then(Peerio.Action.navigateBack())
        .catch(function (error) {
          console.log('Error deleting file:', error);
          alert('Failed to remove file.');
        });
    },
    handleNuke: function () {
      if (!confirm('Destroy file completely? (it will be deleted from your device, cloud and from the clouds of other users who you may have shared it with.)')) return;
      Peerio.Data.removeFile(this.props.file, true)
        .then(Peerio.Action.navigateBack())
        .catch(function (error) {
          console.log('Error deleting file:', error);
          alert('Failed to remove file.');
        });
    },
    render: function () {
      var f = this.props.file;
      var sender = f.sender ? (<div className="block">
        <div className="block-title">Sent to you by</div>
        <div className="block-content">{f.sender}</div>
      </div>) : null;
      var downloadStateNode = null, buttonsNode = null;
      if (f.downloadState) {
        var ds = f.downloadState;
        downloadStateNode = (
          <div className="download">{ds.state}&nbsp;
              {ds.progress === null ? null : ds.progress + '%'}
          </div>);
      } else {
        buttonsNode = (
          <div>
            {f.cached ? <div className="btn btn-safe" onTouchEnd={this.handleOpen}>Open</div>
                      : <div className="btn btn-safe" onTouchEnd={this.handleDownload}>Download</div>}

            {f.cached ? <div className="btn btn-danger" onTouchEnd={this.handleRemoveLocal}>Remove from this device</div> : null }

            {f.cached ? <div className="btn btn-danger" onTouchEnd={this.handleRemove}>Remove from this device and your cloud</div>
              : <div className="btn btn-danger" onTouchEnd={this.handleRemove}>Remove from your cloud</div>}

          {f.creator === Peerio.user.username ? <div className="btn btn-danger" onTouchEnd={this.handleNuke}>Unshare and destroy in all clouds</div> : null }
          </div>);
      }

      // TODO: replace onTouchEnd with globalTapHandler mixin. these buttons need tap event, because scroll is a possibility
      return (
        <div className="content without-tab-bar file-view">
          <div className="head">
            <i className={'file-type fa fa-' + Peerio.Helpers.getFileIconByName(f.name)}></i>
            {f.name}
          </div>
          <div className="info-blocks">
            <div className="block">
              <div className="block-title">File size</div>
              <div className="block-content">{Peerio.Helpers.bytesToSize(f.size)}</div>
            </div>
            <div className="block">
              <div className="block-title">Location</div>
              <div className="block-content">{f.cached ? 'On this device and in the cloud' : 'In the cloud'}</div>
            </div>
            <div className="block">
              <div className="block-title">Uploaded by</div>
              <div className="block-content">{f.creator === Peerio.user.username ? 'You' : f.creator}</div>
            </div>
            <div className="block">
              <div className="block-title">Uploaded at</div>
              <div className="block-content">{new Date(f.timestamp).toLocaleString()}</div>
            </div>
            {sender}
          </div>
        {downloadStateNode || buttonsNode}

        </div>
      );

    }
  });

}());
