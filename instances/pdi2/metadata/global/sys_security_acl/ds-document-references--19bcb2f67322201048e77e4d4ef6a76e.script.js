(function() {
    var a = new global.DocumentObjectSecurity();
    var gr = new GlideRecord(current.table_name);
    if (gr.get(current.target_record))
        return gr.canWrite() && a.canReadDocumentId(current.document);
    return false;
})();
