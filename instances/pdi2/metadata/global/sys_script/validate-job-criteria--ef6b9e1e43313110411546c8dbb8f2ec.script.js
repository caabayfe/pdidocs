(function executeRule(current, previous /*null when async*/ ) {
    var encodedQuery = current.getValue('job_criteria');
    var query = SNC.JobCriteriaAPI.getDeserializedQuery(encodedQuery);

    if (SNC.JobCriteriaAPI.isInvalidJobCriteriaQuery(query)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Invalid Job Criteria query: {0}", encodedQuery));
    } else {
        var fields = SNC.JobCriteriaAPI.getInvalidJobCriteriaFields(query);
        if (fields !== "") {
            current.setAbortAction(true);
            if (fields.includes(",")) {
                gs.addErrorMessage(gs.getMessage("Invalid fields in Job Criteria: {0}", fields));
            } else {
                gs.addErrorMessage(gs.getMessage("Invalid field in Job Criteria: {0}", fields));
            }
        }
    }

})(current, previous);
