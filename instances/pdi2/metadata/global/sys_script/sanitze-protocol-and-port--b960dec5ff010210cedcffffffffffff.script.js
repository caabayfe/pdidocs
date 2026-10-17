(function executeRule(current, previous /*null when async*/ ) {

    var isValidProtocolName = current.protocol && current.protocol.match(/^[a-z]+$/);
    var isValidPort = current.default_port && current.default_port.match(/^[0-9]+$/);

    if (!isValidProtocolName)
        gs.addErrorMessage(gs.getMessage("Invalid Protocol. Protocol may only contain lower case alphabets."));

    if (!isValidPort)
        gs.addErrorMessage(gs.getMessage("Invalid Default port. Default port may only contain numbers."));

    if (!isValidProtocolName || !isValidPort) {
        current.setAbortAction(true);
        return false;
    }

    return true;
})(current, previous);
