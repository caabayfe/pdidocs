function onLoad() {
    var executionMode = g_form.getValue('query_mode');
    var clientMode = (executionMode === 'client_event');

	//Do not display query mode on form if execution mode is client.
	// "client" execution mode is currently only supported agent chat client code.
	var showQueryMode = !clientMode;
	g_form.setDisplay('query_mode', showQueryMode);


	// Do not provide customers option to choose client_event since it's only supported
	// through agent chat client code.
    if (!clientMode) {
		g_form.removeOption('query_mode', 'client_event');
    }
}
