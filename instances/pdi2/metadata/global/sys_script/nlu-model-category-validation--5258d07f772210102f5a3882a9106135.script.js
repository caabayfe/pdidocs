(function executeRule(current, previous /*null when async*/ ) {
    if (current.getValue('sys_policy') !== 'read' && !NLUModelCategoryUtil.isValidCategory(current.category)) {
		gs.addErrorMessage(gs.getMessage('Please select valid NLU Model Category.'));
        current.setAbortAction(true);
    }
})(current, previous);
