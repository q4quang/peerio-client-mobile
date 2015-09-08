(function () {
  'use strict';

  Peerio.UI.FileView = React.createClass({
    mixins:[ReactRouter.Navigation],
    componentWillMount: function () {
      this.subscription = Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null));
    },
    componentWillUnmount: function(){
      Peerio.Dispatcher.unsubscribe(this.subscription);
    },
    handleOpen: function () {
      console.log('todo: open file');
    },
    handleDownload: function () {
      console.log('todo: download file');
    },
    handleRemoveLocal: function () {
      if (!confirm('Remove file from this device? (it will still be available in your cloud)')) return;
      console.log('todo: remove cahed file');
    },
    handleRemove: function () {
      if (!confirm('Remove this file? (it will be deleted from your device and cloud, but will be available for users who you may have shared it with)')) return;
      Peerio.Files.delete(this.props.params.id);
    },
    handleNuke: function () {
      if (!confirm('Destroy file completely? (it will be deleted from your device, cloud and from the clouds of other users who you may have shared it with.)')) return;
      console.log('todo: nuke file');
      Peerio.Files.nuke(this.props.params.id);
    },
    render: function () {
      var H = Peerio.Helpers;
      var file = Peerio.Files.cache[this.props.params.id];
      if(!file) {
        this.goBack();
        return null;
      }

      if (!file.icon) file.icon = 'list-item-thumb file-type fa fa-' + H.getFileIconByName(file.name) + (file.cached ? ' cached' : '');
      if (!file.humanSize) file.humanSize = H.bytesToSize(file.size);


      var sender = file.sender ? (<div className="info-row">
        <div className="info-label">Sent to you by</div>
        <div className="info-content">{file.sender}</div>
      </div>) : null;
      var downloadStateNode = null, buttonsNode = null;
      if (file.downloadState) {
        var ds = file.downloadState;
        downloadStateNode = (
          <div className="download">{ds.state}&nbsp;
            {ds.progress === null ? null : ds.progress + '%'}
          </div>);
      } else {
        buttonsNode = (
          <div>
            {file.cached ? <div className="btn btn-safe" onTouchEnd={this.handleOpen}>Open</div>
              : <div className="btn-md btn-safe" onTouchEnd={this.handleDownload}><i className="fa fa-cloud-download">&nbsp;</i>Download</div>}

            {file.cached ?
              <div className="btn btn-danger" onTouchEnd={this.handleRemoveLocal}><i class="fa fa-trash-o"></i>&nbsp;Remove from this device</div> : null }

            {file.cached ? <div className="btn btn-danger" onTouchEnd={this.handleRemove}>Remove from this device and your
              cloud</div>
              : <div className="btn btn-danger" onTouchEnd={this.handleRemove}>Remove from your cloud</div>}

            {file.creator === Peerio.user.username ?
              <div className="btn btn-danger" onTouchEnd={this.handleNuke}>Unshare and remove from all
                clouds</div> : null }
          </div>);
      }

      // TODO: replace onTouchEnd with globalTapHandler mixin. these buttons need tap event, because scroll is a possibility

      return (
        <div className="content-padded">
          <div className="head">
            <div className="col-1 col-first">
              <i className={'file-type fa fa-' + file.icon}></i>
            </div>
            <div className="col-11">
              <span className="headline-md">
                {file.name}
              </span>
            </div>
          </div>

          <hr className="col-12"/>

          <div className="info-table">
            <div className="info-row">
              <div className="info-label">File Name</div>
              <div className="info-content">{file.name}</div>
            </div>

            <div className="info-row">
              <div className="info-label">File Size</div>
              <div className="info-content">{file.humanSize}</div>
            </div>

            <div className="info-row">
              <div className="info-label">File Type</div>
              <div className="info-content">{Peerio.Helpers.getFileTypeByName(file.name)}</div>
            </div>

            <div className="info-row">
              <div className="info-label">Location</div>
              <div className="info-content">{file.cached ? 'On this device and in the cloud' : 'In the cloud'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Owner</div>
              <div className="info-content">{file.creator === Peerio.user.username ? 'You' : file.creator}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Uploaded at</div>
              <div className="info-content">{new Date(file.timestamp).toLocaleString()}</div>
            </div>

            {sender}

          </div>

          {downloadStateNode || buttonsNode}

        </div>
      );

    }
  });

}());
