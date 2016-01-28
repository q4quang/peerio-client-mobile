(function () {
    'use strict';

    Peerio.UI.FileView = React.createClass({
        mixins: [ReactRouter.Navigation],
        componentWillMount: function () {
            this.subscription = [
                Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null))
            ];
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscription);
        },
        handleOpen: function () {
            Peerio.FileSystem.openFileWithOS(Peerio.user.files.dict[this.props.params.id])
                .catch(function (err) {
                    alert('Failed to open file. ' + err);
                });
        },
        handleDownload: function () {
            var file = Peerio.user.files.dict[this.props.params.id];
            if (file.size / 1024 / 1024 > 100) {

                Peerio.Action.showConfirm({
                    headline: 'Beta warning',
                    text: 'Downloading files over 100MB may cause Peerio to crash. We are working to solve this issue. Would you still like to try downloading this file?',
                    onAccept: ()=>this.doDownload(file)
                });
            } else this.doDownload(file);
        },
        doDownload: function (file) {
            file.download()
                .catch((error) => {
                    Peerio.Action.showAlert({text: 'Unable to download a file: ' + error});
                });
        },
        handleRemoveLocal: function () {
            Peerio.Action.showConfirm({
                headline: 'Remove file from this device?',
                text: 'This file will be deleted from your device and cloud, but will still be available to users who you have shared it with.',
                onAccept: ()=>Peerio.user.files.dict[this.props.params.id].deleteFromCache()
            });
        },
        handleRemove: function () {
            Peerio.Action.showConfirm({
                headline: 'Remove this file?',
                text: 'This file will be deleted from your device and cloud, but will still be available to users who you have shared it with.',
                onAccept: ()=>Peerio.user.files.dict[this.props.params.id].remove()
            });
        },
        handleNuke: function () {
            Peerio.Action.showConfirm({
                headline: 'Destroy file completely?',
                text: 'This file will be deleted from your device, cloud and from the clouds of other users who you have shared it with.',
                onAccept: ()=>Peerio.user.files.dict[this.props.params.id].nuke()
            });
        },
        render: function () {
            var H = Peerio.Helpers;
            var file = Peerio.user.files.dict[this.props.params.id];
            if (!file) {
                this.goBack();
                return null;
            }

            if (!file.icon) file.icon = 'list-item-thumb file-type fa fa-' + H.getFileIconByName(file.name) + (file.cached ? ' cached' : '');
            if (!file.humanSize) file.humanSize = H.bytesToSize(file.size);

            var sender = file.sender ? (
              <li>
                <label>Shared by</label>
                <div className="info-content">{file.sender}</div>
              </li>) : null;
            var downloadStateNode = null, buttonsNode = null;
            if (file.downloadState) {
                var ds = file.downloadState;
                downloadStateNode = (<div className="info-banner">{ds.stateName} {ds.percent}</div>);
            } else {
                buttonsNode = (
                    <div className="buttons">
                      {file.cached ? <div className="btn-safe" onTouchEnd={this.handleOpen}>Open</div>
                      : <div className="btn-safe" onTouchEnd={this.handleDownload}>
                    <i className="material-icons">cloud_download</i>Download</div>}

                        {file.cached ?
                            <div className="btn-danger" onTouchEnd={this.handleRemoveLocal}><i
                                className="material-icons">delete</i>Remove from your device</div> : null }

                        {file.cached ?
                            <div className="btn-danger" onTouchEnd={this.handleRemove}>Remove from your device and cloud</div>
                            :
                            <div className="btn-danger" onTouchEnd={this.handleRemove}>Remove from your cloud</div>}

                        {file.creator === Peerio.user.username ?
                            <div className="btn-danger" onTouchEnd={this.handleNuke}>Unshare and remove from all
                                clouds</div> : null }
                    </div>);
            }

            // TODO: replace onTouchEnd with globalTapHandler mixin. these buttons need tap event, because scroll is a possibility

            return (
                <div className="content without-tab-bar without-footer">
                    <ul>
                        <li>
                            <i className={'file-type fa fa-' + file.icon}></i>
                            <div className="headline-md">
                              {file.name}

                            </div>
                        </li>
                    </ul>
                    <ul className="flex-list">
                        <li>
                            <label>File Name</label>
                            <div className="info-content">{file.name}</div>
                        </li>
                        <li>
                            <label>File Size</label>
                            <div className="info-content">{file.humanSize}</div>
                        </li>

                        <li>
                            <label>File Type</label>
                            <div className="info-content">{Peerio.Helpers.getFileTypeByName(file.name)}</div>
                        </li>

                        <li>
                            <label>Location</label>
                            <div
                                className="info-content">{file.cached ? 'On this device and in the cloud' : 'In the cloud'}</div>
                        </li>
                        <li>
                            <label>Owner</label>
                            <div className="info-content">
                                {file.creator === Peerio.user.username ? 'You' : file.creator}
                            </div>
                        </li>
                        <li>
                            <label>Uploaded at</label>
                            <div className="info-content">{new Date(file.timestamp).toLocaleString()}</div>
                          </li>

                        {sender}

                    </ul>

                    {downloadStateNode || buttonsNode}

                </div>
            );

        }
    });

}());
