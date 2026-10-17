(function() {
    if (gs.getProperty("com.snc.kmf.signature.validation.flag") == "true") {
        gs.error("CodeSigning customer only RoT transfer FAILURE: The job should not be run on the protected instance. Please follow the documented process to activate the Code Signing product");
        return false;
    }
    return true;
})();
