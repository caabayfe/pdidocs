(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var rollback = request.queryParams.rollback && request.queryParams.rollback[0] === "true";
    var activating = !rollback;
    var res = {
        nextExperienceActivated: activating,
    };

    function activateNextExperience(isRollback) {
        var rollback = isRollback;
        var activating = !rollback;
        var res = {
            nextExperienceActivated: activating,
        };

        var rollbackAllowedProp = "glide.par.coreui.migration.bulk_rollback_enabled";
        var rollbackAllowed = gs.getProperty(rollbackAllowedProp, "false");

        if (rollback && rollbackAllowed !== "true") {
            return {
                skipped: true,
                nextExperienceActivated: true,
                message: "Please don\'t rollback. You weren\'t meant to find this. Contact support first.",
            };
        }

        var COMPONENT_BRIDGE = "par_coreui_migration_bridge_component";
        var DASHBOARD_BRIDGE = "par_coreui_migration_bridge_dashboard";
        var SCHEDULED_JOB_BRIDGE = "par_coreui_migration_bridge_sysauto";
        var bridgingTables = [COMPONENT_BRIDGE, DASHBOARD_BRIDGE, SCHEDULED_JOB_BRIDGE];
        var tablesInfo = {};
        var isDomainSeparated = new SNC.PADomainUtils().isDomainSeparated();
        tablesInfo[DASHBOARD_BRIDGE] = {
            core: function() {
                return {
                    table: "pa_dashboards",
                    bridgeField: "pa_dashboard",
                    hasActive: true,
                };
            },
            next: function() {
                return {
                    table: "par_dashboard",
                    bridgeField: "par_dashboard",
                    hasActive: true,
                };
            }
        };
        tablesInfo[COMPONENT_BRIDGE] = {
            core: function(record) {
                switch (record.getValue("type")) {
                    case "report":
                       return {
                            table: "sys_report",
                                bridgeField: "report",
                                hasActive: true,
                        };
                    case "widget":
                        return {
                            table: "pa_widgets",
                                bridgeField: "widget",
                                hasActive: false,
                        };
                    case "filter":
                        return {
                            table: "sys_ui_hp_publisher",
                                bridgeField: "filter",
                                hasActive: false
                        };
                    default:
                        throw new Error("Unexpected component type - " + record.getValue("type"));
                }
            },
            next: function(record) {
                return {
                    table: "par_component",
                    bridgeField: "component",
                    hasActive: true,
                };
            },
        };
        tablesInfo[SCHEDULED_JOB_BRIDGE] = {
            core: function() {
                return {
                    table: "sysauto_report",
                    bridgeField: "sysauto_report",
                    hasActive: true,
                };
            },
            next: function() {
                return {
                    table: "sysauto_par",
                    bridgeField: "sysauto_par",
                    hasActive: true,
                };
            },
        };

        var direction;
        if (activating)
            direction = ["core", "next"];
        else
            direction = ["next", "core"];

        var tableRecordsToBeUpdated = {};

        function addTableInfo(tableName, activeValue) {
            if (!tableRecordsToBeUpdated[tableName]) {
                tableRecordsToBeUpdated[tableName] = {};
                tableRecordsToBeUpdated[tableName].active = activeValue;
                tableRecordsToBeUpdated[tableName].sysids = [];
            }
        }

        function updateComponentRelatedRecords(tableRecordsToBeUpdated) {
            for (var table in tableRecordsToBeUpdated) {
                gs.info("running updateComponentRelatedRecords for table: " + table + " record count is: " + tableRecordsToBeUpdated[table].sysids.length);
                if (tableRecordsToBeUpdated[table].sysids.length > 0) {
                    if (table == "sysauto_report" || table == "sysauto_par") {
                        var sysauto = new GlideRecord(table);
                        sysauto.addQuery("sys_id", "IN", tableRecordsToBeUpdated[table].sysids);
                        if (isDomainSeparated)
                            sysauto.queryNoDomain();
                        else
                            sysauto.query();

                        while (sysauto.next()) {
                            sysauto.active = tableRecordsToBeUpdated[table].active;
                            sysauto.update();
                        }
                    } else {
                        var dbQuery = new GlideDBQuery(table);
                        dbQuery.addQuery("sys_id", "IN", tableRecordsToBeUpdated[table].sysids);
                        if (isDomainSeparated)
                            dbQuery.setSuppressSeparation(true);
                        var dbu = new GlideDBUpdate(table);
                        dbu.setQuery(dbQuery);
                        dbu.setValue("active", tableRecordsToBeUpdated[table].active);
                        dbu.setMultiple(true);
                        dbu.execute();
                    }
                    delete tableRecordsToBeUpdated[table];
                }
            }
        }

        for (var i = 0; i < bridgingTables.length; i++) {
            var bridgingTable = bridgingTables[i];
            var gr = new GlideRecord(bridgingTable);
            if (activating) {
                gr.addEncodedQuery("active=");
            } else {
                gr.addEncodedQuery("active=next");
            }
            /** ^ active points at the "source of truth" for if the artifact has been MANUALLY set to COREUI or NEXT. */
            /** If the bridging table says null, rollback/activation can transfer the active flag. */
            /** If the active flag has been manually set to next/core, then the automated rollback/activation will skip over it. */
            if (isDomainSeparated)
                gr.queryNoDomain();
            else
                gr.query();

            var tableInfo = tablesInfo[bridgingTable];
            var counter = 0;
            while (gr.next()) {
                counter++;
                var FROM_TABLE_INFO = tableInfo[direction[0]](gr);
                var TO_TABLE_INFO = tableInfo[direction[1]](gr);

                if (!FROM_TABLE_INFO || !TO_TABLE_INFO) {
                    gs.error("Failed to get correct to or from table for " + bridgingTable + ", skipping records to preserve data. From: " + FROM_TABLE_INFO + " To: " + TO_TABLE_INFO);
                    continue;
                }

                var active = true;
                var sysid = "";
                if (FROM_TABLE_INFO.hasActive) {
                    sysid = gr.getValue(FROM_TABLE_INFO.bridgeField);
                    if (sysid != null) {
                        addTableInfo(FROM_TABLE_INFO.table, false);
                        tableRecordsToBeUpdated[FROM_TABLE_INFO.table].sysids.push(sysid);
                    }
                }

                if (active && TO_TABLE_INFO.hasActive) {
                    sysid = gr.getValue(TO_TABLE_INFO.bridgeField);
                    if (sysid != null) {
                        addTableInfo(TO_TABLE_INFO.table, true);
                        tableRecordsToBeUpdated[TO_TABLE_INFO.table].sysids.push(sysid);
                    }
                }

                /**  Do it in batches to avoid excessive memory usage */
                if (counter == 500) {
                    updateComponentRelatedRecords(tableRecordsToBeUpdated);
                    counter = 0;
                }
            }

            gs.info("updating " + bridgingTable + " table active field");
            /** bulk update the bridging table */
            var activeDirection = direction[1] === "core" ? "" : direction[1];
            var dbQuery = new GlideDBQuery(bridgingTable);
            var dbu = new GlideDBUpdate(bridgingTable);
            if (activating) {
                dbQuery.addQuery("active", "=", "NULL");
            } else {
                dbQuery.addQuery("active", "=", "next");
            }
            if (isDomainSeparated)
                dbQuery.setSuppressSeparation(true);

            dbu.setQuery(dbQuery);
            dbu.setValue("active", activeDirection);
            dbu.setMultiple(true);
            dbu.execute();

            updateComponentRelatedRecords(tableRecordsToBeUpdated);
        }

        if (activating)
            gs.setProperty("com.glide.par.unified_analytics.enabled", true);

        try {
          new sn_analytics_tk.VisualizationConfigurationExtractor(true).processAllVisualizations();
        } catch(e) {
          gs.error(e);
        }
        var propGr = new GlideRecord('sys_script');
        propGr.addQuery('name', 'Track artifact creation post-migration');
        propGr.query();
        while (propGr.next()) {
          propGr.deleteMultiple();
        }
        gs.setProperty("glide.par.coreui.migration.new_coreui_artifacts_created", "false");
        gs.setProperty("com.glide.par.coreui.migration.activated", activating);
    }
    var activationScript = activateNextExperience.toString() + " " +
        "activateNextExperience(" + rollback + ");" +
        "var migrationService = new SNC.MigrationServiceScriptable();" +
        "migrationService.unblockNewAnalyticsContent();";

    //check if its enabled:
    var migrationEnabledProp = "com.glide.par.coreui.migration.enabled";
    var migrationEnabled = gs.getProperty(migrationEnabledProp, "true");
    if(migrationEnabled === "false") {
        res.message = "Migration has been disabled by the system admin";
        return res;
    }
    // check if it is already running in background
    var gr = new GlideRecord("sys_trigger");
    gr.addQuery("name", "Activate Next Experience");
    gr.query();
    if (gr.next()) {
        res.message = "Activate Next Experience job is already running.";
        return res;
    }

    gr = new GlideRecord("sysauto_script");
    gr.initialize();
    gr.setValue("active", true);
    gr.setValue("name", "Activate Next Experience");
    gr.setValue("run_type", "once");
    gr.setValue("entered_time", "1981-07-15 07:00:00");
    gr.setValue("run_start", "1981-07-15 07:00:00");
    gr.setValue("run_time", "1981-07-15 07:00:00");
    gr.setValue("script", activationScript);
    res.sysautoId = gr.insert();
    return res;
})(request, response);
