var UNIFIED_ANALYTICS_FILE_NAME = 'sys_properties_ff06f38543302110f711f05ba9b8f2d2.xml';
var UNIFIED_ANALYTICS_SYS_ID = 'ff06f38543302110f711f05ba9b8f2d2';
if (!pm.isZboot()) {
    //Upgraded customers from (U)- to (X)+ won't have the unified analytics property and to avoid set it to 'true', 
    //we will create that property for them wih value false and the original property won't 
    //be applied as it will be already in apply_once table since we call ApplyOnce.doNotUpdate below.
    var gr = new GlideRecord('sys_properties');
    if (!gr.get(UNIFIED_ANALYTICS_SYS_ID)) {
        gr.initialize();
        gr.setValue('name', 'com.glide.par.unified_analytics.enabled');
        gr.setValue('description', 'Unify indicators, responsive dashboards, and Next Experience dashboards under one configurable workspace menu.');
        gr.setValue('type', 'boolean');
        gr.setValue('value', 'false');
        var sysId = gr.insert();
        gs.info(gs.getMessage('unified analytics property with sys_id {0} was create as part of the upgrade.', sysId));
    }
	//we still need to mark the original file as migrated to apply_once so when the plugin 
	//is repared the property won't change to true or to whatever default value it has stored in the plugin
    sn_applyonce.ApplyOnce.doNotUpdate(UNIFIED_ANALYTICS_FILE_NAME);
    gs.info(UNIFIED_ANALYTICS_FILE_NAME + ' was migrated to apply_once folder pre-upgrade.');
}
