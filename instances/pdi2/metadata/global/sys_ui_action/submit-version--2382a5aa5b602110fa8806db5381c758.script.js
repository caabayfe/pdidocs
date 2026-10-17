launchWorkflow();

function launchWorkflow() {
    var documentGr = GlideRecord("ds_document");
    documentGr.get(current.document);

    var isExpired = (documentGr.state == 'expired');

    if (!isExpired) {
        documentGr.setValue("state", "active");
        documentGr.update();
    }

    var documentSysId = current.document;
    var documentDB = new PlatformDocMgmtDB();
    var numberOfApprovers = documentDB.getNumberOfApprovers(documentSysId);
    var numberOfReviewers = documentDB.getNumberOfReviewers(documentSysId);

    if (numberOfReviewers > 0) {
        current.version_state = "awaiting_review";
    } else if (numberOfReviewers == 0 && numberOfApprovers > 0) {
        current.version_state = "awaiting_approval";
    } else {
        current.version_state = "awaiting_review";
    }
    current.update();

    if (isExpired)
        gs.eventQueue(
            'ds.document.version.submitted.on.expired',
            documentGr,
            documentGr.getValue('owner'),
            current.getUniqueValue()
        );

    var sm = new GCFSampleMap();
    sm.put('submitted', true);
    GCFCollector.recordUsageEvent('documents', 'document_management', 'version', sm);
}
