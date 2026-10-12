if (current.status != "Completed" && current.status != "Error") {
    gs.addInfoMessage(gs.getMessage("Federated Ids generation already in progress. Wait for completion to regenerate."));
    current.setAbortAction(true);
    action.setRedirectURL(current);
    exit;
}
var federatedIDGenerationHelper = new sn_identity.FederatedIDGenerationHelper();
federatedIDGenerationHelper.regenerateIdForAllRecords(current.table_name);
action.setRedirectURL(current);
