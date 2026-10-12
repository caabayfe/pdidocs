(function process(env) {
	var parentRecord = new GlideRecordSecure(env.getArguments().parentTable);
	if(!parentRecord.get(env.getArguments().parentRecord))
		return null;
    return sn_playbook.PlaybookExperience.getPlaybooksForParentRecord(parentRecord);	
})(env);
