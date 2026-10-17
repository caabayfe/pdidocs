(function executeRule(current, previous /*null when async*/) {
    var menuConfigSysId = getMenuConfigSysId(current);
    deleteListRecords(menuConfigSysId);
    deleteListCategory(menuConfigSysId);
    deleteMenuConfig(menuConfigSysId);
    deleteApplicability(current);
	
})(current, previous);
function getMenuConfigSysId(current) {
	var gr = new GlideRecord("sys_ux_page_property");
    gr.addQuery('page.sys_id', current.sys_id);
    gr.addQuery('name', 'listConfigId');
    gr.query();
    gr.next();
	return gr.getValue('value');
}
function deleteListRecords(menuConfigSysId) {
    var gr = new GlideRecord("sys_ux_list");
    gr.addQuery('configuration.sys_id', menuConfigSysId);
    gr.query();
    gr.deleteMultiple();
}
function deleteListCategory(menuConfigSysId) {
    var gr = new GlideRecord("sys_ux_list_category");
    gr.addQuery('configuration.sys_id', menuConfigSysId);
    gr.query();
    gr.deleteMultiple();
}
function deleteMenuConfig(menuConfigSysId) {
    var gr = new GlideRecord("sys_ux_list_menu_config");
    gr.get('sys_id', menuConfigSysId);
    gr.deleteRecord();
}
function deleteApplicability(current) {
	var applicabilitySysId = getApplicabilitySysId(current);
    var gr = new GlideRecord("sys_ux_applicability_m2m_list");
    gr.addQuery('applicability.sys_id', applicabilitySysId);
    gr.query();
    gr.deleteMultiple();
    
    gr = new GlideRecord("sys_ux_applicability");
    gr.get(applicabilitySysId);
    gr.deleteRecord();  
}
function getApplicabilitySysId(current) {
	var gr = new GlideRecord("sys_ux_page_property");
    gr.addQuery('page.sys_id', current.sys_id);
    gr.addQuery('name', 'wbApplicabilityConfigId');
    gr.query();
    gr.next();
    return gr.getValue('value');
}
