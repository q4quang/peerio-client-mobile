/**
 *
 * File selector component
 *
 * todo: join this with contact selector and make it a universal select component
 */

//todo fix potential bug: when file deleted while selected it might still be in the selection

(function () {
  'use strict';

  Peerio.UI.FileSelect = React.createClass({
    getInitialState: function () {
      return {selection: this.props.preselected || []};
    },
    componentDidMount: function () {
      this.subscription = Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null));
      Peerio.Files.getAllFiles();
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.subscription);
    },
    toggle: function (fileId) {

      this.setState(function (prevState) {
        var ind = prevState.selection.indexOf(fileId);
        if (ind >= 0)
          prevState.selection.splice(ind, 1);
        else
          prevState.selection.push(fileId);
      });
    },
    accept: function () {
      Peerio.Action.filesSelected(this.state.selection);
      this.props.onClose();
    },
    upload: function(){
      Peerio.Action.showFileUpload();
    },
    render: function () {
      var files = [];
      //todo: loading indicator
      if (Peerio.Files.cache) {
        Peerio.Files.cache.forEach(function (f) {

          var isSelected = this.state.selection.indexOf(f.id) >= 0;

          files.push(
            <Peerio.UI.Tappable key={f.id} onTap={this.toggle.bind(this,f.id)}>
              <li className={isSelected ? 'contact selected' : 'contact'}>
                <span type="checkbox" className={isSelected ? 'checkbox-input checked' : 'checkbox-input' }></span>
                <span className="username">{f.name}</span>
              </li>
            </Peerio.UI.Tappable>
          );
        }.bind(this));
      } else files.push(<li>Please wait...</li>);

      var uploads = [];
      if (Peerio.Files.uploads.length) {
        Peerio.Files.uploads.forEach(function (u) {
          uploads.push(
            <li className='contact'>
              <span className="username">
                 <i
                   className="fa fa-circle-o-notch fa-spin"></i> {u.stateName} {u.totalChunks ? u.currentChunk + ' of ' + u.totalChunks : ''}
              </span>
            </li>);
        });
      }

      return (
        <div className="modal contact-select">
          <ul className="contact-list">
            {uploads}
            {files}
          </ul>
          <div className="buttons col-12">
            <Peerio.UI.Tappable element="div" className="btn-lrg" onTap={this.accept}>OK</Peerio.UI.Tappable>
            <Peerio.UI.Tappable element="div" className="btn-lrg" onTap={this.upload}>Upload new file</Peerio.UI.Tappable>
            <Peerio.UI.Tappable element="div" className="btn-lrg btn-dark"
                                onTap={this.props.onClose}>Cancel</Peerio.UI.Tappable>
          </div>
        </div>
      );
    }
  });

}());