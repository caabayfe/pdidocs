function showCompareDialog(){
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass("sa_state_model_comparison");
	dialog.setTitle(getMessage("Run Comparison"));
	dialog.setPreference('sysparm_id', gel('sys_uniqueValue').value);
	dialog.render();
}
