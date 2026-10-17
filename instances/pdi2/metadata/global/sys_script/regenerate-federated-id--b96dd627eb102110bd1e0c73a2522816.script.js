(function executeRule(current, previous /*null when async*/ ) {
    var federatedIDGenerationHelper = new sn_identity.FederatedIDGenerationHelper();
    federatedIDGenerationHelper.regenerateIdForAllRecords(current.table_name);
})(current, previous);
