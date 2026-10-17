var log = '';
// Main function to run the reparenting logic
start();

// Starting the reparenting script
function start() {
    log += 'em_alert_management_action Table is going to be reparented:\n\n';
    var startTime = new Date();
    reparentEmAlertManagementActionTable();
    var endTime = new Date();
    var elapsedTime = endTime - startTime;
    log += 'Total time elapsed for reparenting em_alert_management_action and its child tables in ms: ' + elapsedTime;
    gs.info(log);
    log = '';
}

function reparentEmAlertManagementActionTable() {
    try {
        //Reparenting new version is called "Live Reparenting" because the primary goal was to make sure it would incorporate "live" changes.
        // Dev-persistence is responsible for the new Live Reparenting.
        // Changing glide.db.table.hierarchy_editor.live to false before running the reparenting logic to use old reparenter
        log += 'Using Old reparenter to reparent the table to sys_metadata \n';
        var TABLE_HIERARCHY_EDITOR_LIVE = "glide.db.table.hierarchy_editor.live";
        var useLiveReparentingProp = gs.getProperty(TABLE_HIERARCHY_EDITOR_LIVE, "true");
        var isTableHierarchyEditorLive = useLiveReparentingProp === "true";
        if (isTableHierarchyEditorLive) {
            log += 'Setting the property: ' + TABLE_HIERARCHY_EDITOR_LIVE + ' value to: false \n';
            GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, "false");
        }
        // Reparent em_alert_management_action and its child table
        // Check if the 'em_alert_management_action' has the 'sys_class_name' column, if not then try to add it
        // The 'sys_class_name' field is required for this table, as it is extended by other tables and it's reparenting will fail without it.
        var isAlertManagementActionConfigured = configureAlertManagementActionTableClass();
        if (!isAlertManagementActionConfigured) {
            // If 'em_alert_management_action' table is misconfigured then remove it from the reparent list.
            log += 'Skipping the reparenting of the em_alert_management_action it does not have the sys_class_name column.\n\n';
            return;
        }
        var gr = new GlideRecord('em_alert_management_action');
        if (gr.isValid()) {
            // check before reparenting the table if it is already reparented
            var tableUtils = new TableUtils('em_alert_management_action');
            tables = tableUtils.getTables();
            if (tables && tables.indexOf('sys_metadata') != -1) {
                // abort the action no need to reparent this table
                log += 'Aborting the reparenting action as em_alert_management_action table is already reparented to sys_metadata';
                return;
            }
            var changed = new GlideTableParentChange('em_alert_management_action').change('', 'sys_metadata');
            if (changed) {
                log += 'Succeeded to reparent the   table to sys_metadata.\n';
            } else {
                log += 'Failed to reparent the table to sys_metadata.\n';
            }
        } else {
            log += 'em_alert_management_action  table does not exist, skipped the reparenting of the table to extend sys_metadata.\n';
        }
        //  }
    } catch (ex) {
        log += 'Exception thrown during reparenting: ' + ex;
    } finally {
        //setting the glide.db.table.hierarchy_editor.live value back to its original value
        if (isTableHierarchyEditorLive) {
            GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, useLiveReparentingProp);
            log += 'Setting the property: ' + TABLE_HIERARCHY_EDITOR_LIVE + ' value to: ' + useLiveReparentingProp;
        }
    }
}

function configureAlertManagementActionTableClass() {
    var hasClassField = true; // init as true
    // 'em_alert_management_action' is being extended by a few tables.
    // Query 'em_alert_management_action' to check for sys_class_name field as it's crucial to have for a table that is being extended by other tables.
    var tableUtils = new TableUtils('em_alert_management_action');
    if (!tableUtils.isValidField('sys_class_name')) {
        log += "em_alert_management_action table does not have the sys_class_name column in its schema, creating it now.\n";
        var startTimeColumnCreationGdt = new GlideDateTime();
        hasClassField = tableUtils.createClassField('em_alert_management_action', 'global');
        if (hasClassField) {
            log += 'sys_class_name was successfully created in em_alert_management_action table. \n';
        } else {
            log += 'FAILED to create sys_class_name in em_alert_management_action table. \n';
        }
        log += 'Total time to create the sys_class_name column in em_alert_management_action (ms): ' + (new GlideDateTime().getNumericValue() - startTimeColumnCreationGdt.getNumericValue()) + ' \n';
    } else {
        log += 'em_alert_management_action is properly configured with the sys_class_name column.\n';
    }
    return hasClassField;
}
