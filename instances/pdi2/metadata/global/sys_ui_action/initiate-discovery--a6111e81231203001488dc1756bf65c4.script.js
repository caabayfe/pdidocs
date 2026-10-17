triggerDiscoveryForCI();

function triggerDiscoveryForCI() {
	new ChangeRequestDiscovery().triggerBatchDiscovery(current.getUniqueValue(), true);
	action.setRedirectURL(current);
}
