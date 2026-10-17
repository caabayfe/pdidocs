var tablesToReparent = ['sys_search_context_config', 'sys_search_facet', 'sys_search_filter', 'sys_search_source_filter', 'sys_search_genius_result_model', 'm2m_search_context_config_search_scripted_processor', 'm2m_search_context_config_search_source'];

function start() {
    var startTime = new Date();
    reparentSearchConfigTables();
    var endTime = new Date();

    var elapsedTime = endTime - startTime;
    gs.info('Total time elapsed for reparenting search config tables in ms: ' + elapsedTime);
}

function reparentSearchConfigTables() {
    if (pm.isZboot()) {
        gs.log('Upgrade: no need to reparent search configuration tables, zbooting');
        return;
    }

    // Step 1: Set sys_scope for existing search context config record
    setSearchContextSysScope();

    // Step 2: Run the reparenting logic
    var TABLE_HIERARCHY_EDITOR_LIVE = "glide.db.table.hierarchy_editor.live";
    var useLiveReparentingProp = gs.getProperty(TABLE_HIERARCHY_EDITOR_LIVE, "true");
    var isTableHierarchyEditorLive = useLiveReparentingProp === "true";
    if (isTableHierarchyEditorLive) {
        gs.info("Setting the property: " + TABLE_HIERARCHY_EDITOR_LIVE + " value to: false");
        GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, "false");
    }
    
    try {
        tablesToReparent.forEach(function(tableName) {
            gs.log('Upgrade: starting ' + tableName + ' reparent to sys_metadata');
            var tpc = new GlideTableParentChange(tableName);
            if (tpc.change('', 'sys_metadata'))
                gs.log('Upgrade: completed ' + tableName + ' reparent to sys_metadata');
            else
                gs.log('Upgrade: failed to reparent ' + tableName + ' to sys_metadata');
        });
    } catch (ex) {
        gs.log('Exception thrown during reparenting: ' + e);
    } finally {
        if (isTableHierarchyEditorLive) {
            GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, isTableHierarchyEditorLive + '');
            gs.info("Setting the property: " + TABLE_HIERARCHY_EDITOR_LIVE + " value to: " + isTableHierarchyEditorLive );
        }
    }

    // Step 3: Update application_id column to calc field
    updateAppIdFieldType();

    // Step 4: Set sys_scope for existing records in remaining search tables
    setSysScope();
}

// for tables other than sys_search_context_config, iterate over each record and set sys_scope = global
function setSysScope() {
    tablesToReparent.forEach(function(tableName) {
        if (tableName === 'sys_search_context_config')
            return;

        var gr = new GlideRecord(tableName);
        gr.query();

        gs.log('Setting sys_scope for existing ' + tableName + ' records.');
        while (gr.next()) {
            gr.setValue('sys_scope', 'global');
            gr.update();
        }
    });
}

// for records in sys_search_context_config, set sys_scope to application_id
function setSearchContextSysScope() {
    var gr = new GlideRecord('sys_search_context_config');
    gr.query();

    gs.log('Setting sys_scope for existing sys_search_context_config records.');
    while (gr.next()) {
        var app_id = gr.getValue('application_id');
        gr.setValue('sys_scope', app_id);
        gr.update();
    }
}

// drop application_id column
function updateAppIdFieldType() {
    gs.log("Setting the column 'application_id' from 'sys_search_context_config' to a calc field.");

    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_search_context_config');
    gr.addQuery('element', 'application_id');
    gr.query();

    while (gr.next()) {
        gs.log("Found the column 'application_id' from 'sys_search_context_config'.");
        gr.setValue('virtual', true);
        gr.setValue('read_only', true);
        gr.setValue('calculation', 'current.sys_scope;');
        gr.update();
    }
}

start();
