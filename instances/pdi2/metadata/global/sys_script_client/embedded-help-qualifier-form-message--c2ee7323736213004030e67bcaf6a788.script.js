function onLoad() {
    //Show message when form is loaded
	var x = new GwtMessage();
	var message = x.getMessage('Enter a value for either Query params or Fragment. You can also enter a value in both fields');
    g_form.addInfoMessage(message);
}
