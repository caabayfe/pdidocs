showRelatedRecord();

function showRelatedRecord() {
    var tableName = current.getValue('table_name');
    var recordGuid = current.getValue('record_guid');
    if (!tableName || !recordGuid) {
        action.setRedirectURL(current);
        gs.addInfoMessage(gs.getMessage('No related record was found to display'));
        return;
    }

    var gr = new GlideRecord(tableName);
    if (gr.get(recordGuid)) {
        action.setReturnURL(current); //when user clicks back btn, redirects to right page.
        action.setRedirectURL(gr);
    } else {
        action.setRedirectURL(current);
        gs.addInfoMessage(gs.getMessage('No related record was found to display'));
    }
}
