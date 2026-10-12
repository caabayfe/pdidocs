(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var gr = new GlideRecord("ds_folder_references");
    gr.addQuery("folder", current.folder);
    gr.addQuery("table_name", current.table_name);
    gr.addQuery("target_record", current.target_record);
    gr.query();

    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('This folder reference already exists.'));
        current.setAbortAction(true);
    }

})(current, previous);
