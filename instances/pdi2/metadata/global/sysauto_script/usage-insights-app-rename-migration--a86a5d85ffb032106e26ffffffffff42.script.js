var jobSysId = 'a86a5d85ffb032106e26ffffffffff42';

var start = new Date().getTime(); // Record start time

try {
    var appSysId = '5733f740d9a899103d32e5e1929ad21c';
    var newAppName = 'Usage Insights';

    // --- Update table ---
    updateTable('sys_ux_page_registry', 'sys_id', appSysId, {
        sys_name: newAppName,
        title: newAppName
    });

    // --- Update table ---
    updateTable('sys_analytics_app', 'app_sys_id', appSysId, {
        application_name: newAppName
    });

    // --- Update labels ---
    updateTableLabel("sys_analytics_app", "User Experience Analytics App", "Usage Insights App", "Usage Insights Apps");
    updateTableLabel("sys_analytics_app_config", "User Experience Analytics App Configuration", "Usage Insights App Configuration", "Usage Insights App Configurations");
    updateTableLabel("sys_analytics_authentication", "User Experience Analytics Authentications", "Usage Insights Authentication", "Usage Insights Authentications");
    updateTableLabel("sys_analytics_batch_state", "User Experience Analytics Batch State", "Usage Insights Batch State", "Usage Insights Batch States");
    updateTableLabel("sys_analytics_bucket", "User Experience Analytics Settings", "Usage Insights Setting", "Usage Insights Settings");
    updateTableLabel("sys_analytics_channel", "User Experience Analytics Channels", "Usage Insights Channel", "Usage Insights Channels");
    updateTableLabel("sys_analytics_consent_policy", "User Experience Analytics Consent Policy", "Usage Insights Consent Policy", "Usage Insights Consent Policies");
    updateTableLabel("sys_analytics_custom_app", "User Experience Analytics Custom App", "Usage Insights Custom App", "Usage Insights Custom Apps");
    updateTableLabel("sys_analytics_data_points_error", "User Experience Analytics Data Points Error", "Usage Insights Data Points Error", "Usage Insights Data Points Errors");
    updateTableLabel("sys_analytics_data_points_queue", "User Experience Analytics Data Points Queue", "Usage Insights Data Points Queue", "Usage Insights Data Points Queues");
    updateTableLabel("sys_analytics_detection_policy_provider", "User Experience Analytics Detection Policy Provider", "Usage Insights Detection Policy Provider", "Usage Insights Detection Policy Providers");
    updateTableLabel("sys_analytics_long_inactive_users_login_data", "User Experience Analytics Long Inactive Users Login", "Usage Insights Long Inactive Users Login", "Usage Insights Long Inactive Users Logins");
    updateTableLabel("sys_analytics_user_consent_decision", "User Experience Analytics User Consent Decision", "Usage Insights User Consent Decision", "Usage Insights User Consent Decisions");
    updateTableLabel("sys_analytics_user_context", "User Experience Analytics context", "Usage Insights Context", "Usage Insights Contexts");
    updateTableLabel("sys_analytics_user_prop_sync", "User Experience Analytics User Prop Sync Request", "Usage Insights User Prop Sync Request", "Usage Insights User Prop Sync Requests");
    updateTableLabel("sys_analytics_user_property_config", "User Experience Analytics User Property Configuration", "Usage Insights User Property Configuration", "Usage Insights User Property Configurations");

    gs.info('Usage Insights App Rename Migration: All updates completed successfully.');
    
    
} catch (e) {
    gs.error('Usage Insights App Rename Migration: An error occurred. Error: ' + e.message + ' Stack: ' + e.stack);
}

// --- Run AFTER all table updates: sysauto_script workflow only ---
var grScript = new GlideRecord('sysauto_script');
grScript.addQuery('sys_id', jobSysId);
grScript.query();
if (grScript.next()) {
    grScript.setValue('active', false);
    grScript.update();
    gs.info('Usage Insights App Rename Migration: sysauto_script record [' + jobSysId + '] workflow disabled successfully.');
} else {
    gs.warn('Usage Insights App Rename Migration: Record not found in sysauto_script for sys_id: ' + jobSysId);
}

var end = new Date().getTime(); // Record end time
var timeTaken = end - start; // Calculate time in milliseconds
gs.info('Usage Insights App Rename Migration Script executed in ' + timeTaken + ' ms')
 

// --- Generic function to update table fields ---
function updateTable(tableName, columnName, recordSysId, fieldsToUpdate) {
    var gr = new GlideRecord(tableName);
    gr.addQuery(columnName, recordSysId);
    gr.query();
    if (gr.next()) {
        Object.keys(fieldsToUpdate).forEach(function(field) {
            gr.setValue(field, fieldsToUpdate[field]);
        });

        gr.update();
        gs.info('Usage Insights App Rename Migration: Updated ' + tableName + ' record [' + recordSysId + '] with fields: ' + JSON.stringify(fieldsToUpdate));
    } else {
        gs.warn('Usage Insights App Rename Migration: Record not found in ' + tableName + ' for sys_id: ' + recordSysId);
    }
}

// --- Function to update table labels ---
function updateTableLabel(tableName, oldLabel, newLabel, newPluralLabel) {
    if (!GlideTableDescriptor.isValid(tableName)) return;

    // Update sys_db_object label
    var gr = new GlideRecord('sys_db_object');
    gr.addQuery('name', tableName);
    gr.query();
    if (gr.next()) {
        gr.setValue('label', newLabel);
        gr.update();
        gs.info('Usage Insights App Rename Migration: Updated sys_db_object label for table [' + tableName + '] to ' + newLabel);
    }

    // Update sys_documentation label & plural
    gr = new GlideRecord('sys_documentation');
    gr.addQuery('name', tableName);
    gr.addNullQuery('element');
    gr.addQuery('label', oldLabel);
    gr.query();
    if (gr.next()) {
        gr.setValue('label', newLabel);
        gr.setValue('plural', newPluralLabel);
        gr.update();
        gs.info('Usage Insights App Rename Migration: Updated sys_documentation label for table [' + tableName + '] to ' + newLabel + ' / plural: ' + newPluralLabel);
    }
}
