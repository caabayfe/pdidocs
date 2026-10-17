(function(event) {
	var changeSysId = event.instance;
	if (!changeSysId)
		return;

	var changeGr = new GlideRecord("change_request");
	if (!changeGr.get(changeSysId) || changeGr.chg_model.nil())
		return;

	var changeModel = new ChangeModel(changeGr.chg_model.getRefRecord());
	if (changeModel.applyAutomaticTransition(changeGr))
		changeGr.update();
})(event);
