(function () {
    'use strict';

    Peerio.UI.Files = React.createClass({
        mixins: [ReactRouter.Navigation],

        componentDidMount: function () {
            this.subscriptions = [
                Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null)),
                Peerio.Dispatcher.onUnreadStateChanged(this.handleUnreadStateChange.bind(this))
            ];
            this.handleUnreadStateChange();
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscriptions);
        },
        handleUnreadStateChange: function () {
            if(!Peerio.user.unreadState.files) return;

            window.setTimeout(()=> {
                if (this.isMounted() && Peerio.user.unreadState.files)
                    Peerio.user.setFilesUnreadState(false);
            }, 2000);

        },
        openFileView: function (id) {
            this.transitionTo('file', {id: id});
        },
        render: function () {
            var nodes = [];
            if (Peerio.user.files) {
                Peerio.user.files.arr.forEach(function (item) {
                    nodes.push(
                        <Peerio.UI.FileItem className="list-item" item={item}
                                            onTap={this.openFileView.bind(this, item.shortID)}>
                        </Peerio.UI.FileItem>
                    );
                }.bind(this));
            }
            else {
                nodes = Peerio.UI.ItemPlaceholder.getPlaceholdersArray();
            }
            var uploadNodes;
            if (Peerio.user.uploads.length > 0) {
                uploadNodes = [];
                Peerio.user.uploads.forEach(function (file) {
                    var u = file.uploadState;
                    uploadNodes.push(
                        <div className="list-item">
                            <i className="list-item-thumb file-type fa fa-cloud-upload"></i>
                            <div className="list-item-content">
                                <div
                                    className="list-item-title"><i
                                    className="fa fa-circle-o-notch fa-spin"></i> {u.stateName} {u.totalChunks ? u.currentChunk + ' of ' + u.totalChunks : ''}
                                </div>
                                <div className="list-item-description">{file.name}</div>
                            </div>
                        </div>);
                });
            }
            /* if there are no files show a placeholder instead */
            var content =
                (Peerio.user.files && Peerio.user.files.arr.length === 0) ?
                    <div className="content list-view">
                        <div className="content-intro">
                            <img className="peerio-logo" src="media/img/peerio-logo-light.png"/>

                            <h1 className="headline-lrg">Peerio File Storage!</h1>

                            <p>Peerio lets you store files in the cloud securely. Try it out by uploading a file.</p>
                            <img style={{maxWidth:'100px', display:'block', margin:'0 auto'}}
                                 src="media/img/home-bigfilesok.png"/>
                        </div>
                    </div>
                    :
                    <div className="content">
                        <ul className="list-view">
                            {uploadNodes}
                            {nodes}
                        </ul>
                    </div>;

            return content;
        }
    });

    Peerio.UI.FileItem = React.createClass({
        getInitialState: function () {
            return {swiped: false};
        },
        closeSwipe: function () {
            this.setState({swiped: false});
        },
        openSwipe: function () {
            this.setState({swiped: true});
        },
        destroyFileAfterAnimate: function () {
            var fileID = this.props.item.shortID;
            this.setState({destroyAnimation: true}, function () {
                setTimeout(function () {
                    Peerio.user.files.dict[fileID].remove()
                }, 600);
            });
        },
        showDestroyDialog: function () {
            var destroyFileAfterAnimate = this.destroyFileAfterAnimate;
            Peerio.Action.showConfirm({
                headline: 'Remove this file?',
                text: 'This file will be deleted from your device and cloud, but will still be available to users who you have shared it with.',
                onAccept: destroyFileAfterAnimate
            });
        },
        render: function () {
            var H = Peerio.Helpers;
            var item = this.props.item;
            var cx = React.addons.classSet;
            var classes = cx({
                'list-item': true,
                'swiped': this.state.swiped,
                'list-item-animation-leave': this.state.destroyAnimation
            });

            if (!item.icon) item.icon = 'list-item-thumb file-type fa fa-' + H.getFileIconByName(item.name) + (item.cached ? ' cached' : '');
            if (!item.humanSize) item.humanSize = H.bytesToSize(item.size);

            var downloadStateNode = null;
            if (item.downloadState) {
                var ds = item.downloadState;
                downloadStateNode = (
                    <div className="download">{ds.stateName}&nbsp;
                        {ds.percent}
                    </div>);
            }

            var cacheState = item.cached ? <i className="fa fa-floppy-o p-blue-dark-10">&nbsp;</i> : null;

            var timestamp = moment(item.timestamp).calendar();

            return (<Peerio.UI.Tappable element="li" className={classes} key={item.shortID} onTap={this.props.onTap}>
                <Peerio.UI.Swiper onSwipeLeft={this.openSwipe} onSwipeRight={this.closeSwipe}
                                  className="list-item-swipe-wrapper">
                    <i className={item.icon}></i>

                    <div className="list-item-content">
                        <div className="list-item-title">{cacheState} {this.props.item.name}</div>
                        <div
                            className="list-item-description">{this.props.item.humanSize}&nbsp;&bull;&nbsp;{timestamp}</div>
                        {downloadStateNode}
                    </div>
                    <div className="list-item-forward">
                        <i className="fa fa-chevron-right"></i>
                    </div>
                    <Peerio.UI.Tappable className="list-item-swipe-content" onTap={this.showDestroyDialog}>
                        <i className="fa fa-trash-o"></i>
                    </Peerio.UI.Tappable>
                </Peerio.UI.Swiper>
            </Peerio.UI.Tappable>);

        }
    });

}());
