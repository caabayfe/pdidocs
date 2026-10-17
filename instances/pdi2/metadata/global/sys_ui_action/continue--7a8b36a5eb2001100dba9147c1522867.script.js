new ScanAjaxProcessor().collectUsageMetric('scheduled_scan_ui_submit_new_record_button_clicked');

if (GlideTableDescriptor.get(current.table).isColumnarTable()) {
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("Data Management Delete cannot be created for columnar table [{0}]", current.table + ""));
} else {
    answer = current.insert();
    gs.include('ActionUtils');
    var au = new ActionUtils();
    au.postInsert(current);
    action.setRedirectURL(current);
}
