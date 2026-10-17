function transform(input) {
    if (!input || !input.callerId || !input.table || !gs.tableExists(input.table)) return [];
    var table = input.table;
    const HARDWARE = "alm_hardware";
    const COMPUTER_CLASS = "cmdb_ci_computer";
    const INCIDENT = "incident";
    const INTERACTION = "interaction";
    const ALM_ASSET = "alm_asset";
    const SC_REQUEST = "sc_request";
    var callerRecords = [];
    var callerField = (table == INCIDENT) ? "caller_id" : (table == INTERACTION) ? "opened_for" : (table == SC_REQUEST) ? "requested_for" : "assigned_to";
    var sysId = input.sysId;
    var gr = new GlideRecord(table);
    if (table != ALM_ASSET) {
        gr.addEncodedQuery(input.recentQuery, true);
        gr.orderByDesc('sys_created_on');
    }
    gr.query(callerField, input.callerId);
    gr.setLimit(10);
    gr.query();
    while (gr.next()) {
        if (sysId && sysId == gr.getValue('sys_id')) continue;
        var record = {
            'table': table,
            'sys_id': gr.getValue('sys_id')
        };
        if (table == ALM_ASSET) {
            record["display_name"] = gr.display_name.getDisplayValue();
            record["class"] = gr.getValue('sys_class_name');
            record["labelled"] = [];
            record["computer_sysid"] = gr.ci.sys_id.toString();
            if (record["class"] === HARDWARE) {
                record["hardware_class"] = gr.ci.sys_class_name.toString();
                if (gr.getValue('asset_tag')) record["labelled"].push({
                    "label": gr.asset_tag.getLabel(),
                    "value": gr.getValue('asset_tag')
                });
                if (gr.getValue('serial_number')) record["labelled"].push({
                    "label": gr.serial_number.getLabel(),
                    "value": gr.getValue('serial_number')
                });
                if (record["hardware_class"] === COMPUTER_CLASS) {
                    if (gr.ci.name.toString()) record["labelled"].push({
                        "label": gr.ci.name.getLabel(),
                        "value": gr.ci.name.toString()
                    });
                    if (gr.ci.os.toString()) record["labelled"].push({
                        "label": gr.ci.os.getLabel(),
                        "value": gr.ci.os.toString()
                    });
                    if (gr.ci.os_version.toString()) record["labelled"].push({
                        "label": gr.ci.os_version.getLabel(),
                        "value": gr.ci.os_version.toString()
                    });
                }
            } else continue;
        } else {
            record["number"] = gr.getValue('number');
            record["sys_created_on"] = gr.getValue('sys_created_on');
            record["short_description"] = gr.getValue('short_description');
            if (table == INCIDENT) {
                record["priority"] = gr.getValue("priority");
                record["priority_label"] = gr.getDisplayValue("priority");
                record["labelled_row_one"] = [];
                record["labelled_row_two"] = [];
                if (gr.getValue('priority')) record["labelled_row_one"].push({
                    "label": gr.priority.getLabel(),
                    "value": gr.getDisplayValue('priority')
                });
                if (gr.getValue('sys_created_on')) {
                    var gdt = new GlideDateTime(gr.getValue('sys_created_on'));
                    var dateOnly = gdt.getDate().getDisplayValue();
                    record["labelled_row_one"].push({
                        "label": gs.getMessage("Opened"),
                        "value": dateOnly
                    });
                }
                if (gr.getValue('state')) record["labelled_row_two"].push({
                    "label": gr.state.getLabel(),
                    "value": gr.getDisplayValue('state')
                });
                if (gr.getValue('assignment_group')) record["labelled_row_two"].push({
                    "label": gr.assignment_group.getLabel(),
                    "value": gr.getDisplayValue('assignment_group')
                });
            }
            if (table == INTERACTION) {
                record["labelled"] = [];
                record["type"] = gr.getValue("type");
                record["interaction_type_label"] = gr.getDisplayValue("type") + " - ";
                if (gr.getValue('sys_created_on')) {
                    var gdt = new GlideDateTime(gr.getValue('sys_created_on'));
                    var dateOnly = gdt.getLocalDate().getDisplayValue();
                    record["labelled"].push({
                        "label": gs.getMessage("Opened"),
                        "value": dateOnly
                    });
                }
                if (gr.getValue('state')) record["labelled"].push({
                    "label": gr.state.getLabel(),
                    "value": gr.getDisplayValue('state')
                });
            }
            if (table == SC_REQUEST) {
                record["priority"] = gr.getValue("priority");
                record["priority_label"] = gr.getDisplayValue("priority");
                record["labelled_row_one"] = [];
                record["labelled_row_two"] = [];
                if (gr.getValue('priority')) record["labelled_row_one"].push({
                    "label": gr.priority.getLabel(),
                    "value": gr.getDisplayValue('priority')
                });
                if (gr.getValue('sys_created_on')) {
                    var gdt = new GlideDateTime(gr.getValue('sys_created_on'));
                    var dateOnly = gdt.getDate().getDisplayValue();
                    record["labelled_row_one"].push({
                        "label": gs.getMessage("Opened"),
                        "value": dateOnly
                    });
                }
                if (gr.getValue('state')) record["labelled_row_two"].push({
                    "label": gr.state.getLabel(),
                    "value": gr.getDisplayValue('state')
                });
                if (gr.getValue('stage')) record["labelled_row_two"].push({
                    "label": gr.stage.getLabel(),
                    "value": gr.getDisplayValue('stage')
                });
            }
        }
        callerRecords.push(record);
    }
    return callerRecords;
}
