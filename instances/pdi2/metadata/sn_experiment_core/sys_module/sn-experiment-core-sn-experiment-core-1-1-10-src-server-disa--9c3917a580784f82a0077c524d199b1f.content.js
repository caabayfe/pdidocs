import { gs, GlideRecord } from "@servicenow/glide";
export function disableCDSSchedulerOnDisable(current) {
    var currentPropName = current.getValue('name');
    var currentPropValue = current.getValue('value');
    // gs.getProperty may return stale cached value, so use current for the property being changed
    var abTestingDisabled = currentPropName == 'experimentation.framework.disabled'
        ? currentPropValue == 'true'
        : gs.getProperty('experimentation.framework.disabled', 'false') == 'true';
    var featureFlagsDisabled = currentPropName == 'experimentation.featureflag.disabled'
        ? currentPropValue == 'true'
        : gs.getProperty('experimentation.featureflag.disabled', 'false') == 'true';
    var shouldDisable = abTestingDisabled && featureFlagsDisabled;
    var scheduler = new GlideRecord('cds_client_schedule');
    scheduler.addQuery('sys_id', '21274286ff403210eba0ffffffffff30');
    scheduler.query();
    if (scheduler.next()) {
        if (shouldDisable) {
            scheduler.setValue('active', false);
            gs.info('Experimentation Service: Disabling the cds_client_scheduler. Both A/B Testing and Feature Flags are disabled.');
        }
        else {
            scheduler.setValue('active', true);
            gs.info('Experimentation Service: Enabling the cds_client_scheduler.');
        }
        scheduler.update();
    }
}
