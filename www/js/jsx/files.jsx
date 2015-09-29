(function () {
  'use strict';

  Peerio.UI.Files = React.createClass({
    mixins:[ReactRouter.Navigation],

    componentDidMount: function () {
      this.subscription = Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null));
      Peerio.Files.getAllFiles();
    },
    componentWillUnmount: function(){
      Peerio.Dispatcher.unsubscribe(this.subscription);
    },
    openFileView: function (id) {
      this.transitionTo('file', {id: id});
    },
    render: function () {
      var nodes = [];
      if (Peerio.Files.cache && Peerio.Files.cache.length > 0) {
        Peerio.Files.cache.forEach(function (item) {
          nodes.push(
            <Peerio.UI.FileItem className="list-item" item={item} onTap={this.openFileView.bind(this, item.shortId)}>
            </Peerio.UI.FileItem>
          );
        }.bind(this));
      }
      //New account placeholder
      //TODO: requires file upload action
      else if (Peerio.Files.cache && Peerio.Files.cache.length == 0) {
        nodes = <div className="content-intro">
                  <img className="peerio-logo" src="media/img/Peerio_LogoLight.png"/>
                  <h1 className="headline-lrg">Peerio File Storage!</h1>
                  <p>Peerio lets you store files in the cloud securely. Try it out by uploading a file.</p>
                  <Peerio.UI.Tappable element="div" className="btn-md">
                    <i className="fa fa-cloud-upload"></i>&nbsp;Upload a file
                  </Peerio.UI.Tappable>
                  <img style={{maxWidth:"100px", display:"block", margin:"0 auto"}} src="media/img/home-bigfilesok.png"/>
                </div>;
      }
      else {
        nodes = Peerio.UI.ItemPlaceholder.getPlaceholdersArray();
      }

      return (
        <div className="content">
          <ul className="list-view">
            {nodes}
          </ul>
        </div>
      );
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
      var fileId = this.props.item.shortId;
      this.setState({destroyAnimation:true}, function(){
        setTimeout( Peerio.Files.delete(fileId), 600);
      });
    },
    showDestroyDialog: function () {
      var destroyFileAfterAnimate = this.destroyFileAfterAnimate;
      Peerio.Action.showConfirm({headline:"Remove this file?",
        text:'This file will be deleted from your device and cloud, but will still be available to users who you have shared it with.',
        onAccept: destroyFileAfterAnimate});
    },
    render: function(){
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

      return  <Peerio.UI.Tappable element="li" className={classes} key={item.shortId} onTap={this.props.onTap}>
                <Peerio.UI.Swiper onSwipeLeft={this.openSwipe} onSwipeRight={this.closeSwipe} className="list-item-swipe-wrapper">
                  <i className={item.icon}></i>
                  <div className="list-item-content">
                    <div className="list-item-title">{cacheState}{this.props.item.name}</div>
                    <div className="list-item-description">{this.props.item.humanSize}&nbsp;&bull;&nbsp;{timestamp}</div>
                    {downloadStateNode}
                  </div>
                  <div className="list-item-forward">
                    <i className="fa fa-chevron-right"></i>
                  </div>
                  <Peerio.UI.Tappable className="list-item-swipe-content" onTap={this.showDestroyDialog}>
                    <i className="fa fa-trash-o"></i>
                  </Peerio.UI.Tappable>
                </Peerio.UI.Swiper>
              </Peerio.UI.Tappable>;

    }
  });


}());