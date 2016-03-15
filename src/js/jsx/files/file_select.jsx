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
        },
        componentWillUnmount: function () {
            Peerio.Dispatcher.unsubscribe(this.subscription);
        },
        toggle: function (fileID) {

            this.setState(function (prevState) {
                var ind = prevState.selection.indexOf(fileID);
                if (ind >= 0)
                    prevState.selection.splice(ind, 1);
                else
                    prevState.selection.push(fileID);
            });
        },
        accept: function () {
            Peerio.Action.filesSelected(this.state.selection);
            this.props.onClose();
        },
        upload: function () {
            Peerio.Action.showFileUpload();
        },
        render: function () {
            var files = [];
            Peerio.user.files.arr.forEach(function (f) {

                var isSelected = this.state.selection.indexOf(f.id) >= 0;

                files.push(
                    <Peerio.UI.Tappable key={f.id} onTap={this.toggle.bind(this,f.id)} element="li"
                    className={isSelected ? 'selected' : null }>
                      <div type="checkbox"
                      className={ 'checkbox-input ' + (isSelected ? 'checked' : null )}>
                        <i className="material-icons"></i>
                            </div>
                                <div className="username">{f.name}</div>
                    </Peerio.UI.Tappable>
                );
            }.bind(this));


            var uploads = [];
            if (Peerio.user.uploads.length) {
                Peerio.user.uploads.forEach(function (file) {
                    var u = file.uploadState;
                    uploads.push(
                        <li className='contact'>
              <span className="username">
                 <i
                     className="fa fa-circle-o-notch fa-spin"></i> {u.stateName} {u.totalChunks ? u.currentChunk + ' of ' + u.totalChunks : ''}
              </span>
                        </li>);
                });
            }

            if (Peerio.user.files && Peerio.user.files.arr.length === 0) {
                var intro_content = (<div className="content-intro">
                    <img className="peerio-logo" src="media/img/peerio-logo-light.png"/>

                  <div className="headline">Peerio File Storage!</div>

                    <p>Peerio lets you store files in the cloud securely. Try it out by uploading a file.</p>

                    <img style={{maxWidth:'100px', display:'block', margin:'0 auto'}}
                         src="media/img/home-bigfilesok.png"/>
                </div>);
                files.push(intro_content);
            }

            return (
                <div className="modal item-select">
                  <div className="subhead">
                  Select your files
                  </div>
                  <ul>
                  {files}
                  {uploads}
                  </ul>
                  {/*
                    <div className="buttons">
                        <Peerio.UI.Tappable element="div" className="btn-safe"
                                            onTap={this.accept}>OK</Peerio.UI.Tappable>
                                          <Peerio.UI.Tappable element="div" className="btn-primary" onTap={this.upload}>Upload new
                            file</Peerio.UI.Tappable>
                          <Peerio.UI.Tappable element="div" className="btn-dark"
                                            onTap={this.props.onClose}>Cancel</Peerio.UI.Tappable>
                    </div>
                    */}

                  <div id="footer">
                    <Peerio.UI.Tappable element="div" className="btn-icon-stacked"
                    onTap={this.props.onClose}>
                    <i className="material-icons">cancel</i>
                    <label>Cancel</label></Peerio.UI.Tappable>

                    <Peerio.UI.Tappable element="div" className="btn-icon-stacked" onTap={this.upload}>
                      <i className="material-icons">cloud_upload</i>
                      <label>Upload file</label>
                    </Peerio.UI.Tappable>

                    <Peerio.UI.Tappable element="div" className="btn-icon-stacked" onTap={this.accept}>
                      <i className="material-icons">attach_file</i>
                      <label>Attach</label>
                    </Peerio.UI.Tappable>
                  </div>
                </div>
            );
        }
    });

}());
