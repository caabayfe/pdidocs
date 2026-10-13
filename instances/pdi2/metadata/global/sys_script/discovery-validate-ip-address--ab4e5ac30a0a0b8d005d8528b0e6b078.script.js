var pat = /^[a-zA-Z0-9][a-zA-Z0-9\-]*?[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9\-]*?[a-zA-Z0-9])*$/;

// if we've got a valid ip address, normalize it...
if (SncIPAddress.isValid(current.ip_address)){
	current.ip_address = SncIPAddress.canonicalize(current.ip_address);
}
else if (pat.test(current.ip_address)) {
    // else if we have a legitimate host name, leave it as the user entered it...
    // nothing to do...
} else {
    // otherwise, we've got an error...
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("The value '{0}' is neither a valid IP address nor a valid host name", current.ip_address));
    gs.addErrorMessage(gs.getMessage('Examples of valid IP addresses include: 10.23.54.2, 235.1.1.35, 25.255.255.250, 56F34AB0 <i>hex address form</i>, 2600::,2600:1fc1::100'));
    gs.addErrorMessage(gs.getMessage('Examples of valid Hostnames include: www.cnn.com, app2.my-org.com, big-fish.2240-main-st.fishmonger.com'));

}
