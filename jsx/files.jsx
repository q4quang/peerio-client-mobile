(function () {
  'use strict';

  Peerio.UI.Files = React.createClass({
    mixins:[ReactRouter.Navigation],
    componentWillMount: function () {
      this.setState({files: Peerio.Files.cache});
    },
    componentDidMount: function () {
      Peerio.Files.getAllFiles()
        .then(function (files) {
          if (!this.isMounted()) return;
          this.setState({files: files});
        }.bind(this));
    },
    openFileView: function (id) {
      this.transitionTo('file', {id: id});
    },
    render: function () {
      var H = Peerio.Helpers;
      var nodes = [];
      if (this.state.files) {
        this.state.files.forEach(function (item) {
          // todo: preprocess somewhere else?
          if (!item.icon) item.icon = 'file-type fa fa-' + H.getFileIconByName(item.name) + (item.cached ? ' cached' : '');
          if (!item.humanSize) item.humanSize = H.bytesToSize(item.size);
          var downloadStateNode = null;
          if (item.downloadState) {
            var ds = item.downloadState;
            downloadStateNode = (
              <div className="download">{ds.state}&nbsp;
                {ds.progress === null ? null : ds.progress + '%'}
              </div>);
          }
          nodes.push(
            <Peerio.UI.Tappable key={item.shortId} onTap={this.openFileView.bind(this, item.shortId)}>
              <div className="file-list-item">
                <i className={item.icon}></i>
                <span className="name">{item.name}</span>
                <br/>
                <span className="size">{item.humanSize}</span>
                {downloadStateNode}
              </div>
            </Peerio.UI.Tappable>
          );
        }.bind(this));
      }
      else nodes = Peerio.UI.ItemPlaceholder.getPlaceholdersArray();

      return (
        <div className="content" id="file-list">
          {nodes}
        </div>
      );
    }
  });

}());
