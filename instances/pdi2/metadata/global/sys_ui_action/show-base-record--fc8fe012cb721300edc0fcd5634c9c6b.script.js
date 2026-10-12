function abort() {
	gs.addErrorMessage(gs.getMessage("Base record not found!"));
	action.setRedirectURL(current);
}
var gr = new GlideRecord("sys_copied_base_upgrade_log_mapping");
gr.addQuery("copied_record_upgrade_log", current.sys_id);
gr.query();

if (!gr.next())
	abort();	

var baseLog = new GlideRecord("sys_upgrade_history_log");
if(!baseLog.get(gr.getValue("base_record_upgrade_log")))
	abort();

var base_record = new BaseUpgradeLogAPI().getUpgradedRecord(baseLog.getValue("file_name"));
if (!base_record) 
	abort();

action.setRedirectURL(base_record);
action.setReturnURL(current);
