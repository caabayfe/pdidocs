var DEBUG = false;
var RUN_SIM = false;

var QUERY_SEQUENCES = {
    "dashboards": [
        {
            tableName: "par_coreui_migration_bridge_dashboard",
            encodedQuery: () => "pa_dashboardISNOTEMPTY^par_dashboardISNOTEMPTY",
            store: (gr) => ({
                pa_dashboard: gr.getValue("pa_dashboard"),
                par_dashboard: gr.getValue("par_dashboard")
            }),
            sequential: true,
        },
        {
            tableName: "pa_dashboards",
            encodedQuery: (tableData) => tableData["par_coreui_migration_bridge_dashboard"].map(e => 'sys_id=' + e.pa_dashboard).join("^OR"),
            store: (gr) => ({
                sys_id: gr.getValue("sys_id"),
                sys_package: gr.getValue("sys_package"),
                sys_scope: gr.getValue("sys_scope"),
                sys_domain: gr.getValue("sys_domain"),
                sys_domain_path: gr.getValue("sys_domain_path"),
            }),
            index: createIndexGenerator("par_coreui_migration_bridge_dashboard", (r, gr) => r.pa_dashboard === gr.getValue("sys_id")),
        },
        {
            tableName: "par_dashboard",
            encodedQuery: (tableData) => tableData["par_coreui_migration_bridge_dashboard"].map(e => "sys_id=" + e.par_dashboard).join("^OR"),
            getUpdates: createUpdateGenerator("par_dashboard", (record, tableData) => record.__indexes.pa_dashboards),
            index: createIndexGenerator("pa_dashboards", (r, gr) => r.__indexes["par_coreui_migration_bridge_dashboard"].par_dashboard === gr.getValue("sys_id"))
        },
        {
            tableName: "par_dashboard_tab",
            encodedQuery: (tableData) => tableData["par_dashboard"].map(e => "dashboard=" + e.sys_id).join("^OR"),
            getUpdates: createUpdateGenerator("par_dashboard_tab", (record, tableData) => record.__indexes.par_dashboard.__indexes.pa_dashboards),
            index: createIndexGenerator("par_dashboard", (r, gr) => r.sys_id === gr.getValue("dashboard"))
        },
        {
            tableName: "par_dashboard_canvas",
            encodedQuery: (tableData) => tableData["par_dashboard"].map(e => "dashboard=" + e.sys_id).join("^OR"),
            getUpdates: createUpdateGenerator("par_dashboard_canvas", (record) => record.__indexes.par_dashboard.__indexes.pa_dashboards),
            index: createIndexGenerator("par_dashboard", (r, gr) => r.sys_id === gr.getValue("dashboard"))
        },
        {
            tableName: "par_dashboard_filter",
            encodedQuery: (tableData) => tableData["par_dashboard"].map(e => "dashboard=" + e.sys_id).join("^OR"),
            getUpdates: createUpdateGenerator("par_dashboard_filter", (record) => record.__indexes.par_dashboard.__indexes.pa_dashboards),
            index: createIndexGenerator("par_dashboard", (r, gr) => r.sys_id === gr.getValue("dashboard"))
        },
        {
            tableName: "par_dashboard_permission",
            encodedQuery: (tableData) => tableData["par_dashboard"].map(e => "dashboard=" + e.sys_id).join("^OR"),
            getUpdates: createUpdateGenerator("par_dashboard_permission", (record) => record.__indexes.par_dashboard.__indexes.pa_dashboards),
            index: createIndexGenerator("par_dashboard", (r, gr) => r.sys_id === gr.getValue("dashboard"))
        },
        {
            tableName: "par_dashboard_user_metadata",
            encodedQuery: (tableData) => tableData["par_dashboard"].map(e => "dashboard=" + e.sys_id).join("^OR"),
            getUpdates: createUpdateGenerator("par_dashboard_user_metadata", (record) => record.__indexes.par_dashboard.__indexes.pa_dashboards),
            index: createIndexGenerator("par_dashboard", (r, gr) => r.sys_id === gr.getValue("dashboard"))
        },
        {
            tableName: "par_dashboard_widget",
            encodedQuery: (tableData) => tableData["par_dashboard_canvas"].map(e => "canvas=" + e.sys_id).join("^OR"),
            getUpdates: createUpdateGenerator("par_dashboard_widget", (record) => record.__indexes.par_dashboard_canvas.__indexes.par_dashboard.__indexes.pa_dashboards),
            index: createIndexGenerator("par_dashboard_canvas", (r, gr) => r.sys_id === gr.getValue("canvas"))
        },
    ],
    "reports": [
        {
            tableName: "par_coreui_migration_bridge_component",
            encodedQuery: () => "type=report^reportISNOTEMPTY^widgetISEMPTY^filterISEMPTY",
            store: (gr) => ({
                sys_report: gr.getValue("report"),
                par_component: gr.getValue("component")
            }),
            sequential: true,
        },{
            tableName: "sys_report",
            encodedQuery: (tableData) => tableData["par_coreui_migration_bridge_component"].map(e => 'sys_id=' + e.sys_report).join("^OR"),
            store: (gr) => ({
                sys_id: gr.getValue("sys_id"),
                sys_package: gr.getValue("sys_package"),
                sys_scope: gr.getValue("sys_scope"),
                sys_domain: gr.getValue("sys_domain"),
                sys_domain_path: gr.getValue("sys_domain_path")
            }),
            index: createIndexGenerator("par_coreui_migration_bridge_component", (r, gr) => r.sys_report === gr.getValue("sys_id"))
        }, {
            tableName: "par_visualization",
            encodedQuery: (tableData) => tableData["par_coreui_migration_bridge_component"].map(e => 'sys_id=' + e.par_component).join("^OR"),
            index: createIndexGenerator('sys_report', (r, gr) => r.__indexes["par_coreui_migration_bridge_component"].par_component === gr.getValue("sys_id")),
            getUpdates: createUpdateGenerator('par_visualization', (record, tableData) => record.__indexes.sys_report)
        }
    ],
    "widgets": [
        {
            tableName: "par_coreui_migration_bridge_component",
            encodedQuery: () => "type=widget^widgetISNOTEMPTY^reportISEMPTY^filterISEMPTY",
            store: (gr) => ({
                pa_widget: gr.getValue("widget"),
                par_component: gr.getValue("component")
            }),
            sequential: true,
        },{
            tableName: "pa_widgets",
            encodedQuery: (tableData) => tableData["par_coreui_migration_bridge_component"].map(e => 'sys_id=' + e.pa_widget).join("^OR"),
            store: (gr) => ({
                sys_id: gr.getValue("sys_id"),
                sys_package: gr.getValue("sys_package"),
                sys_scope: gr.getValue("sys_scope"),
                sys_domain: gr.getValue("sys_domain"),
                sys_domain_path: gr.getValue("sys_domain_path")
            }),
            index: createIndexGenerator("par_coreui_migration_bridge_component", (r, gr) => r.pa_widget === gr.getValue("sys_id"))
        }, {
            tableName: "par_visualization",
            encodedQuery: (tableData) => tableData["par_coreui_migration_bridge_component"].map(e => 'sys_id=' + e.par_component).join("^OR"),
            index: createIndexGenerator('pa_widgets', (r, gr) => r.__indexes["par_coreui_migration_bridge_component"].par_component === gr.getValue("sys_id")),
            getUpdates: createUpdateGenerator('par_visualization', (record, tableData) => record.__indexes.pa_widgets)
        }
    ],
    "filters": [
        {
            tableName: "par_coreui_migration_bridge_component",
            encodedQuery: () => "type=filter^filterISNOTEMPTY^reportISEMPTY^widgetISEMPTY",
            store: (gr) => ({
                sys_ui_hp_publisher: gr.getValue("filter"),
                par_component: gr.getValue("component")
            }),
            sequential: true,
        },{
            tableName: "sys_ui_hp_publisher",
            encodedQuery: (tableData) => tableData["par_coreui_migration_bridge_component"].map(e => 'sys_id=' + e.sys_ui_hp_publisher).join("^OR"),
            store: (gr) => ({
                sys_id: gr.getValue("sys_id"),
                sys_package: gr.getValue("sys_package"),
                sys_scope: gr.getValue("sys_scope"),
                sys_domain: gr.getValue("sys_domain"),
                sys_domain_path: gr.getValue("sys_domain_path")
            }),
            index: createIndexGenerator("par_coreui_migration_bridge_component", (r, gr) => r.sys_ui_hp_publisher === gr.getValue("sys_id"))
        }, {
            tableName: "par_component_filter",
            encodedQuery: (tableData) => tableData["par_coreui_migration_bridge_component"].map(e => 'sys_id=' + e.par_component).join("^OR"),
            index: createIndexGenerator('sys_ui_hp_publisher', (r, gr) => r.__indexes["par_coreui_migration_bridge_component"].par_component === gr.getValue("sys_id")),
            getUpdates: createUpdateGenerator('par_component_filter', (record, tableData) => record.__indexes.sys_ui_hp_publisher)
        }
    ]
}
var DOMAIN_SEPARATION_ENABLED = new SNC.PADomainUtils().isDomainSeparated();
var FIX_SCRIPT_START = (() => {
    var t = new GlideDateTime();
    // Subtract 1 second just in case the script runs very quickly. This is used in encoded queries, and we'd want any sys_update_xml entries from before to be filtered out
    t.subtract(1000);
    return t.getValue();
})()

