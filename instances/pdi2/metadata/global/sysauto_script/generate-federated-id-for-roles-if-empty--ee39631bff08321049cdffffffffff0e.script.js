var ROLE_TABLE = "sys_user_role";
var EMPTY_FED_ID_ENCODED_QUERY = "federated_idISEMPTY";

generateRoleFedIdIfEmpty();

function generateRoleFedIdIfEmpty() {
    if (!isFedIDGenerationJobCompleted()) {
        gs.debug("Federated ID Generation: Skipping as federated ID generation for sys_user_role table is already in progress.");
        return;
    }
    if (!rolesWithEmptyFedIdExists()) {
        gs.debug("Federated ID Generation: No records found with empty federated ID in sys_user_role table.");
        return;
    }
    gs.info("Federated ID Generation: Starting federated ID generation for records with empty federated ID in sys_user_role table.");
    try {
        var helper = new sn_identity.FederatedIDGenerationHelper();
        helper.regenerateIdForRecords(ROLE_TABLE, EMPTY_FED_ID_ENCODED_QUERY);
    } catch (err) {
        gs.error("Federated ID generation failed for sys_user_role table: " + err);
    }
    gs.info("Federated ID Generation: Completed federated ID generation for records with empty federated ID in sys_user_role table.");
}

function isFedIDGenerationJobCompleted() {
    var gr = new GlideRecord("iamsync_type");
    gr.addQuery("type_name", "Role");
    gr.query();
    var status = "";
    if (gr.next()) {
        status = gr.getValue("status");
    }
    return (["Completed", "Error"].includes(status));
}

function rolesWithEmptyFedIdExists() {
    var ga = new GlideAggregate(ROLE_TABLE);
    ga.addEncodedQuery(EMPTY_FED_ID_ENCODED_QUERY, true);
    ga.addAggregate("COUNT");
    ga.query();
    ga.next();
    return parseInt(ga.getAggregate("COUNT")) > 0;
}
