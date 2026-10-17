(function() {

    // Perform some prechecks on the instance before regeneration. 
    // 1. Check if it is an on-prem instance. If yes, skip the regeneration. 
    var onPremInstance = gs.getProperty('glide.installation.self_hosted');
    if (onPremInstance == 'true') {
        gs.info('Regeneration of asym keys: It is an on-prem instance. Hence skipping regeneration asym keys');
        return;
    }

    // 2. Check if it EJBCA enabled instance, If yes skip the re-generation since we will not generate the EJBCA keys locally.
    var ejbcaEnabled = gs.getProperty('com.glide.kmf.ejbca.enabled');
    if (ejbcaEnabled == 'true') {
        gs.info('Regeneration of asym keys: EJBCA is enabled, and we cannot generate the EJBCA keys locally, hence skipping the re-generation of asym key');
        return;
    }

    var instanceId = gs.getProperty('instance_id');

    // 3. Process the KMF health, and check if the vault is reachable. If not rechable, skip the re-generation.
    if (!isVaultHealthy(instanceId))
        return;

    //4. Deactivate the asym instance keys
    var success = true;

    gs.info('Regeneration of asym keys: Deactivating the asym keys');
    success = deactivateAsymKeys();
    if (!success) {
        gs.info('Regeneration of asym keys: Failed to deactivate the asym keys');
        return;
    }
    gs.info('Regeneration of asym keys: Successfully deactivated the asym keys');


    //5. Deactivate the public key wrap, public key sigver key pairs
    gs.info('Regeneration of asym keys: Deactivating the key pairs');
    success = deactivateInstanceCertificates(instanceId);
    if (!success) {
        gs.info('Regeneration of asym keys: Failed to deactivate the asym key pairs');
        return;
    }
    gs.info('Regeneration of asym keys: Successfully deactivated the asym key pairs');

    //6. Run ensure all to make sure we have generated the asym keys with right padding
    gs.info('Regeneration of asym keys: Executing ensureAllInstanceInitialKeysExist');
    success = new sn_kmf.KMFInstanceKeyAPI().ensureAllInstanceInitialKeysExist();
    if (!success) {
        gs.info('Regeneration of asym keys: Failed to execute ensureAllInstanceInitialKeysExist, manual intervention is needed');
        return;
    }
    gs.info('Regeneration of asym keys: Successfully executed ensureAllInstanceInitialKeysExist');

    function deactivateAsymKeys() {
        var dbu = new GlideDBUpdate('sys_kmf_instance_key');
        var dbq = new GlideDBQuery('sys_kmf_instance_key');

        try {
            dbq.addQuery('key_type.sibling_key_type', '!=', 'NULL');
            dbq.addQuery('key_alias', 'instancePublicKeyWrap').addOrCondition('key_alias', 'instancePrivateSigVer');
            dbq.addQuery('origin', 'servicenow');
            dbq.addQuery('key_lifecycle_state', 'active');
            dbu.setQuery(dbq);
            dbu.setMultiple(true);
            dbu.setValue('key_lifecycle_state', 'deactivated');
            dbu.setValue('last_rotated_date', new GlideDate());
            dbu.setValue('deactivation_date', new GlideDate());

            dbu.executeAndReturnException();
        } catch (ex) {
            gs.error('Exception while updating the instance key: ' + ex);
            return false;
        } finally {
            dbu.close();
            dbq.close();
        }

        return true;
    }

    function deactivateInstanceCertificates(instanceId) {
        var gr = new GlideRecord('sys_certificate');
        gr.addEncodedQuery('name=' + instanceId + 'publickeywrap^ORname=' + instanceId + 'publicsigver');
        gr.query();

        while (gr.next()) {
            gr.setValue('active', 'false');
            var result = gr.update('deactivating asym key pair using fix script');
            if (!result)
                return false;
        }

        return true;
    }

    function isVaultHealthy(instanceId) {
        var kmfAutomationInterface = new SNC.KMFAutomationInterface();

        var hasProperValidAsymKeys = kmfAutomationInterface.isInstancePublicKeysPresentOnVault(instanceId);
        if (hasProperValidAsymKeys) {
            gs.info('Regeneration of asym keys: Vault keys are healthy, hence skipping the re-generation of asym key');
            return false;
        }
		
		var canCommunicateWithVault = kmfAutomationInterface.canCommunicateWithVault();
        if (!canCommunicateWithVault) {
            gs.info('Regeneration of asym keys: Vault is not reachable, hence skipping the re-generation of asym key');
            return false;
        }

        return true;
    }

})();
