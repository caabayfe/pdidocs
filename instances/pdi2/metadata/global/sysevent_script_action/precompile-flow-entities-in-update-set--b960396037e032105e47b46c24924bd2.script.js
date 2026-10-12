triggerPrecompileForCommittedUpdateSet();

/**
 * Triggers pre-compilation of flows and actions from a committed update set.
 * Invoked on the 'update.operation.complete' event, which may be triggered for 'update set', 'plugin', 'app' etc.,
 * - Ensures that the event pertains specifically to an update set before proceeding.
 *
 * Steps:
 * 1. Parses the event payload to extract update set details.
 * 2. Validates the existence of the update set record.
 * 3. Fetches associated flow and action records.
 * 4. Pre-compiles flows and actions if present.
 */
function triggerPrecompileForCommittedUpdateSet() {
    let update_set_details;
    try {
        update_set_details = JSON.parse(event.parm1);
    } catch (e) {
        gs.info("Pre-compilation failed: Invalid JSON string in parm1 of the event with sys_id '" + event.sys_id + "'.");
        return;
    }

    if (update_set_details.update_set) {
        let update_set_gr = new GlideRecord('sys_update_set');
        update_set_gr.setWorkflow(false);
        if (update_set_gr.get(update_set_details.update_set)) {
            let update_set_records = _fetchUpdateSetRecords(update_set_gr.getUniqueValue());
            new global.FlowCompilerUtils().preCompileActionsAndFlowsAsync(update_set_records.actions, update_set_records.flows);
        }
    }
}

/**
 * Fetches flows and actions associated with a given update set.
 * 
 * @private
 * @param {string} update_set_id - sys_id of the update set.
 * @returns {Object} Object containing arrays of flow and action sys_ids.
 */
function _fetchUpdateSetRecords(update_set_id) {
    let update_records = {
        flows: [],
        actions: []
    };

    // Fetch updates from the 'update set'
    let updates_gr = new GlideRecord('sys_update_xml');
    updates_gr.setWorkflow(false);
    updates_gr.addQuery('update_set', update_set_id);
    updates_gr.addNotNullQuery('name');
    updates_gr.query();
    if (updates_gr.next()) {
        // Fetch update record details
        let metadata_gr = new GlideRecord('sys_metadata');
        metadata_gr.setWorkflow(false);
        let qc = metadata_gr.addQuery('sys_update_name', updates_gr.getValue('name'));
        while (updates_gr.next())
            qc.addOrCondition('sys_update_name', updates_gr.getValue('name'));

        metadata_gr.query();
        while (metadata_gr.next()) {
            let table_name = metadata_gr.getRecordClassName();
            // Check if the record is a flow and add its sys_id to the flows array
            if (table_name == 'sys_hub_flow') {
                update_records.flows.push(metadata_gr.getUniqueValue());
            }
            // Check if the record is an action type definition and add its sys_id to the actions array
            if (table_name == 'sys_hub_action_type_definition') {
                update_records.actions.push(metadata_gr.getUniqueValue());
            }
        }
    }

    return update_records;
}
