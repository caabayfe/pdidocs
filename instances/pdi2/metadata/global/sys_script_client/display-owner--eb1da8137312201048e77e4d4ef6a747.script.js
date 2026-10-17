function onLoad() {
    //Hide owner on create
    if (g_form.isNewRecord()) {
		g_form.setValue('owner', g_user.userID);
        g_form.setDisabled('owner', true);
		g_form.setDisplay('external', false);
    }
}
