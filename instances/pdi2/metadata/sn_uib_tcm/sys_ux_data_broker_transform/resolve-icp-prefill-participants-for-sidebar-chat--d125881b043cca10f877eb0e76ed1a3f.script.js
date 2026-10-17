function transform(input) {
    var output = {};
    if (!input.icpSysId)
        return output;
    var commManagementUtil = new sn_comm_management.CommunicationManagementUtil();
    var users = commManagementUtil.getContactsForChat(input.icpSysId, 'incident_alert');
    var incidentAlertGr = new GlideRecord('incident_alert');
    if (incidentAlertGr.get(input.icpSysId)) {
        var incidentSysId = incidentAlertGr.source_incident.toString();
        var incidentGr = new GlideRecord('incident');
        if (incidentGr.get(incidentSysId)) {
            try {
                var inputs = {};
                inputs['incident'] = incidentGr; // GlideRecord of table: incident 
                inputs['users'] = users; // Array.String 
                var result = sn_fd.FlowAPI.getRunner().subflow('sn_uib_tcm.run_permission_check_action_for_prefilling_ict_sidebar_chat_users').inForeground().withInputs(inputs).run();
                var outputs = result.getOutputs();
                var allowed_users = outputs['allowed_users']; // Array.String
                var error_message = outputs['error_message']; // String
                output.users = allowed_users;
                output.error_message = error_message;

            } catch (ex) {
                var message = ex.getMessage();
                gs.error(message);
            }
        }
    }

    return output;
}
