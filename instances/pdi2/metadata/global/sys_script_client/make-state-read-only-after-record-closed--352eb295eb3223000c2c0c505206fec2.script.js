function onLoad() {
   //Check if state is already closed
	var recordState = g_form.getValue("state");
	if(recordState.includes("closed")) {
		g_form.setReadOnly("state", true);
	}
}
