function changeCurrentSet() {
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;

	var list = GlideList2.get('sys_update_set');
	if (typeof list != 'undefined') {
		var nameCell = list.getCell(sysId, 'sys_update_set.name');
		var stateCell = list.getCell(sysId, 'sys_update_set.state');
		var keys = ["Invalid Update Set", "You can only select an Update Set that is In Progress", "In progress"];
		var msgs = getMessages(keys);
		
		if(stateCell.innerHTML.toLowerCase().indexOf(msgs['In progress'].toLowerCase()) == -1) {
			gsftWarn(msgs["Invalid Update Set"], msgs["You can only select an Update Set that is In Progress"]);
			return;
		}
	}

	var ajax = new GlideAjax("UpdateSetAjax");
	ajax.addParam("sysparm_type", "changeUpdateSet");
	ajax.addParam("sysparm_value", sysId);
	ajax.getXML(this.changeUpdateSetResponse.bind(this));
}

function changeUpdateSetResponse() {
	var picker = getTopWindow().g_update_set_picker;
	if (!picker)
		return;

	picker.select.options.length = 0;
	picker.fillUpdateSets();

	if (gel('sys_uniqueValue')) // are we on the form?
		window.location.reload();
}

/**
 * A GlideDialogWindow with an OK button
 * @param title
 * @param question
 * @param onPromptComplete (Optional callback function pointer)
 * @return
 */
function gsftWarn(title, question, onPromptComplete) {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('glide_warn', false);
	dialog.setTitle(title);
	dialog.setPreference('title', question);
	dialog.setPreference('onPromptComplete', onPromptComplete);
	dialog.render();
}
