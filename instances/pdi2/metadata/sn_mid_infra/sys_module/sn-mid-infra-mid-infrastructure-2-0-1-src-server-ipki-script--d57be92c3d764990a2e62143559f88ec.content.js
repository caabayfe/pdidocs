var MidIPKIUtility = Class.create();
MidIPKIUtility.prototype = {

    COMMAND_ROTATE_IPKI: 'RotateIPKI',
    AGENT_STATUS_UP: 'Up',

    initialize: function() {
        this.TABLE_ECC_AGENT = 'ecc_agent';
        this.TABLE_SYS_USER  = 'sys_user';
        this.MIGRATION_KEY_VALIDITY_MINUTES = parseInt(
            gs.getProperty('sn_mid_infra.migration.key_validity_minutes', '5'), 10
        );
        this.agentUtil = new AgentUtility();
        this.userUtil = new UserUtility();
        this.certMapManager = new IPKICertMapManager();
    },

    // ---------------------------------------------------------------------------
    // migrate
    // ---------------------------------------------------------------------------

    ERROR_CODE_NOT_VALIDATED: 'IPKI_MIGRATION_NOT_VALIDATED',

    MIGRATION_TABLE: 'sn_mid_infra_ipki_migration',

    /**
     * Starts a MID server iPKI migration by creating a migration record in pre_flight
     * state. The after-insert business rule on sn_mid_infra_ipki_migration drives the
     * probe issuance by invoking createMigrateProbe(); migrate() itself only records intent.
     *
     * @param {string} midSysId - sys_id of the ecc_agent record for the target MID server.
     * @returns {{ success: boolean, detail: string }} success=true with the new migration
     *          record sys_id in detail when the record is created; success=false with the
     *          error in detail when record creation fails.
     */
    migrate: function(midSysId) {
        try {
            var migrationGr = new GlideRecord(this.MIGRATION_TABLE);
            migrationGr.initialize();
            migrationGr.setValue('mid_server', midSysId);
            migrationGr.setValue('status', 'pre_flight');
            var migrationSysId = migrationGr.insert();
            if (!migrationSysId) {
                return { success: false, detail: 'Failed to create migration record for MID: ' + midSysId };
            }
            return { success: true, detail: migrationSysId };
        } catch (e) {
            gs.error('MidIPKIUtility.migrate(): failed to create migration record for MID ' +
                     midSysId + ': ' + e.message, 'MidIPKIUtility');
            return { success: false, detail: e.message };
        }
    },

    /**
     * Issues the MigrateToIPKI SystemCommand for an already-created migration record.
     * Invoked by the sn_mid_infra_ipki_migration after-insert business rule (via the
     * probe service) — never creates a migration record itself, so it cannot re-trigger
     * the insert business rule. Every failure path also marks the migration record failed.
     *
     * The stable ERROR_CODE_NOT_VALIDATED prefix lets callers map the error to messaging.
     *
     * @param {string} midSysId - sys_id of the ecc_agent record for the target MID server.
     * @returns {string} Outbound ecc_queue sys_id on success.
     * @throws {Error} When the MID is not validated, the agent is unavailable, user
     *                cannot be resolved, key generation fails, or encryption fails.
     */
    createMigrateProbe: function(midSysId) {
        try {
            var validation = this.agentUtil.isValidated(midSysId);
            if (!validation.valid) {
                var notValidatedMsg = this.ERROR_CODE_NOT_VALIDATED + ': MID ' + midSysId +
                                      ' is not validated for migration. Reason: ' + validation.reason;
                gs.error(notValidatedMsg, 'MidIPKIUtility');
                throw new Error(notValidatedMsg);
            }

            var agentInfo = this._getAgentInfo(midSysId);

            var userGr;
            try {
                userGr = this.userUtil.getByUserName(agentInfo.userName);
            } catch (e) {
                throw new Error('MID Server user not found: ' + agentInfo.userName);
            }
            if (!userGr) {
                throw new Error('MID Server user not found: ' + agentInfo.userName);
            }
            var userSysId = userGr.getValue('sys_id');

            var registrationKey = this._generateRegistrationKey(userSysId, this.MIGRATION_KEY_VALIDITY_MINUTES);

            // eslint-disable-next-line no-unsupported-node-builtins
            var encryptedXml = new global.PayloadEncrypter().encryptPayload(
                midSysId,
                registrationKey,
                userSysId
            );

            if (!encryptedXml) {
                throw new Error('MidIPKIUtility.createMigrateProbe(): encryption failed for MID ' + midSysId);
            }

            // eslint-disable-next-line no-unsupported-node-builtins
            return new global.MidSystemCommandUtil().issueSecureSystemCommand(agentInfo.midName, 'MigrateToIPKI', encryptedXml);
        } catch (e) {
            this._failMigration(midSysId, e.message);
            throw e;
        }
    },

    /**
     * Marks the migration record for the given MID as failed with the supplied reason.
     * Delegates to IpkiMigrationManager.applyTransition, which targets the latest
     * non-terminal record, enforces the state machine, and truncates details. Safe no-op
     * when no migration record exists for the MID.
     *
     * @param {string} midSysId - sys_id of the ecc_agent record for the target MID server.
     * @param {string} message - failure reason recorded on the migration record details.
     */
    _failMigration: function(midSysId, message) {
        new IpkiMigrationManager().applyTransition(midSysId, 'failed', message);
    },

    /**
     * @param {string} midSysId
     * @returns {{ midName: string, userName: string }}
     */
    _getAgentInfo: function(midSysId) {
        var agentGr = new GlideRecord(this.TABLE_ECC_AGENT);
        agentGr.addQuery('sys_id', midSysId);
        agentGr.setLimit(1);
        agentGr.query();
        if (!agentGr.next()) {
            throw new Error('MidIPKIUtility._getAgentInfo(): no ecc_agent found for sys_id=' + midSysId);
        }

        if (agentGr.getValue('status') !== 'Up') {
            throw new Error('MidIPKIUtility._getAgentInfo(): MID server is not up, sys_id=' + midSysId);
        }

        return {
            midName  : agentGr.getValue('name'),
            userName : agentGr.getValue('user_name')
        };
    },


    /**
     * @param {string} assignedToUserSysId
     * @param {number} validityInMinutes
     * @returns {string}
     */
    _generateRegistrationKey: function(assignedToUserSysId, validityInMinutes) {
        var manager = new sn_mid_infra.RegistrationKeyManager();
        var validityConfig = manager.getValidityConfig();

        if (validityInMinutes < validityConfig.minMinutes || validityInMinutes > validityConfig.maxMinutes) {
            var msg = 'MidIPKIUtility._generateRegistrationKey(): validityInMinutes=' + validityInMinutes +
                      ' is outside the allowed range. Set between ' +
                      validityConfig.minMinutes + ' and ' + validityConfig.maxMinutes + ' minutes.';
            gs.error(msg, 'MidIPKIUtility');
            throw new Error(msg);
        }

        var result = manager.createKey(assignedToUserSysId, validityInMinutes);
        if (!result || !result.key) {
            throw new Error('MidIPKIUtility._generateRegistrationKey(): failed to generate registration key');
        }
        gs.info('MidIPKIUtility._generateRegistrationKey(): key=' + manager.maskRegistrationKey(result.key), 'MidIPKIUtility');
        return result.key;
    },

    // ---------------------------------------------------------------------------
    // forceRotate
    // ---------------------------------------------------------------------------

    /**
     * Forces immediate iPKI certificate rotation for a specific MID server.
     * Requires PR #87: expectRegistration() will gate on iPKI being live and
     * create the PROCESSING entry before the RotateIPKI command is issued.
     *
     * @param {string} midSysId - The sys_id of the target MID server (ecc_agent).
     * @returns {{ success: boolean, detail: string }}
     */
    forceRotate: function(midSysId) {
        var agentGr = this.agentUtil.getAgentRecord(midSysId);
        if (!agentGr) {
            return { success: false, detail: 'MID Server not found: ' + midSysId };
        }

        var midName = agentGr.getValue('name');

        // Ensure the MID is reachable before issuing a command.
        if (agentGr.getValue('status') !== this.AGENT_STATUS_UP) {
            return { success: false, detail: 'MID Server is not active: ' + midSysId };
        }

        var activeRecord = this.certMapManager.getActiveRecordByAgent(midSysId);
        if (!activeRecord) {
            return { success: false, detail: 'No active iPKI mapping found for MID: ' + midSysId };
        }

        var userSysId = activeRecord.getValue('user');
        if (!userSysId) {
            return { success: false, detail: 'No user associated with iPKI mapping for MID: ' + midSysId };
        }

        // It validates iPKI is live on this MID and creates an idempotent PROCESSING
        // entry so the incoming rotation request is recognised as expected.
        try {
            this.certMapManager.expectRegistration(midSysId, userSysId);
        } catch (e) {
            return { success: false, detail: 'Failed to create expect registration entry: ' + e.message };
        }

        try {
            // eslint-disable-next-line no-unsupported-node-builtins
            new global.MidSystemCommandUtil().issueSystemCommand(midName, this.COMMAND_ROTATE_IPKI, []);
        } catch (e) {
            return { success: false, detail: 'Failed to send rotation command: ' + e.message };
        }

        return { success: true, detail: 'Force rotation initiated for MID: ' + midName };
    },

    type: 'MidIPKIUtility'
};
