(function executeRule(current, previous /*null when async*/) {

	var message = current.getValue("err_message");
    gs.addErrorMessage(message);

})(current, previous);