function createUpdateGenerator(tableName, overwriteFunc) {
    return (tableData) => {
        if (!tableData[tableName])
            return [];

        var overwrite = overwriteFunc || (() => {})
        return tableData[tableName].map(e => createPendingUpdate(tableName, e, overwrite(e, tableData))).filter(e => e);
    }
}

function createIndexGenerator(findTable, findFunc) {
    return (tableData, gr, record) => {
        if (!tableData[findTable]) {
            return;
        }

        var e = tableData[findTable].find((e) => {
            return findFunc(e, gr)
        });

        if (!e) {
            return;
        }

        record.__indexes = record.__indexes || {};
        record.__indexes[findTable] = e;
    }
}

function domainSafeQuery(gr) {
    if(DOMAIN_SEPARATION_ENABLED)
        return gr.queryNoDomain();
    else
        return gr.query();
}

function objectNeedsUpdate(origin, target) {
    if (typeof origin.sys_scope !== "undefined" && origin.sys_scope !== target.sys_scope)
        return true;

    if (typeof origin.sys_package !== "undefined" && origin.sys_package !== target.sys_package)
        return true;

    if (typeof origin.sys_domain !== "undefined" && origin.sys_domain !== target.sys_domain)
        return true;

    if (typeof origin.sys_domain_path !== "undefined" && origin.sys_domain_path !== target.sys_domain_path){
        if (origin.sys_domain_path === null && target.sys_domain_path === "/")
            return false;

        if (origin.sys_domain_path === "/" && target.sys_domain_path === null)
            return false

        return true;
    }

    return false;
}

