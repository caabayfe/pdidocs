//Clear Hardening comparison data older than 7 days
var gr = new GlideRecord('sn_vsc_user_comparisons');
gr.addQuery('sys_created_on', '<', gs.daysAgoStart(7));
gr.addQuery('usr_list', '');
gr.query();
while (gr.next()) {
    var grComp = new GlideRecord('sn_vsc_changed_hardening_settings');
    grComp.addQuery('set_comp', gr.sys_id);
    grComp.deleteMultiple();
    gr.deleteRecord();
}

//Clear Scan comparison data older than 7 days
var grScan = new GlideRecord('sn_vsc_scan_comparisons');
grScan.addQuery('sys_created_on', '<', gs.daysAgoStart(7));
grScan.addQuery('scn_list', '');
grScan.query();
while (grScan.next()) {
    var grF = new GlideRecord('sn_vsc_changed_scan_findings');
    grF.addQuery('fin_comp', grScan.sys_id);
    grF.deleteMultiple();
    grScan.deleteRecord();
}
