(function executeRule(current, previous) {
    try {
		var CLONE_CAPABILITY = '';
		var capGR = new GlideRecord('sn_mif_capability');
		if (capGR.get('name', 'MIF Clone Capbility')) {
			CLONE_CAPABILITY = capGR.getUniqueValue();
		} else {
			gs.error('Trust Sync BR: MIF Clone capability not found — aborting.');
			return;
		}

        var SETUP_TIMEOUT = gs.getProperty('sn_instance_clone.setup.timeout.mif');
        var now = new Date().getTime();

        // -------------------------------------------------------------------
        // PASS 1: Handle in-flight records (setting-up trust / removing trust)
        // -------------------------------------------------------------------
        var cloneGR = new GlideRecord('sn_instance_clone_mif_enabled_instance');
        var qc = cloneGR.addQuery('trust_status', 'setting-up trust');
        qc.addOrCondition('trust_status', 'removing trust');
        cloneGR.query();

        while (cloneGR.next()) {
            var trustorId = cloneGR.getValue('trustor_instance_id');
            var updatedTime = new GlideDateTime(cloneGR.getValue('sys_updated_on')).getNumericValue();

            var trustingExists = false;
            var trustCheck = new GlideRecord('sn_mif_instance_trusting_me');
            trustCheck.addQuery('instance', trustorId);
			trustCheck.addQuery('capability', CLONE_CAPABILITY);
            trustCheck.query();
            if (trustCheck.next()) {
                trustingExists = true;
            }

            if (cloneGR.getValue('trust_status') === 'setting-up trust') {
                if (trustingExists) {
                    cloneGR.setValue('trust_status', 'success');
                    cloneGR.setValue('trust_failure_reason', '');
                    cloneGR.setWorkflow(false);
                    cloneGR.autoSysFields(false);
                    cloneGR.update();
                } else {
                    var ageMs = now - updatedTime;
                    if (ageMs > SETUP_TIMEOUT) {
                        cloneGR.setValue('trust_status', 'set-up failed');
                        cloneGR.setValue('trust_failure_reason', 'MIF sync issue, please contact MIF support.');
                        cloneGR.setWorkflow(false);
                        cloneGR.autoSysFields(false);
                        cloneGR.update();
                    }
                }
            } else if (cloneGR.getValue('trust_status') === 'removing trust') {
                if (!trustingExists) {
                    cloneGR.deleteRecord();
                } else {
                    var ageMs2 = now - updatedTime;
                    if (ageMs2 > SETUP_TIMEOUT) {
                        cloneGR.setValue('trust_status', 'remove failed');
                        cloneGR.setValue('trust_failure_reason', 'MIF sync issue, please contact MIF support.');
                        cloneGR.setWorkflow(false);
                        cloneGR.autoSysFields(false);
                        cloneGR.update();
                    }
                }
            }
        }

        // -------------------------------------------------------------------
        // PASS 2: Reconciliation — catch trusting_me records that exist in MIF
        // but have no corresponding entry in sn_instance_clone_mif_enabled_instance
        // (e.g. trust was set up manually on the trustor instance, bypassing our UI),
        // OR records stuck in a terminal failure state where trust is now live.
        // NOTE: Skip in-flight records (setting-up trust, removing trust) — Pass 1 owns those.
        // -------------------------------------------------------------------
        var trustingMeGR = new GlideRecord('sn_mif_instance_trusting_me');
		trustingMeGR.addQuery('capability', CLONE_CAPABILITY);
        trustingMeGR.query();

        while (trustingMeGR.next()) {
            var instanceId = trustingMeGR.getValue('instance');

            var existingCheck = new GlideRecord('sn_instance_clone_mif_enabled_instance');
            existingCheck.addQuery('trustor_instance_id', instanceId);
            existingCheck.query();

            if (!existingCheck.next()) {
                // No record exists — trust was established outside our UI, insert a reconciled record
                var newRecord = new GlideRecord('sn_instance_clone_mif_enabled_instance');
                newRecord.setValue('trustor_instance_id', instanceId);
                newRecord.setValue('trustor_instance_name', trustingMeGR.getDisplayValue('instance'));
                newRecord.setValue('trust_status', 'success');
                newRecord.setValue('trust_failure_reason', '');
                newRecord.setValue('source', 'external');
                newRecord.setWorkflow(false);
                newRecord.autoSysFields(false);
                newRecord.insert();
                gs.info('MIF Trust Reconciliation: inserted out-of-band trust record for trustor ' + instanceId);

            } else {
                var currentStatus = existingCheck.getValue('trust_status');

                // Skip in-flight records — Pass 1 is responsible for these
                if (currentStatus === 'setting-up trust' || currentStatus === 'removing trust' || currentStatus === 'requested remove') {
                    continue;
                }

                // Only reconcile forward if stuck in a terminal failure state
                if (currentStatus === 'set-up failed' || currentStatus === 'remove failed' || currentStatus === 'failed') {
                    gs.info('MIF Trust Reconciliation: updating failed record to success for trustor ' + instanceId);
                    existingCheck.setValue('trust_status', 'success');
                    existingCheck.setValue('trust_failure_reason', '');
                    existingCheck.setWorkflow(false);
                    existingCheck.autoSysFields(false);
                    existingCheck.update();
                }
                // If already 'success', nothing to do
            }
        }

        // -------------------------------------------------------------------
        // PASS 3: Reverse reconciliation — catch stale success records where
        // the trusting_me record no longer exists (e.g. manually removed on trustor)
        // -------------------------------------------------------------------
        var staleGR = new GlideRecord('sn_instance_clone_mif_enabled_instance');
        staleGR.addQuery('trust_status', 'success');
        staleGR.query();

        while (staleGR.next()) {
            var staleTrustorId = staleGR.getValue('trustor_instance_id');

            var reverseCheck = new GlideRecord('sn_mif_instance_trusting_me');
            reverseCheck.addQuery('instance', staleTrustorId);
			reverseCheck.addQuery('capability', CLONE_CAPABILITY);
            reverseCheck.query();

            if (!reverseCheck.next()) {
                // Trust no longer exists in MIF but our record says success — clean it up
                gs.info('MIF Trust Reconciliation: removing stale trust record for trustor ' + staleTrustorId);
                staleGR.deleteRecord();
            }
        }

    } catch (e) {
        gs.error("Error in Trust Sync Business Rule: " + e);
    }

})(current, previous);
