/**
 *
 * File selector component
 *
 * todo: join this with contact selector and make it a universal select component
 */

(function () {
  'use strict';

  Peerio.UI.FileSelect = React.createClass({
    mixins: [Peerio.UI.Mixins.GlobalTap],
    getInitialState: function () {
      return {visible: false};
    },
    componentWillMount: function () {
      this.subscriptions = [
        Peerio.Dispatcher.onShowFileSelect(this.show),
        Peerio.Dispatcher.onFilesUpdated(this.forceUpdate.bind(this, null))
      ];
      if (!Peerio.user.filesLoaded) {
        Peerio.Data.loadFiles();
      }
    },
    componentWillUnmount: function () {
      Peerio.Dispatcher.unsubscribe(this.subscriptions);
    },
    show: function (selection) {
      if (this.state.visible) {
        console.error('File selector is already open.');
        return;
      }
      this.selection = selection || [];
      Peerio.Actions.navigatedIn('Ok', this.accept);
      Peerio.Dispatcher.onNavigateBack(this.cancel);
      this.setState({visible: true});
    },
    cancel: function () {
      if (this.state.visible === false) return;

      this.setState({visible: false}, function () {
        this.selection = null;
        Peerio.Actions.navigatedOut();
      });
      return true;
    },
    accept: function () {
      this.setState({visible: false}, function () {
        Peerio.Actions.filesSelected(this.selection);
        this.selection = null;
        this.setState({visible: false});
        Peerio.Actions.navigatedOut();
      });
    },
    globalTapHandler: function (e) {
      var item = Peerio.Helpers.getParentWithClass(e.target, 'contact');
      if (!item) return;
      this.toggle(item.attributes['data-fileid'].value);
    },
    toggle: function (fileid) {
      var ind = this.selection.indexOf(fileid);
      if (ind >= 0)
        this.selection.splice(ind, 1);
      else
        this.selection.push(fileid);

      this.forceUpdate();

    },
    render: function () {
      if (!this.state.visible) return null;
      var files = [];
      //todo: ugly, think of something better
      if (Peerio.user.filesLoaded) {
        _.forOwn(Peerio.user.files, function (f) {
          var checkMark = this.selection.indexOf(f.id) >= 0
            ? (<i className="fa fa-check-circle"></i>) : '';

          files.push(
            <li className="contact" data-fileid={f.id} key={f.localName}>
            {checkMark}
              <span className="username">{f.name}</span>
            </li>
          );
        }.bind(this));
      } else {
        files = <li>Loading files, please wait...</li>;
      }

      return (
        <ul className="contact-select file-select" onTouchStart={this.registerTouchStart} onTouchEnd={this.registerTouchEnd}>
          {files}
        </ul>
      );
    }
  });

}());