var cutoffDate = new GlideDateTime();
cutoffDate.addDaysLocalTime(-90);
 
var gr = new GlideRecord('gen_ai_service_secret');
gr.addQuery('purpose', 'mosaic_secret_purpose');
gr.addQuery('state', 'deactivated');
gr.addQuery('deactivated_on', '<', cutoffDate);
gr.query();
 
var now = new GlideDateTime();
 
while (gr.next()) {
    gr.setValue('state', 'retired');
    gr.setValue('retired_on', now);
 
    if (gr.update()) {
        gs.info('RetireDeactivatedMosaicSecrets: Successfully retired secret - sys_id: ' + gr.getUniqueValue() + ', name: ' + gr.getDisplayValue('name'));
    } else {
        gs.warn('RetireDeactivatedMosaicSecrets: Failed to retire secret - sys_id: ' + gr.getUniqueValue() + ', name: ' + gr.getDisplayValue('name'));
    }
}
