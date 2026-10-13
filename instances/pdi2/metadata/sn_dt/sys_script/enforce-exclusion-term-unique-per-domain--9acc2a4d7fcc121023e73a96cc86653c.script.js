(function executeRule(current, previous /*null when async*/ ) {

    function abortAndErrorMsg() {
        gs.addErrorMessage(gs.getMessage("Exclusion term and Domain combination already exists"));
        current.setAbortAction(true);
    }

    var exclusionTerm = current.getValue("exclusion_term");
    var domain = current.getValue("sys_domain");
    var gr = new GlideRecord("sn_dt_exclusion_rule");
    gr.addQuery("exclusion_term", exclusionTerm);
    gr.addQuery("sys_domain", domain);
    gr.addQuery("sys_id", "!=", current.getUniqueValue());
    gr.query();

    if (current.getValue('ignore_case') !== "1") {
        while (gr.next()) {
            if (gr.getValue('ignore_case') === '1' || gr.getValue('exclusion_term') === exclusionTerm) {
                abortAndErrorMsg();
                break;
            }
        }
    } else {
        if (gr.getRowCount() > 0) {
            abortAndErrorMsg();
        }
    }
})(current, previous);
