(function () {
  'use strict';

  Peerio.UI.FileView = React.createClass({
    componentWillMount: function () {
      this.file = Peerio.Files.cache[this.props.params.id];
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
      console.log('todo: remove file');
    },
    handleNuke: function () {
      if (!confirm('Destroy file completely? (it will be deleted from your device, cloud and from the clouds of other users who you may have shared it with.)')) return;
      console.log('todo: nuke file');
    },
    render: function () {
      var sender = this.file.sender ? (<div className="block">
        <div className="block-title">Sent to you by</div>
        <div className="block-content">{this.file.sender}</div>
      </div>) : null;
      var downloadStateNode = null, buttonsNode = null;
      if (this.file.downloadState) {
        var ds = this.file.downloadState;
        downloadStateNode = (
          <div className="download">{ds.state}&nbsp;
            {ds.progress === null ? null : ds.progress + '%'}
          </div>);
      } else {
        buttonsNode = (
          <div>
            {this.file.cached ? <div className="btn btn-safe" onTouchEnd={this.handleOpen}>Open</div>
              : <div className="btn btn-safe" onTouchEnd={this.handleDownload}>Download</div>}

            {this.file.cached ?
              <div className="btn btn-danger" onTouchEnd={this.handleRemoveLocal}>Remove from this device</div> : null }

            {this.file.cached ? <div className="btn btn-danger" onTouchEnd={this.handleRemove}>Remove from this device and your
              cloud</div>
              : <div className="btn btn-danger" onTouchEnd={this.handleRemove}>Remove from your cloud</div>}

            {this.file.creator === Peerio.user.username ?
              <div className="btn btn-danger" onTouchEnd={this.handleNuke}>Unshare and destroy in all
                clouds</div> : null }
          </div>);
      }

      // TODO: replace onTouchEnd with globalTapHandler mixin. these buttons need tap event, because scroll is a possibility
      return (
        <div className="content without-tab-bar file-view">
          <div className="head">
            <i className={'file-type fa fa-' + this.file.icon}></i>
            {this.file.name}
          </div>
          <div className="info-blocks">
            <div className="block">
              <div className="block-title">File size</div>
              <div className="block-content">{this.file.humanSize}</div>
            </div>
            <div className="block">
              <div className="block-title">Location</div>
              <div className="block-content">{this.file.cached ? 'On this device and in the cloud' : 'In the cloud'}</div>
            </div>
            <div className="block">
              <div className="block-title">Uploaded by</div>
              <div className="block-content">{this.file.creator === Peerio.user.username ? 'You' : this.file.creator}</div>
            </div>
            <div className="block">
              <div className="block-title">Uploaded at</div>
              <div className="block-content">{new Date(this.file.timestamp).toLocaleString()}</div>
            </div>
            {sender}
          </div>
          {downloadStateNode || buttonsNode}

        </div>
      );

    }
  });

}());
