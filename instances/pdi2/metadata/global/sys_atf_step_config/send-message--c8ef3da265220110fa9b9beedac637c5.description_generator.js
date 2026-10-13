function generateDescription() {
    // the global variable 'step' represents the current glide record
    var inputMessage = step.inputs.message;
    var message = inputMessage && inputMessage.toString().length > 75 ? inputMessage.slice(0,75) + "... \n Open record to view complete message" : inputMessage;
    var description = gs.getMessage("Expected Message: {0}", message);
	return description;
}
 generateDescription();
