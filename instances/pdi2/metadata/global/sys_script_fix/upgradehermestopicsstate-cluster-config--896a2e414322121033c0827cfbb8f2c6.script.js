updateHermesClusterConfig();
updateHermesTopicsState();

function updateHermesClusterConfig() {
    gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Starting update to hermes_cluster_config');
    var updatedCount = 0;
    var skippedCount = 0;
    // Query all records in the hermes_cluster_config table
    var grClusterConfig = new GlideRecord('hermes_cluster_config');
    grClusterConfig.query();
    if (!grClusterConfig.isValidField('bootstrap_hash')) {
        skippedCount++;
        gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Skipping record with sys_id: ' + grClusterConfig.getValue('sys_id') + ' because bootstrap_hash is not a valid field.');
        return;
    }
    while (grClusterConfig.next()) {
        // Get the bootstrap_servers field 
        var bootStrapStr = grClusterConfig.getValue('kafka_bootstrap_server');
        if (!bootStrapStr) {
            skippedCount++;
            gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Skipping record with sys_id: ' + grClusterConfig.getValue('sys_id') + ' due to empty kafka_bootstrap_server field.');
            continue;
        }
        // Calculate the bootstrap hash
        var clusterBootstrapHash = new sn_hermes.HermesUtil().getClusterBootstrapHash(bootStrapStr);
        if (!clusterBootstrapHash) {
            skippedCount++;
            gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Skipping record with sys_id: ' + grClusterConfig.getValue('sys_id') + ' because getClusterBootstrapHash() returned null.');
            continue;
        }
        // Update the bootstrap_hash field with the computed value
        grClusterConfig.setValue('bootstrap_hash', clusterBootstrapHash);
        if (!grClusterConfig.update()) {
            skippedCount++;
            gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Skipping record with sys_id: ' + grClusterConfig.getValue('sys_id') + ' because update failed.');
            continue;
        }
        updatedCount++;
    }

    gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - hermes_cluster_config Fix Script Execution Summary: Total records processed. Updated: ' + updatedCount + ', Skipped: ' + skippedCount);
}

function updateHermesTopicsState() {
    gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Starting update to hermes_topics_state');
    var updatedCount = 0;
    var skippedCount = 0;
    // Step 1: Update `bootstrap_hash` field in hermes_topics_state
    var grTopicsState = new GlideRecord('hermes_topics_state');
    grTopicsState.query();
    if (!grTopicsState.isValidField('bootstrap_hash')) {
        skippedCount++;
        gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Skipping record with sys_id: ' + grTopicsState.getValue('sys_id') + ' because bootstrap_hash is not a valid field.');
        return;
    }
    while (grTopicsState.next()) {
        var dataCenter = grTopicsState.getValue('data_center'); // Get the data_center value
        var serviceId = grTopicsState.getValue('service_id'); // Get the service_id va
        if (!dataCenter || !serviceId) {
            skippedCount++;
            gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Skipping record with sys_id: ' + grTopicsState.getValue('sys_id') + ' due to missing data_center or service_id.');
            continue;
        }
        // Find the matching hermes_cluster_config record
        var grClusterConfig = new GlideRecord('hermes_cluster_config');
        grClusterConfig.addQuery('data_center', dataCenter);
        grClusterConfig.addQuery('service_id', serviceId);
        grClusterConfig.query();
        if (grClusterConfig.next()) {
            grTopicsState.setValue('bootstrap_hash', grClusterConfig.getValue('bootstrap_hash'));
            if (!grTopicsState.update()) {
                skippedCount++;
                gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Skipping record with sys_id: ' + grClusterConfig.getValue('sys_id') + ' because update failed.');
                continue;
            }
            updatedCount++;
        } else {
            skippedCount++;
            gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - No matching hermes_cluster_config record found for data_center: ' + dataCenter + ', service_id: ' + serviceId);
        }
    }

    gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - hermes_topics_state Fix Script Execution Summary: Total records processed. Updated: ' + updatedCount + ', Skipped: ' + skippedCount);
    // Step 2: Drop the `data_center` column
    try {
        gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Dropping the data_center column from hermes_topics_state...');
        var grDictionary = new GlideRecord('sys_dictionary');
        grDictionary.addQuery('name', 'hermes_topics_state');
        grDictionary.addQuery('element', 'data_center');
        grDictionary.query();
        if (grDictionary.next()) {
            if (grDictionary.deleteRecord()) {
                gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Successfully removed the data_center column from hermes_topics_state.');
            } else {
                gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Delete failed for the data_center column of hermes_topics_state: ' + grDictionary.getLastErrorMessage());
            }
        } else {
            gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - data_center column not found in hermes_topics_state. It may have been already removed.');
        }
    } catch (e) {
        gs.log('sys_script_fix_896a2e414322121033c0827cfbb8f2c6 - Error occurred while removing data_center column from hermes_topics_state: ' + e.message);
    }
}
