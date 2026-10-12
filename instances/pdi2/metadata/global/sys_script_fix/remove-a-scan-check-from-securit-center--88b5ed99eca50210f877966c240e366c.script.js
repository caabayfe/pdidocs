//delete the scan check
var gr = new GlideRecord("scan_script_only_check");
gr.setWorkflow(false);
gr.addQuery("sys_id","808004148713001001c8de05b7cb0b6e");
gr.query();
if (gr.next())
    gr.deleteRecord();

//delete the scan_check and suite mapping
gr = new GlideRecord("scan_check_suite_check");
gr.setWorkflow(false);
gr.addQuery("sys_id", "52d225001b18101046e87733cd4bcbf1");
gr.query();
if (gr.next())
    gr.deleteRecord();
