(function executeRule(current, previous /*null when async*/ ) {
    var documentSysId = current.document;
    var documentDB = new PlatformDocMgmtDB();
    var numberOfApprovers = documentDB.getNumberOfApprovers(documentSysId);
    var numberOfReviewers = documentDB.getNumberOfReviewers(documentSysId);

    if (numberOfApprovers !== 0 || numberOfReviewers !== 0)
        return;

    var documentGr = GlideRecord("ds_document");
    documentGr.get(documentSysId);

    if (documentGr.state == 'expired') {
        PlatformDocMgmt.publishVersion(current.sys_id, documentSysId);
        PlatformDocMgmt.notifyDocumentOwner(documentSysId, current.sys_id);
        return;
    }

    documentGr.setValue("state", "active");
    documentGr.update();

    PlatformDocMgmt.publishVersion(current.sys_id, documentSysId);

})(current, previous);
