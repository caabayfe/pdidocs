var gr = new GlideRecord('sys_db_object');
gr.addQuery('name', 'em_alert_correlation_rule');
gr.query();

if (gr.next()) {
    var logIdentifier = 'Event Management - "Update Alert Correlation Rule Config" Fix Script: ';

    // The following test condition is enough to determine old table configuration
    if (gr.getValue('delete_access') === '0') {
        gr.setValue('delete_access', '1');
        gr.setValue('actions_access', '1');
        gr.setValue('alter_access', '1');
        gr.setValue('ws_access', '1');
        gr.setValue('client_scripts_access', '1');
        gr.setValue('configuration_access', '0');
        gr.setValue('create_access_controls', '0');
        gr.update();
        gs.info(logIdentifier + 'Provided missing accesses for Alert Correlation Rule (em_alert_correlation_rule) table');
    } else {
        gs.info(logIdentifier + 'Required accesses are already configured for Alert Correlation Rule (em_alert_correlation_rule) table.');
    }
}
