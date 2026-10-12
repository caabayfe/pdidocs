gs.info('Running sys_script_fix_17403e13534d52102974ddeeff7b1278 to handle v_table_enabled - Start');
executeScript();
gs.info('Running sys_script_fix_17403e13534d52102974ddeeff7b1278 to handle v_table_enabled - End');



function executeScript() {
    var V_TABLE_JOIN_ENABLED_PROPERTY_FILE_NAME = "sys_properties_6def1e844f13311024856f2efdce0b84.xml";

    if (!pm.isZboot()) {
        //On upgrade refrain from installing the property com.glide.par.v_table_join.enabled
        sn_applyonce.ApplyOnce.doNotUpdate(V_TABLE_JOIN_ENABLED_PROPERTY_FILE_NAME);
        gs.info('Property "com.glide.par.v_table_join.enabled", sys_properties_6def1e844f13311024856f2efdce0b84, will not be installed as it is upgrade flow');

        DeleteVtableEnabledPropertyIfNeeded();
    }
}


/**
 * This function will check if I am in the situation where I have the combination of unified analytics=false and also 
 * v_table.enable=false, which represent a wrong state that upgraded custonmers from V to X+ will be in.
 * When in this state, we will delete the property v_table.enable as this indicates that those customers are 
 * upgrading customers and thefoere they should not have this property installed from the first place.
 */
function DeleteVtableEnabledPropertyIfNeeded() {
    var UNIFIED_ANALYTICS_PROPERTY_SYSID = 'ff06f38543302110f711f05ba9b8f2d2';
    var V_TABLE_JOIN_ENABLED_PROPERTY_SYSID = '6def1e844f13311024856f2efdce0b84';
    var gr = new GlideRecord('sys_properties');

    if (gr.get(UNIFIED_ANALYTICS_PROPERTY_SYSID) && gr.getValue('value') == 'false' && gr.get(V_TABLE_JOIN_ENABLED_PROPERTY_SYSID) && gr.getValue('value') == 'false') {
        gr.deleteRecord();
        gs.info('Property "com.glide.par.v_table_join.enabled", sys_properties_6def1e844f13311024856f2efdce0b84, will be deleted as it was mistakenly installed on upgrade from V(-) to X(+) release');
    }
}
