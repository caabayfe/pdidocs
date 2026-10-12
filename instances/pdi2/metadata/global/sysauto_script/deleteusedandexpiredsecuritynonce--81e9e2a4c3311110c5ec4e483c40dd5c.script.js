function cleanSecurityNonce() {
    try {
        gs.info("Scheduled Job for cleaning security_nonce started");
        var gr = GlideRecord('security_nonce');

        if (!gr.isValid()) {
            gs.error("Table security_nonce doesnot exists.");
            returrn;
        }

        var or1 = gr.addQuery('context', 'TimeLimitedAuthentication');
        or1.addOrCondition('context','MultifactorAuth');
        var or2 = gr.addQuery('expiry', "<", new GlideDateTime());
        or2.addOrCondition('is_used', true);
        gr.query();

        if (gr.next()) {
            gr.deleteMultiple();
        } 
		
		gs.info("Scheduled Job for cleaning security_nonce end");
    } catch (e) {
        gs.error("Error in scheduled job " + e);
    }
}

cleanSecurityNonce();
