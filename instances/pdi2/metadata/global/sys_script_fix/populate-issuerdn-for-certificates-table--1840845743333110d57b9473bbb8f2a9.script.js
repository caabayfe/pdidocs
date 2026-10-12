(function() {
    if (GlidePluginManager.isZboot())
        return; //skip for zboot
    var JOB = "Populate issuer DN in Certificates table";
    var JOB_EXECUTION_TIME = new GlideDateTime();
    var SCRIPT = "SNC.KMFFixes.populateIssuerDistinguishedNameInCertificatesTable();";
    GlideRunScriptJob.scheduleScript(SCRIPT, JOB, JOB_EXECUTION_TIME);
    gs.info("Successfully scheduled a new job to populate the issuer_distinguished_name field on Certificates table");
})();
