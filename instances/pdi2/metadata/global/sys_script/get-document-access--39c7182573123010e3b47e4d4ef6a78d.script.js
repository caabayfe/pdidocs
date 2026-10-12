(function executeRule(current, previous /*null when async*/ ) {
    // Add your code here
    var a = new global.DocumentObjectSecurity();
    g_scratchpad.canWrite = a.canWriteDocumentId(current.document);
    g_scratchpad.canDelete = a.canDeleteDocumentId(current.document);
})(current, previous);