function createPendingUpdate(tableName, record, overwriteMeta) {
    if(!overwriteMeta)
        gs.warn("Could not find overwrite meta for " + tableName + " : " + JSON.stringify(record));
    if(objectNeedsUpdate(record, overwriteMeta))
        return {
            table: tableName,
            sys_id: record.sys_id,
            record: record,
            overwrite: overwriteMeta,
        }
}

function getRecord(gr, storeFunc, indexFunc, data) {
    if (!gr)
        return {};

    var createIndex = indexFunc || (() => {});
    if (storeFunc) {
        var o = storeFunc(gr);
        createIndex(data, gr, o);
        return o;
    }

    var k = Object.keys(gr);
    var o = {};
    k.forEach(key => {
        o[key] = gr.getValue(key);
    });
    createIndex(data, gr, o);
    return o;
}

function getUpdates(queries, data) {
    var updates = [];
    for (var i = 0; i < queries.length; i++) {
        var query = queries[i];
        if (!query.getUpdates)
            continue;

        var u = query.getUpdates(data);
        u.forEach((e) => {
            updates.push(e);
        });
    }
    return updates;
}

function insertRecord(tableName, recordSysId, overwrite, record) {
    if(RUN_SIM){
        return;
    }
    if(!record || !overwrite || !recordSysId || !tableName){
        gs.warn("Unable to update record as information is missing! " + JSON.stringify({overwrite: overwrite, sys_id: recordSysId}))
        return;
    }
    var gr = new GlideRecord(tableName);
    gr.setWorkflow(false);
    gr.autoSysFields(false);
    gr.setNewGuidValue(recordSysId);
    var expectedObject = {};
    Object.keys(record).forEach((key) => {
        if(key === "__meta")
            return;
        if(key === "active") {
            gr.setValue(key, !!record[key])
            expectedObject[key] = !!record[key];
        }
        else {
            gr.setValue(key, record[key]);
            expectedObject[key] = record[key];
        }
    });
    gr.setValue("sys_package", overwrite.sys_package);
    gr.setValue("sys_scope", overwrite.sys_scope);
    gr.setValue("sys_domain", overwrite.sys_domain);
    gr.setValue("sys_domain_path", overwrite.sys_domain_path);
    expectedObject.sys_scope = overwrite.sys_scope;
    expectedObject.sys_package = overwrite.sys_package;
    expectedObject.sys_domain = overwrite.sys_domain;
    expectedObject.sys_domain_path = overwrite.sys_domain_path;
    if(!gr.insert()) {
        gs.error("Unable to insert record! : " + JSON.stringify({tableName: tableName, sys_id: recordSysId, record: record, overwrite: overwrite}));
    }

    var dbu = new GlideDBUpdate(tableName);
    var dbq = new GlideDBQuery(tableName);
    dbq.addQuery("sys_id", recordSysId);
    dbu.setQuery(dbq);
    dbu.setValue("sys_package", overwrite.sys_package);
    dbu.setValue("sys_scope", overwrite.sys_scope);
    dbu.setValue("sys_domain", overwrite.sys_domain);
    dbu.setValue("sys_domain_path", overwrite.sys_domain_path);
    dbu.execute();
    dbu.close();
    dbq.close();

    if (DEBUG) {
      gr = new GlideRecord(tableName);
      if(!gr.get(recordSysId))
        gs.error("Could not find immediately inserted record: " + recordSysId);
      else {
        Object.keys(expectedObject).forEach(key => {
            if(gr.getValue(key) !== expectedObject[key]) {
                gs.error("Object was written differently for " + recordSysId + " for value " + key);
                gs.error("Expected: " + expectedObject[key] + " but got: " + gr.getValue(key));
                }
        });
      }
    }
    return tableName + "_" + recordSysId;
}

