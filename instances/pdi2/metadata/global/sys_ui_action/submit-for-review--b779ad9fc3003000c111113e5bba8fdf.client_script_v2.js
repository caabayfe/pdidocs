function onClick(g_form) {
	g_form.setMandatory('starts', true);
	g_form.setMandatory('approver', true);
    g_form.hideFieldMsg('starts');
    if (g_form.getValue('starts') === '') {
        g_form.showFieldMsg('starts', getMessage('Enter a start date before submitting for review'), 'error');
    } else {
        if (g_form.getValue('approver') === '') {
            g_form.addErrorMessage(getMessage('Select an approver to review this contract'));
        } else {
            g_form.setValue('substate', 'under_review');
        }
        g_form.save();
    }
}
