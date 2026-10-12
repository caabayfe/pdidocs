(function executeRule(current, previous /*null when async*/ ) {
    // Add your code here
    var documentSysId = current.document;
    var docDB = new global.PlatformDocMgmtDB();
    var versionCount = docDB.getVersionCount(documentSysId);
    if (versionCount == 0) {
        var gr = new GlideRecord("ds_document");
        if (gr.get(documentSysId)) {
            if (gr.state != 'expired') {
                gr.setValue("state", "draft");
                gr.update();
            }
        }
    }
})(current, previous);
