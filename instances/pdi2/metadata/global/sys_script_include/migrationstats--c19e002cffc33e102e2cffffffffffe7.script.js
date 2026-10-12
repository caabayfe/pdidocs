var MigrationStats = Class.create();
MigrationStats.prototype = {
    initialize: function() {},

    getSummary: function(contentIds) {
        var legacyWidgetSysId = '0805a7bf91a93efbdf0a975b38b01051';
        var isDomainSeparated = new GlidePluginManager().isActive("com.glide.domain") || new GlidePluginManager().isActive("com.glide.domain.msp_extensions");
        var res = {
            fullyMigrated: {
                filter: 0,
                widget: 0,
                report: 0,
                dashboard: 0,
            },
            partiallyMigrated: {
                dashboard: 0,
                widget: 0,
                report: 0,
                content_block: 0,
                other: 0
            }
        };

        if (contentIds && contentIds.length > 0) {
            var fullAgg = new GlideAggregate('par_coreui_migration_bridge_dashboard');

            fullAgg.addQuery('pa_dashboard', 'IN', contentIds);
            fullAgg.addQuery('is_last', true);
            fullAgg.addQuery('compatibility_mode', '');
            fullAgg.addAggregate('COUNT', '');
            if (isDomainSeparated)
                fullAgg.queryNoDomain();
            else
                fullAgg.query();

            var fullyMigrated = 0;
            if (fullAgg.next()) {
                fullyMigrated = parseInt(fullAgg.getAggregate('COUNT', ''));
            }

            var partialAgg = new GlideAggregate('par_coreui_migration_bridge_dashboard');

            partialAgg.addQuery('pa_dashboard', 'IN', contentIds);
            partialAgg.addQuery('is_last', true);
            partialAgg.addQuery('compatibility_mode', '!=', '');
            partialAgg.addAggregate('COUNT', '');
            if (isDomainSeparated)
                partialAgg.queryNoDomain();
            else
                partialAgg.query();

            var partialMigrated = 0;
            if (partialAgg.next()) {
                partialMigrated = parseInt(partialAgg.getAggregate('COUNT', ''));
            }

            res.fullyMigrated = {
                dashboard: fullyMigrated
            };
            res.partiallyMigrated = {
                dashboard: partialMigrated
            };
            return res;
        }

        var grComponentBridge = new GlideAggregate('par_coreui_migration_bridge_component');
        grComponentBridge.groupBy('type');
        grComponentBridge.addQuery('is_last', true);
        grComponentBridge.addEncodedQuery('component!=NULL^component!=unknown');
        grComponentBridge.addAggregate('COUNT', 'component');
        if (isDomainSeparated)
            grComponentBridge.queryNoDomain();
        else
            grComponentBridge.query();
        while (grComponentBridge.next()) {
            res.fullyMigrated[grComponentBridge.type] = parseInt(grComponentBridge.getAggregate('COUNT', 'component'), 10);
        }
        // DEF0849323: Count fully migrated dashboards using the same criteria as the list view
        // (is_last=true AND compatibility_mode='' AND par_dashboard not empty) to ensure summary badge matches list count
        var fullyMigratedDashboardAgg = new GlideAggregate('par_coreui_migration_bridge_dashboard');
        fullyMigratedDashboardAgg.addQuery('is_last', true);
        fullyMigratedDashboardAgg.addQuery('compatibility_mode', '');
        fullyMigratedDashboardAgg.addQuery('par_dashboard', '!=', '');
        fullyMigratedDashboardAgg.addAggregate('COUNT', '');
        fullyMigratedDashboardAgg.setGroup(false);
        if (isDomainSeparated)
            fullyMigratedDashboardAgg.queryNoDomain();
        else
            fullyMigratedDashboardAgg.query();
        if (fullyMigratedDashboardAgg.next()) {
            res.fullyMigrated.dashboard = parseInt(fullyMigratedDashboardAgg.getAggregate('COUNT', ''), 10);
        }

        // DEF0849323: Count partially migrated dashboards using same pattern
        // (is_last=true AND compatibility_mode!='' AND par_dashboard not empty)
        var partiallyMigratedDashboardAgg = new GlideAggregate('par_coreui_migration_bridge_dashboard');
        partiallyMigratedDashboardAgg.addQuery('is_last', true);
        partiallyMigratedDashboardAgg.addQuery('compatibility_mode', '!=', '');
        partiallyMigratedDashboardAgg.addQuery('par_dashboard', '!=', '');
        partiallyMigratedDashboardAgg.addAggregate('COUNT', '');
        partiallyMigratedDashboardAgg.setGroup(false);
        if (isDomainSeparated)
            partiallyMigratedDashboardAgg.queryNoDomain();
        else
            partiallyMigratedDashboardAgg.query();
        var incompatibleDashboards = 0;
        if (partiallyMigratedDashboardAgg.next()) {
            incompatibleDashboards = parseInt(partiallyMigratedDashboardAgg.getAggregate('COUNT', ''), 10);
        }
        var dashboardTotal = res.fullyMigrated.dashboard + incompatibleDashboards;
        res.dashboardTotal = dashboardTotal;
        res.incompatibleDashboards = incompatibleDashboards;
        res.partiallyMigrated.dashboard = incompatibleDashboards;

        ['other', 'content_block', 'report', 'widget'].forEach(type => {
            var gr = new GlideRecord("par_coreui_migration_bridge_dashboard");
            gr.addEncodedQuery(`compatibility_modeLIKE${type}^is_last=true`)
            if (isDomainSeparated)
                gr.queryNoDomain();
            else
                gr.query();
            res.partiallyMigrated[type] = gr.getRowCount();
        });
        return res;
    },
    getBridgingRecords: function(bridgingTable, sysparm_query, sysparm_fields, sysparm_limit, sysparm_offset, contentIds) {
       
        var isDomainSeparated = new GlidePluginManager().isActive("com.glide.domain") || new GlidePluginManager().isActive("com.glide.domain.msp_extensions");

        var alteredColumns = {
            migration_logs: (gr, key) => {
                var length = 0;
                var error;
                var migrationLogs = gr.getValue("migration_logs");
                if (!migrationLogs) {
                    return {
                        length: 0,
                        error: undefined
                    };
                }
                if (migrationLogs.indexOf("[\"[<b>Dashboard Migration Logs:</b>,") === 0) // Is the old format of logs
                    return {
                        length: migrationLogs.split(",").length - 1
                    };

                try {
                    var logs = JSON.parse(migrationLogs);
                    length = logs.filter(e => e.level < 3).length; // 3 is marked as the debug level. We don't want to return that
                } catch (e) {
                    error = e;
                }

                return {
                    length: length,
                    error: error
                };
            }
        };

        // This point onward, should mimic a normal table API, excluding any "virtually alteredColumns"

        var dotWalkedFields = sysparm_fields?.filter(e => e.indexOf(".") > -1) ?? [];

        var res = {
            totalRows: 0,
            rows: [],
        };

        var dictionaryGr = new GlideRecord("sys_dictionary");
        dictionaryGr.addQuery("name", bridgingTable);
        dictionaryGr.addQuery("internal_type", "reference");
        if (isDomainSeparated)
            dictionaryGr.queryNoDomain();
        else
            dictionaryGr.query();
        var isReference = {};
        while (dictionaryGr.next()) {
            if (dictionaryGr.getValue("element") === "")
                continue;
            isReference[dictionaryGr.getValue("element")] = true;
        }

        var gr = new GlideRecord(bridgingTable);

        gr.addEncodedQuery(sysparm_query);
        if (contentIds && contentIds.length > 0) {
            gr.addQuery('pa_dashboard', 'IN', contentIds);
        }

        if (isDomainSeparated)
            gr.queryNoDomain();
        else
            gr.query();

        res.totalRows = gr.getRowCount();

        gr.setLimit(sysparm_limit);
        gr.chooseWindow(sysparm_offset, sysparm_offset + sysparm_limit);
        if (isDomainSeparated)
            gr.queryNoDomain();
        else
            gr.query();
        while (gr.next()) {
            var r = {};
            for (var key in gr) {
                if (sysparm_fields && sysparm_fields.indexOf(key) === -1)
                    continue;
                if (alteredColumns[key] && typeof alteredColumns[key] === "function") {
                    r[key] = alteredColumns[key](gr, key);
                    continue;
                }

                if (isReference[key]) {
                    r[key] = {
                        sys_id: gr.getValue(key),
                        value: gr.getDisplayValue(key),
                    };
                } else {
                    r[key] = gr.getDisplayValue(key);
                }
            }
            for (var field of dotWalkedFields) {
                var split = field.split(".");
                var current = gr;
                for (var i = 0; i < split.length; i++) {
                    var fieldSplit = split[i];
                    if (!current || current[fieldSplit] === null)
                        break;
                    current = current[fieldSplit]
                }
                r[field] = current?.getDisplayValue(split[split.length - 1]) ?? null;
            }
            res.rows.push(r);
        }

        return res;
    },
    type: 'MigrationStats_'
};
