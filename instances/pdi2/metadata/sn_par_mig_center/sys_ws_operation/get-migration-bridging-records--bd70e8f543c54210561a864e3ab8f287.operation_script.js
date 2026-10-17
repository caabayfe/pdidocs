(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var supportedTables = ["par_coreui_migration_bridge_dashboard", "par_coreui_migration_bridge_component", "par_coreui_migration_bridge_widget"];

    var alteredColumns = {
        migration_logs: (gr, key) => {
            var length = 0;
            var error;
            var migrationLogs = gr.getValue("migration_logs");
			if(!migrationLogs) {
				return {length: 0, error: undefined};
			}
            if(migrationLogs.indexOf("[\"[<b>Dashboard Migration Logs:</b>,") === 0) // Is the old format of logs
              return {length: migrationLogs.split(",").length - 1};

            try{
              var logs = JSON.parse(migrationLogs);
              length = logs.filter(e => e.level < 3).length; // 3 is marked as the debug level. We don't want to return that
            }
            catch(e) {
              error = e;
            }

            return {length: length, error: error};
        }
    };

    var bridgingTable = request.queryParams.sysparm_bridging_table?.[0];
    var sysparm_query = request.queryParams.sysparm_query?.[0];
    var sysparm_fields = request.queryParams.sysparm_fields?.[0]?.split(",");
    var sysparm_limit = parseInt(request.queryParams.sysparm_limit?.[0] ?? "50");
    var sysparm_offset = parseInt(request.queryParams.sysparm_offset?.[0] ?? "0");
	var contentIds = request.body?.data;

    if (supportedTables.indexOf(bridgingTable) === -1)
        return response.setError(new sn_ws_err.BadRequestError('table not supported. supported tables are ' + JSON.stringify(supportedTables)));


    // This point onward, should mimic a normal table API, excluding any "virtually alteredColumns"

    var dotWalkedFields = sysparm_fields?.filter(e => e.indexOf(".") > -1) ?? [];

    var res = {
        totalRows: 0,
        rows: [],
    };

    var dictionaryGr = new GlideRecord("sys_dictionary");
    dictionaryGr.addQuery("name", bridgingTable);
    dictionaryGr.addQuery("internal_type", "reference");
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
    gr.query();

    res.totalRows = gr.getRowCount();

    gr.setLimit(sysparm_limit);
    gr.chooseWindow(sysparm_offset, sysparm_offset + sysparm_limit);
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
            for (var i = 0;i < split.length;i++) {
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

})(request, response);
