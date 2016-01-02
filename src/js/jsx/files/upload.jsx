(function () {
    'use strict';

    Peerio.UI.Upload = React.createClass({
        handleTakePicture: function (camera) {
            Peerio.NativeAPI.takePicture(camera)
                .then((fileUrl) => {
                    return new Promise((resolve, reject) => {
                        var fileExtension = Peerio.Helpers.getFileExtension(fileUrl);
                        var fileName = Peerio.Helpers.getFileNameWithoutExtension(fileUrl);
                        Peerio.UI.Prompt.show({
                                text: 'Enter filename:',
                                promptValue: fileName,
                                minLength: 1
                            })
                            .then((fileName) => {
                                resolve({
                                    fileUrl: fileUrl,
                                    fileName: fileName + '.' + fileExtension
                                });
                            })
                            .catch(reject);
                    });
                })
                .then(function (file) {
                    return Peerio.user.uploadFile(file)
                        .finally(function () {
                            if (camera) Peerio.NativeAPI.cleanupCamera();
                        });
                })
                .then(function () {
                    Peerio.Action.showAlert({text: 'Upload complete'});
                })
                .catch(function (err) {
                    Peerio.Action.showAlert({text: 'Upload failed. ' + err});
                });
            this.props.onClose();
        },
        render: function () {
            return (
                <div className="modal contact-select file-upload">
                    <Peerio.UI.Tappable element="div" onTap={this.handleTakePicture} className="btn-lrg">
                        <i className="fa fa-th"></i> Pick from photo library
                    </Peerio.UI.Tappable>
                    <Peerio.UI.Tappable element="div" onTap={this.handleTakePicture.bind(this,true)}
                                        className="btn-lrg">
                        <i className="fa fa-camera-retro"></i> Take a new picture
                    </Peerio.UI.Tappable>
                    <Peerio.UI.Tappable element="div" onTap={this.props.onClose} className="btn-lrg btn-dark">
                        <i className="fa fa-times"></i> Cancel
                    </Peerio.UI.Tappable>
                </div>
            );

        }
    });

}());
