(function executeRule(current, previous /*undefined when async or display*/) {

	gs.addErrorMessage(gs.getMessage('Template to modify/retire can only be set when state is New'));
	current.setAbortAction(true);

})(current, typeof previous != 'undefined' ?  previous : null);
