function transform(input) {
	gs.flushMessages();
    var { related_record, action } = input;
    var archiveRuleManager = new ArchiveRuleManager();
	const dmRuleConstants = new DMRuleConstants();
	var response;
	switch(action) {
		case dmRuleConstants.ACTION.ADD:
			response = archiveRuleManager.createArchiveRelatedRule(related_record);
			break;	
		case dmRuleConstants.ACTION.DELETE:
			response = [];
			related_record.forEach((record, index) => {
				response[index] = archiveRuleManager.deleteArchiveRelatedRule(record);
			});
			break;
		default: 
			break;
	}
    gs.flushMessages();
    return { response, action };
}
