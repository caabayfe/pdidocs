(function executeRule(current, previous /*null when async*/) {
	if( gs.getUser().hasRole('sn_publications.author') || gs.getUser().hasRole('sn_publications.approver') ) {
		return;
	}
	current.addEncodedQuery('stage=published');
	var grSQ = current.addJoinQuery('sn_publications_publication_contact_m2m',  'sys_id', 'publication');
	grSQ.addCondition('user', gs.getUserID());
})(current, previous);
