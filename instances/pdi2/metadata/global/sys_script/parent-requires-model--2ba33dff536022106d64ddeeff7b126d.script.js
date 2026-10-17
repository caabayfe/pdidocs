(function executeRule(current, previous /*null when async*/) {

	//If you have a parent your model must be either extension or contribution
	var validModels = {"contribution" : true, "extension": true};
	var model = current.getValue("model");

	if (gs.nil(model)) {
		current.setAbortAction(true);
		gs.addInfoMessage(sn_i18n.Message.getMessage("","You must select a model for this graph because it has a Parent. You must choose whether this graph contributes to the parent or extends from it."));
	} else if (!validModels[model]) {
		current.setAbortAction(true);
		gs.addInfoMessage(sn_i18n.Message.getMessage("","You must select a valid model type. Valid models are Extension and Contribution"));
	}
})(current, previous);
