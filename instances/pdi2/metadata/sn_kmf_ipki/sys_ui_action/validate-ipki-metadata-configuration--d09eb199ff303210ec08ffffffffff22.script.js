try {
    var res1 = new sn_kmf_ns.KMFInstancePKI().validateEndpoint(current.alias);
    gs.addInfoMessage(gs.getMessage("Endpoint resolved successfully"));
    action.setRedirectURL(current);
} catch (e) {
    gs.addErrorMessage(gs.getMessage("Error while getting endpoint: {0}", e.message));
    action.setRedirectURL(current);
}