function deleteRecords(updates) {
    if(!updates || updates.length === 0)
        return;

    var runQuery = (table, query) => {
        if(RUN_SIM) {
            gs.info("Would delete : " + query);
            return;
        }

        if(!table || !query){
            gs.warn("Cannot run delete query without table or query");
            return;
        }

        var gr = new GlideRecord(table);
        gr.setWorkflow(false);
        gr.addEncodedQuery(query.map(e => 'sys_id=' + e).join("^OR"));
        domainSafeQuery(gr);
        gr.deleteMultiple();

        gr = new GlideRecord("sys_update_xml");
        var enc = "sys_created_on>" + FIX_SCRIPT_START + "^action=DELETE^" + query.map(e => 'name=' + table + "_" + e).join("^OR");
        gr.addEncodedQuery(enc);
        gs.info("Delete sys_update query: " + enc)
        domainSafeQuery(gr);
        gr.deleteMultiple();
    }
    var currentTable;
    var query = [];

    updates.forEach(update => {
        if(update.table !== currentTable) {
            if(currentTable)
                runQuery(currentTable, query);

            currentTable = update.table;
            query = [];
        }
        query.push(update.sys_id);
    });

    runQuery(currentTable, query);
}

function getTableDetailsAndParent(tableName, sysId) {
    var gr = new GlideRecord("sys_db_object");
    if(tableName)
        gr.addQuery("name", tableName);
    else if(sysId)
        gr.addQuery("sys_id", sysId);
    else
        throw new Error("you didn't provide a table name or a sysID ");
    domainSafeQuery(gr);
    if(gr.next()) {
        var newTableName = gr.getValue("name");
        var superClass = gr.getValue("super_class");
        var parent;
        if(superClass){
            parent = getTableDetailsAndParent(null, superClass);
        }

        gr = new GlideRecord("sys_dictionary");
        gr.addQuery("internal_type", "reference");
        gr.addQuery("reference", newTableName);
        domainSafeQuery(gr);

        var cascadedChanges = [];
        while(gr.next()) {
            var columnName = gr.getValue("element");
            var table = gr.getValue("name");
            var referenceCascade = gr.getValue("reference_cascade_rule");
            if(referenceCascade !== "none"){
                cascadedChanges.push({columnName: columnName, table: table, referenceCascade: referenceCascade, tableName: newTableName, sysId: gr.getValue("sys_id")});
            }
        }
        return {tableName: newTableName, parent: parent, parentSysId: superClass, cascadedChanges: cascadedChanges};
    }
    return null;
}

function updateDictionary(tableDetails, disableCascade) {
    var cascadedChanges = tableDetails.cascadedChanges;
    cascadedChanges.forEach(change => {
        var gr = new GlideRecord("sys_dictionary");
        if(!gr.get(change.sysId)) {
            return;
        }
        var newRule = disableCascade ? "none" : change.referenceCascade;
        gs.info("Updating sys_id: " + change.sysId + " -> " + (newRule || "NULL"))
        gr.setValue("reference_cascade_rule", newRule || "NULL");
        gr.update();
    })

    var gr = new GlideRecord("sys_update_xml");
    var enc = "sys_created_on>" + FIX_SCRIPT_START + "^action=INSERT_OR_UPDATE^" + cascadedChanges.map(e => 'name=sys_dictionary_' + e.table).join("^OR");
    gr.addEncodedQuery(enc);
    domainSafeQuery(gr);
    gr.deleteMultiple();

    if(tableDetails.parent)
        updateDictionary(tableDetails.parent, disableCascade)
}

