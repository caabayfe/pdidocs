(function executeRule(current, previous /*null when async*/) {

	var oid = current.oid;
    var res = new sn_kmf_ns.KMFInstancePKI().validateOID(oid);
    if (res == false) {
        gs.addErrorMessage(gs.getMessage("Invalid OID format"));
        current.setAbortAction(true);
        return;
    }

})(current, previous);
