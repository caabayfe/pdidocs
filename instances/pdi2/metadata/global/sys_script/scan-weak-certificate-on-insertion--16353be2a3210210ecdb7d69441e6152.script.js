(function() {
	try {
		var result = new sn_kmf_ns.KMFUnsafeCertificateScanner().scanCert(current);
		if (result) {
			gs.addErrorMessage(gs.getMessage("This certificate is flagged for not meeting ServiceNow’s security standards; however, it is still permitted for use at this time. Please consider addressing the following reason(s): - {0}", result));
		}
	} catch (e) {
		gs.addErrorMessage(gs.getMessage("Certificate scan unsuccessful due to the following reason(s) - {0}", e));
	}
})();
