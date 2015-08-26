/**
 *
 * File selector component
 *
 * todo: join this with contact selector and make it a universal select component
 */

(function () {
  'use strict';

  Peerio.UI.FileSelect = React.createClass({
    getInitialState: function () {
      return {selection: this.props.preselected || []};
    },
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
      if (this.state.files) {
        this.state.files.forEach(function (f) {
          var checkMark = this.state.selection.indexOf(f.id) >= 0
            ? (<i className="fa fa-check-circle"></i>) : '';

          files.push(
            <Peerio.UI.Tappable key={f.id} onTap={this.toggle.bind(this,f.id)}>
              <li className="contact">
                {checkMark}
                <span className="username">{f.name}</span>
              </li>
            </Peerio.UI.Tappable>
          );
        }.bind(this));
      }
      return (
        <div className="modal contact-select">
          <ul className="contact-list">
            {files}
          </ul>
          <div className="buttons">
            <button type="button" className="btn-lrg" onTouchStart={this.accept}>OK</button>
            <button type="button" className="btn-lrg btn-dark" onTouchStart={this.props.onClose}>Cancel</button>
          </div>
        </div>
      );
    }
  });

}());