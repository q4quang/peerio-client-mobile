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
          if (!item.icon) item.icon = 'list-item-thumb file-type fa fa-' + H.getFileIconByName(item.name) + (item.cached ? ' cached' : '');
          if (!item.humanSize) item.humanSize = H.bytesToSize(item.size);
          var downloadStateNode = null;
          if (item.downloadState) {
            var ds = item.downloadState;
            downloadStateNode = (
              <div className="download">{ds.state}&nbsp;
                {ds.progress === null ? null : ds.progress + '%'}
              </div>);
          }
          var timestamp = moment(item.timestamp).calendar();
          nodes.push(
            <Peerio.UI.Tappable key={item.shortId} onTap={this.openFileView.bind(this, item.shortId)}>
              <li className="list-item">
                <i className={item.icon}></i>
                <div className="list-item-content">
                  <div className="list-item-title">{item.name}</div>
                  <div className="list-item-description">{item.humanSize}&nbsp;&bull;&nbsp;{timestamp}</div>
                  {downloadStateNode}
                </div>
                <div className="list-item-forward">
                  <i className="fa fa-chevron-right"></i>
                </div>
              </li>
            </Peerio.UI.Tappable>
          );
        }.bind(this));
      }
      else nodes = Peerio.UI.ItemPlaceholder.getPlaceholdersArray();

      return (
        <div className="content">
          <ul className="list-view">
            {nodes}
          </ul>
        </div>
      );
    }
  });

}());