function deleteCustomizations(customizations) {
    if(!customizations || customizations.length === 0)
        return;

    if(RUN_SIM) {
        gs.info("Would delete customizations: " + JSON.stringify(customizations));
        return;
    }

    var gr = new GlideRecord("sys_update_xml");
    var enc = "sys_created_on>" + FIX_SCRIPT_START + "^action=INSERT_OR_UPDATE^" + customizations.map(e => 'name=' + e).join("^OR");
    gr.addEncodedQuery(enc);
    gs.info("Delete sys_update query: " + enc)
    domainSafeQuery(gr);
    gr.deleteMultiple(); //sys_created_on>javascript:gs.dateGenerate('2024-03-27','01:00:00')
}

var disabledTables = {};
function executeUpdates(updates) {

    updates.forEach(update => {
        var table = update.table;
        if(disabledTables[table]) {
            return;
        }

        gs.info("Querying tables to disable cascade on...");
        disabledTables[table] = getTableDetailsAndParent(table, null);
        gs.info("DISABLED CASCADES ON " + table + " -> " + JSON.stringify(disabledTables[table]));
        updateDictionary(disabledTables[table], true);
    });

    gs.info("Executing " + updates.length + " updates");
    var start = new Date().getTime();

    deleteRecords(updates);

    gs.info("Finished executing deletions in " + ((new Date().getTime() - start) / 1000));

    var customizations = [];
    for(var i = 0;i < updates.length;i++) {
        var update = updates[i];
        var customizationName = insertRecord(update.table, update.sys_id, update.overwrite, update.record);
        customizations.push(customizationName);
    }
    deleteCustomizations(customizations.filter(e => e));

    gs.info("Finished executing updates in " + ((new Date().getTime() - start) / 1000))

    return updates.length;
}

function executeQuerySequence(queries, data) {
    DEBUG && gs.info("Executing query sequence for table " + queries[0].tableName + " with " + queries.length + " queries...");
    for (var i = 0; i < queries.length; i++) {
        var query = queries[i];

        var gr = new GlideRecord(query.tableName);
        var encodedQuery = query.encodedQuery(data);
        var preserveKeys = Object.keys(data); // Used to track what data is like at this point, in case we wish to execute sequentially
        data[query.tableName] = data[query.tableName] || [];
        if (!encodedQuery) {
            gs.info("Skipping over query for table " + query.tableName + " because encoded query returned nothing...")
            continue;
        }

        gr.addEncodedQuery(encodedQuery);
        domainSafeQuery(gr);
        while (gr.next()) {
            data[query.tableName] = data[query.tableName] || []; // Has to be here also in the case of sequential=true
            data[query.tableName].push(getRecord(gr, query.store, query.index, data));
            if (query.sequential) {
                DEBUG && gs.info("Executing sequential updates...");
                var newUpdates = executeQuerySequence(queries.slice(i + 1), data);
                var newKeys = Object.keys(data);
                newKeys.forEach(k => {
                    if (preserveKeys.find(e => e === k))
                        return;

                    DEBUG && gs.info("Deleting data from data context: " + k + " -> " + data[k].length + " records");
                    delete data[k];
                })
                executeUpdates(newUpdates);
            }
        }
    }
    var updates = getUpdates(queries, data);
    return updates;
}

var REPAIRED_PROP = "com.glide.par.coreui.migration.scope.repaired";
try{
    var updatesLength = 0;
    updatesLength += executeUpdates(executeQuerySequence(QUERY_SEQUENCES.reports, {}));
    gs.info("Finished executing par_visualization(sys_report) patch");
    updatesLength += executeUpdates(executeQuerySequence(QUERY_SEQUENCES.widgets, {}));
    gs.info("Finished executing par_visualization(pa_widgets) patch");
    updatesLength += executeUpdates(executeQuerySequence(QUERY_SEQUENCES.filters, {}));
    gs.info("Finished executing par_component(filters) patch");
    updatesLength += executeUpdates(executeQuerySequence(QUERY_SEQUENCES.dashboards, {}));
    gs.info("Finished executing par_dashboard(pa_dashboards) patch");

    if(updatesLength > 0) {
        gs.setProperty(REPAIRED_PROP, "true");
    }
} catch(e) {
    gs.error("An error was thrown, please rollback this fix script!");
    gs.error(e);
} finally {
    gs.info("Re-enabling cascades : " + JSON.stringify(disabledTables));
    for (var tableName in disabledTables) {
        updateDictionary(disabledTables[tableName], false);
    }
    gs.info("Finished re-enabling all cascades!");
}
