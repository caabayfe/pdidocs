(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var DEFAULT_EXPIRY_DAYS = 365;
        // Canonical proof payload, must match com.snc.midserver...ECCSigningKeyManager#createCanonicalPayload
        var PROOF_SEPARATOR = '|';

        var body = request.body !== undefined ? request.body.data : null;
        if (body === null || body === undefined) {
            response.setStatus(400);
            response.setBody({result: 'error', error: 'Missing request body'});
            return;
        }

        var agentSysId = body.agent_id;
        var publicKey  = body.public_key;
        var proof      = body.proof;

        // Validate required fields
        if (agentSysId === undefined || agentSysId === null || publicKey === undefined || publicKey === null) {
            response.setStatus(400);
            response.setBody({result: 'error', error: 'Missing required fields: agent_id, public_key'});
            return;
        }

        // Validate agentId
        if (!(/^[0-9a-f]{32}$/i.test(agentSysId))) {
            response.setStatus(400);
            response.setBody({result: 'error', error: 'Incorrect format for required field: agent_id'});
            return;
        }

        // Validate that the agent exists
        var agent = new GlideRecord('ecc_agent');
        if (!agent.get('sys_id', agentSysId)) {
            response.setStatus(404);
            response.setBody({result: 'error', error: 'Agent not found: ' + agentSysId});
            return;
        }

        var validatedRaw = agent.getValue('validated');
        var isValidated = (validatedRaw == '1' || validatedRaw == 'true');

        // Look for an existing active key for this agent
        var existingKey = isValidated ? findActiveKey(agentSysId) : null;

        if (existingKey) {
            rotateKey(existingKey, agentSysId, publicKey, proof, response);
        } else {
            registerNewKey(agentSysId, publicKey, proof, isValidated, response);
        }
    } catch (e) {
        gs.error('[MID ECC Signing API] Error: ' + e.message);
        response.setStatus(500);
        response.setBody({error: 'Internal server error'});
    }

    /**
     * Find the most recent active key for the given agent.
     * Returns the GlideRecord if found, null otherwise.
     */
    function findActiveKey(agentId) {
        var gr = new GlideRecord('ecc_agent_signing_key');
        gr.addQuery('agent', agentId);
        gr.addQuery('state', 'active');
        gr.orderByDesc('sys_created_on');
        gr.setLimit(1);
        gr.query();
        
		if (!gr.next()) {
			return null;
		}

		return gr;
    }

    function rotateKey(oldKeyGr, agentId, newPublicKey, rotationProof, resp) {
        if (rotationProof === undefined || rotationProof === null) {
            resp.setStatus(400);
            resp.setBody({result: 'error', error: 'Rotation requires a proof signed by the current key'});
            return;
        }

        // Verify ECDSA rotation proof against the agent's currently-active signing key.
        var canonicalPayload = agentId + PROOF_SEPARATOR + newPublicKey;
        if (!SNC.ECCSigningValidationHelper.validateECDSAKeyECC(agentId, canonicalPayload, rotationProof)) {
            gs.warn('[MID ECC Signing API] Rotation proof verification failed for agent {0}', agentId);
            resp.setStatus(401);
            resp.setBody({result: 'error', error: 'Rotation proof verification failed'});
            return;
        }

        // Suspend the old key
        oldKeyGr.setValue('state', 'suspended');
        oldKeyGr.setValue('state_changed_at', new GlideDateTime());
        if (!oldKeyGr.update()) {
            gs.error("Could not update old state for MID sys_id={0}", agentId);
        }

        // Create the new key as active
        var newState = 'active';
        createSigningKeyRecord(agentId, newPublicKey, newState, rotationProof, resp);
    }

    // Register a new signing key (no existing active key).
    function registerNewKey(agentId, newPublicKey, bootstrapProof, validated, resp) {
        // Also suspend any lingering pre_activation keys for this agent
        suspendExistingKeys(agentId);

        var newState;
        if (validated && bootstrapProof !== undefined && bootstrapProof !== null) {
            // MID is validated and provided a proof signed with its RSA validation key.
            // Verify against the agent's RSA public_key on ecc_agent.
            var canonicalPayload = agentId + PROOF_SEPARATOR + newPublicKey;
            if (!SNC.ECCSigningValidationHelper.validateDefaultSignatureKey(agentId, canonicalPayload, bootstrapProof)) {
                gs.warn('[MID ECC Signing API] Bootstrap proof verification failed for agent {0}', agentId);
                resp.setStatus(401);
                resp.setBody({result: 'error', error: 'Bootstrap proof verification failed'});
                return;
            }
            newState = 'active';
        } else {
            // MID is not yet validated or did not provide proof
            newState = 'pre_activation';
        }

        createSigningKeyRecord(agentId, newPublicKey, newState, bootstrapProof, resp);
    }

    /**
     * Suspend all existing active/pre_activation keys for the agent.
     * Called during new registration to ensure clean state.
     */
    function suspendExistingKeys(agentId) {
        var gr = new GlideRecord('ecc_agent_signing_key');
        gr.addQuery('agent', agentId);
        gr.addQuery('state', 'IN', 'active,pre_activation');

		gr.setValue('state', 'suspended');
		gr.setValue('state_changed_at', new GlideDateTime());
		gr.updateMultiple();
    }

	// Create a new ecc_agent_signing_key record and send the success response.
    function createSigningKeyRecord(agentId, base64PublicKey, state, proofValue, resp) {
        var expiryDays = getExpiryDays();

        var expiresOn = new GlideDateTime();
        expiresOn.addDaysLocalTime(expiryDays);

        var gr = new GlideRecord('ecc_agent_signing_key');
        gr.initialize();
        gr.setValue('agent', agentId);
        gr.setValue('public_key', base64PublicKey);
        gr.setValue('state', state);
        gr.setValue('state_changed_at', new GlideDateTime());
        gr.setValue('expires_on', expiresOn);

        if (proofValue !== undefined) {
            gr.setValue('proof', proofValue);
        }

        var newId = gr.insert();
        if (newId === null || newId === undefined) {
            resp.setStatus(500);
            resp.setBody({result: 'error', error: 'Failed to create signing key record'});
            return;
        }

        gs.info('ECC signing key registered for agent {0}: state={1}, sys_id={2}',
                agentId, state, newId);

        resp.setStatus(201);
        resp.setBody({result: 'success'});
    }

    /**
     * Read the configurable key expiry duration from system properties.
     * Falls back to DEFAULT_EXPIRY_DAYS if not set.
     */
    function getExpiryDays() {
        var prop = gs.getProperty('mid.signing_key.expiry.days', undefined);
        if (prop === undefined) {
			return DEFAULT_EXPIRY_DAYS;
		}

		var parsed = parseInt(prop, 10);
		if (isNaN(parsed) || parsed <= 0) {
			return DEFAULT_EXPIRY_DAYS;
		}

		return parsed;
    }

})(request, response);
