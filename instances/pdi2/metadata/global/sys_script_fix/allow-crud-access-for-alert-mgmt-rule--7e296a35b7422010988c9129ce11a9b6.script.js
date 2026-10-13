setCrudAccess('em_alert_management_rule');
setCrudAccess('em_launch_application');
setCrudAccess('em_alert_management_action');
setCrudAccess('em_alert_man_m2m_rule_flow');
setCrudAccess('em_alert_man_m2m_rule_workflow');

function setCrudAccess(tableName) {
    var tbl = new GlideRecord('sys_db_object');
    tbl.addQuery('name', tableName);
    tbl.query();
    if (tbl.next()) {
        if (!tbl.create_access || !tbl.update_access || !tbl.delete_access) {
            tbl.create_access = true;
            tbl.update_access = true;
            tbl.delete_access = true;
            tbl.update();
        }
    }
}
