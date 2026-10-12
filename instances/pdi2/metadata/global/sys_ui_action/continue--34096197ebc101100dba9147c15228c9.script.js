new ScanAjaxProcessor().collectUsageMetric('scheduled_scan_ui_submit_new_record_button_clicked');

answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
action.setRedirectURL(current);
