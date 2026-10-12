(function() {
	var preconfiguredQuestionTypeGr = sc_ic_Factory.wrap(current).checkForPreconfigured();
	if (preconfiguredQuestionTypeGr.next()) {
		gs.addErrorMessage(gs.getMessage("There is already an active <i>non</i>-preconfigured Question Type record for Question Class <b>{0}</b> - click <a href='{1}'>here</a> to view it", [preconfiguredQuestionTypeGr[sc_ic.QUESTION_CLASS].getDisplayValue(), preconfiguredQuestionTypeGr.getLink()]));
		current.setAbortAction(true);
	}
})();
