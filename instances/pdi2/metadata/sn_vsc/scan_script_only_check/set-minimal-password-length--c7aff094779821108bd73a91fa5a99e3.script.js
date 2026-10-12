(function(finding) {
    // Check what password system is actually being used
    var gr = new GlideRecord('pwd_cred_store');
    gr.query();

    // For every password store
    while (gr.next()) {

        // Finding if password policy is not enabled per password store
        // Defaults to installation exit (minimum length 8)
        if (gr.enable_password_policy != true) {
            finding.setCurrentSource(gr);
            finding.increment();
        } else {
            var passwordLength = gr.password_policy.minimun_password_length;//mandatory field

            // Finding if password policy is not enforcing a minimum password length
            if (passwordLength < 12) {
                finding.setCurrentSource(gr);
                finding.increment();
            }
        }
    }
})(finding);
