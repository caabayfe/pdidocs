function promptUser() {
	var dialog = new GlideDialogWindow("glide_confirm_standard");
	dialog.setTitle("Training Activation");
	dialog.setPreference('warning', false);
	dialog.setPreference('title', "Do you want to activate this solution definition and begin training?");
	dialog.setPreference('onPromptComplete', onPromptComplete);
	dialog.setPreference('focusTrap',true);
	dialog.render(); //Open the dialog
}

function onPromptComplete(){
	//Call the UI Action again but skip the 'onclick' function
	gsftSubmit(null, g_form.getFormElement(), 'activate_and_train_ml_solution'); //MUST call the 'Action name' set in this UI Action
}

// Code that runs without the onclick
action.setRedirectURL(current);
current.setValue('active', true);
var result = current.update();
if (result != null) {
	new MLRequestSchedule().deleteExistingTrainingRequestSchedule(current.sys_id);
	new MLRequestSchedule().insertTrainingRequestSchedule(current.sys_id, current.solution_label, current.training_frequency.toString());
}
