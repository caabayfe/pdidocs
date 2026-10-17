var IPKIService = Class.create()
IPKIService.prototype = {

    initialize: function () {
    },

    /**
     * Checks whether the IPKI service is ready by validating the intermediate KMF certificate exists.
     *
     * @returns {boolean} True if the intermediate KMF certificate is present, false otherwise.
     */
    isServiceReady: function() {
        try {
            var kmfCertUtil = new KMFCertificateUtility();
            var intermediateCertGr = kmfCertUtil.getLatestBySubjectName('InstancePKI-Issuing-CA');
            return !!intermediateCertGr;
        } catch (e) {
            gs.error('IPKIService.isServiceReady: Exception checking service readiness: ' + e.message);
            return false;
        }
    },

    /**
     * Starts a MID server iPKI migration by creating a pre_flight migration record.
     * The after-insert business rule on sn_mid_infra_ipki_migration drives probe
     * issuance asynchronously; this method only records intent.
     * @param {string} midSysId - sys_id of the ecc_agent record for the target MID server.
     * @returns {{ success: boolean, detail: string }} success=true with the new migration
     *          record sys_id in detail when the record is created; success=false with the
     *          error in detail when record creation fails.
     */
    migrate: function(midSysId) {
        return new MidIPKIUtility().migrate(midSysId);
    },

    /**
     * Issues the MigrateToIPKI probe for an existing migration record. Invoked by the
     * sn_mid_infra_ipki_migration after-insert business rule via the probe service.
     * @param {string} midSysId - sys_id of the ecc_agent record for the target MID server.
     * @returns {string} Outbound ecc_queue sys_id on success.
     * @throws {Error} When the MID is not validated, the agent is unavailable, user
     *                cannot be resolved, key generation fails, or encryption fails.
     */
    createMigrateProbe: function(midSysId) {
        return new MidIPKIUtility().createMigrateProbe(midSysId);
    },

    /**
     * Forces immediate iPKI certificate rotation for a specific MID server.
     * @param {string} midSysId - sys_id of the ecc_agent record for the target MID server.
     * @returns {{ success: boolean, detail: string }}
     */
    forceRotate: function(midSysId) {
        return new MidIPKIUtility().forceRotate(midSysId);
    },

    /**
     * Gets the most recent active certificate mapping record for a given MID server.
     * @param {string} agentSysId - The sys_id of the MID server (ecc_agent).
     * @returns {GlideRecord|null} The active certificate mapping GlideRecord, or null if not found.
     * @throws {InvalidValueError} If agentSysId is not a valid string.
     */
    getActiveRecordByAgent: function(midSysID) {
        return new IPKICertMapManager().getActiveRecordByAgent(midSysID);
    },

    /**
     * Returns the sys_ids of every MID server that currently has an active iPKI certificate mapping.
     * Use this when you need to bulk-classify many MIDs by iPKI status; avoids per-MID queries.
     * @returns {string[]} Unique agent sys_ids in 'active' state. Empty array when none.
     */
    getActiveAgentSysIds: function() {
        return new IPKICertMapManager().getActiveAgentSysIds();
    },

    /**
     * Checks if at least one MID on the instance currently has an active iPKI
     * certificate mapping. Intended as an instance-wide gate (e.g. for deciding
     * whether to enable bulk iPKI migration on the dashboard).
     *
     * @returns {boolean} True if any mapping in sn_mid_infra_cert_map has
     *     state == 'active'; false otherwise.
     */
    hasActiveIpkiMid: function() {
        return new IPKICertMapManager().hasActiveIpkiMid();
    },

    type: 'IPKIService',
}
