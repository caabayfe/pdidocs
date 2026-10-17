(function executeRule(current, previous /*null when async*/ ) {

    var glideCACertificateUploader = new SNC.GlideCACertificateUploader();
    var status = glideCACertificateUploader.deleteSingleCACertificate(current);

    if (!status)
        current.setAbortAction(true);

})(current, previous);
