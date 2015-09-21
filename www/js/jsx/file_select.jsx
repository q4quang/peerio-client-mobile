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

      return (
        <div className="modal contact-select">
          <ul className="contact-list">
            {files}
          </ul>
          <div className="buttons col-12">
            <Peerio.UI.Tappable element="div" className="btn-lrg" onTouchStart={this.accept}>OK</Peerio.UI.Tappable>
            <Peerio.UI.Tappable element="div" className="btn-lrg btn-dark" onTouchStart={this.props.onClose}>Cancel</Peerio.UI.Tappable>
          </div>
        </div>
      );
    }
  });

}());