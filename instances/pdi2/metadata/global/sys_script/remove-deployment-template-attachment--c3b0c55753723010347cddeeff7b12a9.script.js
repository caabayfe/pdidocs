(function executeRule(current, previous /*null when async*/ ) {
    var attachmentId = current.file_attachment;
    if (attachmentId) {
        var sa = new GlideSysAttachment();
        sa.deleteAttachment(attachmentId);
    }
})(current, previous);
