function onSubmit() {
	var nluModelArray = g_form.getValue('nlu_model').split(',');

	if (nluModelArray.length > 1) {
		g_form.addErrorMessage(getMessage('You cannot select more than one NLU model at a time.'));
		return false;
	}
   
}
