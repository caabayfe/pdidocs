/**
 * 1) This business rule will parse the payload for the ContextSysId probe parameter
 * 2) From this ContextSysId, it will look up the MID Extension context GlideRecord
 * 3) From this, it will look up the MID Extension definition GlideRecord
 * 4) If this definition has a script, it will be evaluated
 */
(function() {
	//guilty until proven innocent
	current.state = 'error';
	
	//grab the ContextSysId from the probe parameter
	if (JSUtil.nil(current.payload)) {
		current.error_string = 'MID Extension input ecc_queue ' + current.sys_id + ' has no payload to process.  Skipping.';
		return;
	}
	
	var parser = new ECCPayloadParser(current.payload);
	var params = parser.getParameters();
	
	if (JSUtil.nil(params.ContextSysId)) {
		current.error_string = 'No MID Extension context detected in payload.';
		return;
	}
	
	//get the Extension context GlideRecord
	var contextGr = new GlideRecord(MIDExtensionConstants.CONTEXT_TABLE);
	if (!contextGr.get(params.ContextSysId)) {
		current.error_string = 'No such MID Extension context exists with sys_id=' + params.ContextSysId;
		return;
	}

	// if command is clear error, update the context
	var cmd = params.ExtensionCommand;
	if (JSUtil.notNil(cmd) && (cmd == MIDExtensionConstants.COMMAND_CLEAR_ERROR)) {
		contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_STARTED;
		contextGr.error_message = '';
		contextGr.update();
		current.state = 'processed';
		return;
	}

	//get the Extension definition GlideRecord from the context
	var extensionDefGr = new GlideRecord(MIDExtensionConstants.EXTENSION_DEF_TABLE);
	if (!extensionDefGr.get(contextGr.extension)) {
		current.error_string = 'No such MID Extension definition exists with sys_id=' + contextGr.extension;
		return;
	}
	
	//at this point, the input is valid
	current.state = 'processed';
	
	var script = extensionDefGr.getValue('script');
	
	if (JSUtil.nil(script))    //SNMP Trap listener does not have script
		return;
	
	try {
		var func = eval('(' + script+ ')');
		func(current, params);
	} catch (ex) {
		current.state = 'error';
		current.error_string = '' + ex.message;
	}
}());
