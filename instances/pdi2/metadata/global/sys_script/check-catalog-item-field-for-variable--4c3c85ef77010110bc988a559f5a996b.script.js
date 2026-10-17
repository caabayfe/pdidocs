(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var catItem = new SNCCatalogWizardUtil().getCatItemFromWizardQuestion(current);
	if (JSUtil.nil(catItem)) {
		abortInsert(gs.getMessage('Catalog item configuration for this wizard is invalid. Please choose a valid catalog item before inserting a question')); 
		return;
	}
	else if (!current.map_to_set)
		validateQuestion(catItem);
	else if (current.map_to_set)
		validateMRVS(catItem);

	function abortInsert(message) {
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}
	
	function validSet(qSetId, itemId) {
		var catItem = new sn_sc.CatItem(itemId);
		if (JSUtil.nil(catItem))
			return false;
		var varSets = catItem.getVariableSet();
		return (varSets.indexOf(qSetId + '') > -1);
	}
	
	function validateQuestion(itemId) {
		var invalidQuestionMsg = gs.getMessage('Please select a valid question');
		var invalidCatalogItemMsg = gs.getMessage('The selected question is not associated with the catalog item configured on this wizard');
		var quesId = current.getValue("item_option_new");
		if (!GlideStringUtil.isEligibleSysID(quesId)) {
			abortInsert(invalidQuestionMsg);
			return;
		}
		var questionObj = GlideappQuestion.getQuestion(quesId);
		if (JSUtil.nil(questionObj)) {
			abortInsert(invalidQuestionMsg);
			return;
		}
		var qItemId = questionObj.getCatalogItem();
		var qSetId = questionObj.getVSetID();
		if (qItemId == itemId)
			return;
		if (!GlideStringUtil.isEligibleSysID(qSetId)) {
			abortInsert(invalidCatalogItemMsg);
			return;
		}
		if (questionObj.getVSetType().toString() == "one_to_many") {
			abortInsert(invalidQuestionMsg);
			return;
		}
		if (!validSet(qSetId,itemId))
			abortInsert(invalidCatalogItemMsg);
	}
	
	function validateMRVS(itemId) {
		var invalidMRVSMsg = gs.getMessage('Please select a valid MRVS');
		var invalidCatalogItemMsg = gs.getMessage('The selected MRVS is not associated with the catalog item configured on this wizard');
		var setId = current.getValue("set");
		if (!GlideStringUtil.isEligibleSysID(setId)) {
			abortInsert(invalidMRVSMsg);
			return;
		}
		var setGr = new GlideRecord("item_option_new_set");
		if (!setGr.get(setId) || setGr.getValue("type") != "one_to_many") {
			abortInsert(invalidMRVSMsg);
			return;
		}
		if (!validSet(setId,itemId))
			abortInsert(invalidCatalogItemMsg);
	}

})(current, previous);
