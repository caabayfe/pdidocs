(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('service_offering_commitment')
    if (current.cmdb_ci)
        gr.addQuery('cmdb_ci', current.cmdb_ci);
    else if (current.service_offering)
        gr.addQuery('service_offering', current.service_offering);
	
    gr.addQuery('service_commitment', current.service_commitment);
    gr.query();

    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('This commitment already exists for this offering or configuration item.'));
        current.setAbortAction(true);
    }

})(current, previous);
