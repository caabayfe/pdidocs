function onChange(control, oldValue, newValue, isLoading) {
  if (isLoading) return;

  // Check if the action type is script
  var wbActionType = g_form.getValue('type');
  if (wbActionType !== "script") return;

  var ga = new GlideAjax('WBActionItemScriptTemplateValidator');
  ga.addParam('sysparm_name', 'validate');

  ga.addParam('parameter_screen', g_form.getValue('parameter_screen'));
  ga.addParam('execution_script', g_form.getValue('execution_script'));
  ga.getXMLAnswer(processResult);

  function processResult(response) {
    var result = JSON.parse(response);
    if (!result.shouldReplace) return;

    if (result.shouldShowDialog) {
      var dialog = new GlideModal('glide_modal_confirm', true, 400);
      dialog.setTitle(result.dialogTitle);
      dialog.setPreference('body', result.dialogPreferences.body);
      dialog.setPreference('focusTrap', result.dialogPreferences.focusTrap);
      dialog.setPreference('buttonLabelComplete', result.dialogPreferences.buttonLabelComplete);
      dialog.setPreference('buttonLabelCancel', result.dialogPreferences.buttonLabelCancel);
      dialog.setPreference('onPromptComplete', function () {
        g_form.setValue('execution_script', result.execution_script);
      });

      dialog.render();
    } else {
      g_form.setValue('execution_script', result.execution_script);
    }
  }
}
