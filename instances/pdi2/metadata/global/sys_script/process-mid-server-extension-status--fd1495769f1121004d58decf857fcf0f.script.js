(function() {
	var eccQueueGr = current;
	var state = eccQueueGr.state;
	var queue = eccQueueGr.queue;
	var parser = new ECCPayloadParser(eccQueueGr.payload);
	var params = parser.getParameters();
	var contextGr = new GlideRecord(MIDExtensionConstants.CONTEXT_TABLE);
	contextGr.get(params.ContextSysId);
	var cmd = params.ExtensionCommand;
	var evtForCurrentMid;
	var EMPTY_COMMAND = "empty_command";
	//handle case when cmd is empty, so script will not crash
	if(!cmd)
		cmd = EMPTY_COMMAND;

	// don't update if command is "test parameters"
	if (cmd == MIDExtensionConstants.COMMAND_TEST_PARAMETERS)
		return;

	if (!JSUtil.nil(contextGr.executing_on))
		if ('' + current.agent == 'mid.server.' + contextGr.executing_on.name)
			evtForCurrentMid = true;

	if (state == 'error') {
		if (!evtForCurrentMid)
			return;
		contextGr.error_message = eccQueueGr.error_string;
		contextGr.status = ((queue == 'output') && (cmd != MIDExtensionConstants.COMMAND_UPDATE_PARAMETERS)) || cmd == EMPTY_COMMAND ?
				MIDExtensionConstants.CONTEXT_STATUS_ERROR : MIDExtensionConstants.CONTEXT_STATUS_WARNING;
	} else if (state == 'processed' && queue == 'output') {

		switch (cmd) {
			case MIDExtensionConstants.COMMAND_START:
			case MIDExtensionConstants.COMMAND_RESTART:
			case MIDExtensionConstants.COMMAND_UPDATE_PARAMETERS:
				contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_STARTED;
				contextGr.error_message = '';
				break;
			case MIDExtensionConstants.COMMAND_STOP:
				if (!evtForCurrentMid)
					return;
				contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_STOPPED;
				contextGr.executing_on = '';
				break;
		}
	}
	contextGr.update();
}());
