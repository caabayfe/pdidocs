var Scan3DESDataTablesStringFields = Class.create();
Scan3DESDataTablesStringFields.prototype = {
    initialize: function(start, end, engine) {
        if (gs.getProperty('glide.security.glideencrypter.allow', 'true') === 'false' || gs.getProperty('glide.security.3des.static_keys_usable', 'false') === 'false') {
            gs.info("Properties need to be set propertly to run the scan for 3DES data for String Fields, Please check");
            return;
        }

        var skipTableColumns = {
            "sc_item_option": ["value"],
            "question_answer": ["value"],
            "discovery_credentials": ["ssh_private_key"]
        };

        var skipTableColFromProp = fetchSkipTableColumnsFromProperty();

        var tableMap = getTableNames(start, end);
        var tableColumnsMap = getTableNamesAndColumnNames(Object.keys(tableMap), tableMap);
        var skipTablesFromQuerying = ["sys_variable_value", "sys_archive_log", "v_pending_scheduled_job", "v_interaction_context", "sys_update_xml", "sys_audit", "sys_log", "sys_journal_field", "sys_journal_field_edit", "sys_attachment", "sys_attachment_doc", "sys_history_set", "sys_history_line", "sys_upgrade_history", "sys_upgrade_history_log", "sn_github_spoke_st_github_repositories", "sn_github_spoke_github_webhook_registry", "sn_github_spoke_github_owner", "sn_github_spoke_github_fields", "sn_gf_goal", "sn_gf_goal_target", "sn_gf_goal_target_progress", "sn_gf_strategic_plan", "sn_gf_strategy", "sn_gf_strategy_value"];

        var grRemoteTables = getRemoteTablesGR();
        while (grRemoteTables.next()) {
            skipTablesFromQuerying.push(grRemoteTables.getDisplayValue("name"));
        }

        var THRESHOLD = gs.getProperty('glide.security.nonpassword2.scan.threshold', 5);
        var ISNOTEMPTY_LITERAL = "ISNOTEMPTY";
        var OR_QUERY_LITERAL = "^OR";
        var tableAndColNames = {};
        var tdesFieldsSkipped = {};

        for (var table in tableColumnsMap) {
            if (skipTablesFromQuerying.indexOf(table) != -1 || nameStartsWith(table))
                continue;

            var skipCols = skipTableColumns[table] || [];
            var skipColsProp = skipTableColFromProp[table] || [];
            var tableHas3Des = false;
            var colsWith3Des = [];

            var columns = tableColumnsMap[table];
            if (columns.length == 0)
                continue;
            var colWith3DESCountMap = {};
            var colWithNon3DESCountMap = {};
            try {
                var colNames = [];
                var allSkipCols = skipCols.concat(skipColsProp);
                for (var i in columns) {
                    colNames.push(columns[i].colName);
                }

                var scanResultJson = SNC.TDESDataScanUtil.scan3DESDataForTable(table, colNames, allSkipCols);
                if (JSUtil.nil(scanResultJson)) {
                    continue;
                }

                var scanResult = JSON.parse(scanResultJson);
                tableHas3Des = scanResult.tableHas3Des;
                colWith3DESCountMap = scanResult.colWith3DESCountMap || {};
                colWithNon3DESCountMap = scanResult.colWithNon3DESCountMap || {};
                colsWith3Des = scanResult.colsWith3Des || [];
            } catch (e) {
                gs.log(e + "Error in executing 3DES scan for string fields for the table: " + table);
            }

            if (!tableHas3Des)
                continue;
            // Unqueried GlideRecord used only as a table reference for engine.finding.setCurrentSource
            var sourceGr = new GlideRecord(table);
            var fieldsWithLowThreshold = [];
            for (var key in colWith3DESCountMap) {
                if (!colWith3DESCountMap.hasOwnProperty(key))
                    continue;
                if (colWith3DESCountMap[key] >= THRESHOLD || colWithNon3DESCountMap[key] === undefined) {
                    engine.finding.setCurrentSource(sourceGr);
                    engine.finding.increment();
                    engine.finding.setValue("finding_details", key);
                } else {
                    fieldsWithLowThreshold.push(key);
                }

            }
            if (fieldsWithLowThreshold.length > 0)
                tdesFieldsSkipped[table] = fieldsWithLowThreshold;

            tableAndColNames[table] = colsWith3Des;
        }

        var skippedMigrationProperty = "glide.security.nonpassword2.scan.skipped_migration";
        try {
            var jsonString = gs.getProperty(skippedMigrationProperty, '{}');
            var objFromProperty = JSON.parse(jsonString);
            if (hasKeys(objFromProperty))
                tdesFieldsSkipped = mergeObjects(objFromProperty, tdesFieldsSkipped);
        } catch (e) {
            gs.log('Invalid JSON for skippedMigrationProperty :', e.message);
        }

        if (hasKeys(tdesFieldsSkipped))
            gs.setProperty(skippedMigrationProperty, JSON.stringify(tdesFieldsSkipped), ' Property that holds table:column info which are skipped from auto non-password2 data migration because of threshold check ');

        gs.info("Scan 3DES data in Tables with String Fields results : " + JSON.stringify(tableAndColNames));

        function getTableNamesAndColumnNames(keys, tMap) {
            var tableQuery = "nameIN" + keys + "^internal_type=string^ORinternal_type=string_full_utf8^element!=sys_created_by^element!=sys_updated_by^active=true";
            var gr = new GlideAggregate("sys_dictionary");
            gr.setWorkflow(false);
            gr.setUseEngines(false);
            gr.addEncodedQuery(tableQuery);
            gr.query();
            while (gr.next()) {
                var tableName = gr.getValue("name");
                var columnName = gr.getValue("element");
                if (!tMap.hasOwnProperty(tableName)) {
                    tMap[tableName] = [];
                }
                // Add column details to the table's column list
                tMap[tableName].push({
                    colName: columnName,
                });
            }
            return tMap;
        }

        function getRemoteTablesGR() {
            var grRemoteTables = new GlideRecord("sys_db_object");
            grRemoteTables.setWorkflow(false);
            grRemoteTables.setUseEngines(false);
            grRemoteTables.addQuery("scriptable_table", "true");
            grRemoteTables.query();
            return grRemoteTables;
        }

        function hasKeys(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key))
                    return true;
            }
            return false;
        }

        function mergeObjects(propObj, currObj) {
            var result = {};
            for (var key in propObj) {
                if (propObj.hasOwnProperty(key))
                    result[key] = propObj[key];
            }

            for (var key in currObj) {
                if (currObj.hasOwnProperty(key))
                    result[key] = currObj[key];
            }
            return result;
        }

        function getTableNames(start, end) {
            var tableMap = {};
            var tableQuery = "nameNOT LIKEvar__m_^internal_type=string^ORinternal_type=string_full_utf8^element!=sys_created_by^element!=sys_updated_by^active=true";
            var gr = new GlideAggregate("sys_dictionary");
            gr.setWorkflow(false);
            gr.setUseEngines(false);
            gr.addEncodedQuery(tableQuery);
            gr.groupBy("name");
            gr.chooseWindow(start, end);
            gr.query();
            while (gr.next()) {
                if (!tableMap.hasOwnProperty(gr.name.toString())) {
                    var cols = [];
                    tableMap[gr.name.toString()] = cols;
                }
            }
            return tableMap;
        }

        function fetchSkipTableColumnsFromProperty() {
            try {
                var tableCols = gs.getProperty('glide_encryption.non_password2.skip_migration_tables', '{}');
                var cleanSkipTableColProp = tableCols
                    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
                    .replace(/'/g, '"');
                return JSON.parse(cleanSkipTableColProp);
            } catch (e) {
                return {};
            }
        }

        //This returns whether a table starts with the prefix to skip those from scan
        function nameStartsWith(name) {
            var prefixes = [
                "ecc_queue",
                "sys_log",
                "sys_audit",
                "ar_",
                "sys_history",
                "sys_journal",
                "sys_attachment"
            ];

            for (var i = 0; i < prefixes.length; i++) {
                if (name.indexOf(prefixes[i]) === 0) {
                    return true;
                }
            }
            return false;
        }
    },

    type: 'Scan3DESDataTablesStringFields'
};
