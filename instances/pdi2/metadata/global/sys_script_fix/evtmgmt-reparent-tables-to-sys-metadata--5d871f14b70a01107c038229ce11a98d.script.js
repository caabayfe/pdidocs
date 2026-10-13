
// This fix script reparents event management tables so they extend sys_metadata.
// Keys are tables that must be reparented before the tables in their values.
// Failed reparenting of a table in a key will skip the reparenting of the tables in its value.
// e.g., em_match_rule must be reparented before em_match_field.
var tables = {
    // Event rules tables
    'em_match_rule': ['em_match_field', 'em_compose_field'],
    'em_mapping_rule': ['em_mapping_pair'],
};
var log = '';
// Main function to run the reparenting logic
start();

// Starting the reparentig script
function start() {
    log += 'Event Management - "EvtMgmt tables reparent to sys_metadata" fix script start:\n\n';
    var startTime = new Date();
    reparentEMTables();
    var endTime = new Date();
    var elapsedTime = endTime - startTime;
    log += 'Total time elapsed for reparenting EventManagement tables in ms: ' + elapsedTime;
    gs.info(log);
    log = '';
}

function reparentEMTables() {
    if (pm.isZboot()) {
        log += 'EvtMgmt Fix script to reparent the EM tables will not continue to run for zbooted instance, so skipping it \n';
        return;
    }

    //Reparenting new version is called "Live Reparenting" because the primary goal was to make sure it would incorporate "live" changes.
    // Dev-persistence is responsible for the new Live Reparenting.
    // Changing glide.db.table.hierarchy_editor.live to false before running the reparenting logic
    var TABLE_HIERARCHY_EDITOR_LIVE = "glide.db.table.hierarchy_editor.live";
    var useLiveReparentingProp = gs.getProperty(TABLE_HIERARCHY_EDITOR_LIVE, "true");
    var isTableHierarchyEditorLive = useLiveReparentingProp === "true";
    if (isTableHierarchyEditorLive) {
        log += 'Setting the property: ' + TABLE_HIERARCHY_EDITOR_LIVE + ' value to: false \n';
        GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, "false");
    }
    try {
        var isEvtRulesTableConfigured = configureEventRulesTableAttributes();
        if (!isEvtRulesTableConfigured) {
            // If Event Rules table is misconfigured then remove it and the tables that referencing it from the reparent list.
            delete (tables['em_match_rule']);
            log += 'Skipping the reparenting of the em_match_rule, em_match_field and em_compose_field tables because em_match_rule table failed to be configured with the "allow_tables=all" attribute and it should not be reparented.\n\n';
        }
        // Reparent every table in tables
        var reparentingQueue = Object.keys(tables);
        for (i = 0; i < reparentingQueue.length; i++) {
            var tableName = reparentingQueue[i];
            log += 'Reparenting table ' + tableName + ' table so it will extend sys_metadata.\n';
            var startTimeGdt = new GlideDateTime();
            // Reparent only if the table exists
            var gr = new GlideRecord(tableName);
            if (gr.isValid()) {
                var tableUtils = new TableUtils(tableName);
                var parentTables = tableUtils.getTables();
                if (parentTables && parentTables.indexOf("sys_metadata") > -1) {
                    log += 'Abort reparenting of ' + tableName + ' table as it already extends sys_metadata.\n';
                    var childTables = tables[tableName];
					if(childTables != null && childTables != undefined)  // check if child tables are not null and undefined
                    reparentingQueue = reparentingQueue.concat(childTables);  // Add the dependent tables to the reparenting queue for a dependent table that already extends sys_metadata
                } else {
                    var changed = new GlideTableParentChange(tableName).change('', 'sys_metadata');
                    if (changed) {
                        log += 'Succeeded to reparent the ' + tableName + ' table to sys_metadata.\n';
                        var childTables = tables[tableName];
						if(childTables != null && childTables != undefined) // check if child tables are not null and undefined
                    	reparentingQueue = reparentingQueue.concat(childTables);  // Add the dependent tables to the reparenting queue after a successful reparenting of the dependent table
                    } else {
                        log += 'Failed to reparent the ' + tableName + ' table to sys_metadata.\n';
                    }
                }
            } else {
                log += tableName + ' table does not exist, skipped the reparenting of the table to extend sys_metadata.\n';
            }
        }
    } catch (ex) {
        log += 'Exception thrown during reparenting: ' + e;
    } finally {
        //setting the glide.db.table.hierarchy_editor.live value back to its original value
        if (isTableHierarchyEditorLive) {
            GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, useLiveReparentingProp);
            log += 'Setting the property: ' + TABLE_HIERARCHY_EDITOR_LIVE + ' value to: ' + useLiveReparentingProp;
        }
    }
}
/// The 'allow_tables=all' attribute must exist for Event Rules table in order to prevent cross scope errors for ci_type from scoped applications
function configureEventRulesTableAttributes() {
    // init as true
    var isEvtRulesTableConfigured = true;
    // Query ci_type dictionary entry from Event Rules
    var sysDictGr = new GlideRecord('sys_dictionary');
    sysDictGr.addQuery('name', 'em_match_rule');
    sysDictGr.addQuery('element', 'ci_type');
    sysDictGr.addQuery('attributes', 'DOES NOT CONTAIN', 'allow_tables=all');
    sysDictGr.query();
    if (sysDictGr.next()) {
        log += 'Event Rules (em_match_rule) table is not configured with "allow_tables=all" attribute, configuring it now.\n';
        // Add the 'allow_tables=all' attribute
        var ciTypeAttrs = sysDictGr.getValue('attributes');
        sysDictGr.setValue('attributes', (ciTypeAttrs + ',allow_tables=all'));
        isEvtRulesTableConfigured = sysDictGr.update();
        if (isEvtRulesTableConfigured) {
            log += 'The "allow_tables=all" attribute was successfully added to Event Rules (em_match_rule) table.\n';
        } else {
            log += 'FAILED to add the "allow_tables=all" attribute to Event Rules (em_match_rule) table.\n';
        }
    } else {
        log += 'Event Rules (em_match_rule) table is properly configured with "allow_tables=all" attribute.\n';
    }
    return isEvtRulesTableConfigured;
}
