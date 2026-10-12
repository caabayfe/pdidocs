function onAfter(current, previous) {

	/* proposal_type
	 * 1 - New Template
	 * 2 - Modify an Existing Template
	 * 3 - Retire an Existing Template
	 */
	var util = new StdChangeUtils();
	if (current.approval == 'approved') {
		//This extra validation is for import cases , when workflow is turned inactive
		//Customers will be advised to create proposal in 
		//State > In Progress , Approval > Approved for importing
		var validateResult = util.validateProposal(current, true, true);
		if (!validateResult) {
			util.rollBackApproval(current);
		} else {
			if (current.proposal_type == 1) {
				util.publishNewStandardChangeProposal(current.sys_id);
			} else if (current.proposal_type == 2) {
				util.modifyExistingStandardChangeProposal(current.sys_id, current.std_change_producer);
			} else if (current.proposal_type == 3) {
				util.retireExistingStandardChangeProposal(current.sys_id, current.std_change_producer);
			}
		}
	} else if (current.approval == 'rejected') {
		util.rejectProposal(current.sys_id);
	}
}
