var AgentService = Class.create();
AgentService.prototype = {
    initialize: function() {
        this.agentUtility = new AgentUtility();
    },

    /**
     * Retrieves an agent record by its sys_id.
     *
     * @param {string} sysId - The sys_id of the ecc_agent record.
     * @returns {GlideRecord|null} The GlideRecord object if found, otherwise null.
     */
    getAgentRecord: function(sysId) {
        return this.agentUtility.getAgentRecord(sysId);
    },

    /**
     * Returns the build stamp applicable for a given MID server sys_id.
     * Buildstamp resolution precedence:
     * 1. Platform upgrade guard (returns failed)
     * 2. MID-specific pinned version (ecc_agent_config, then ecc_agent_property)
     * 3. Global pinned version (ecc_agent_property with ecc_agent NULL)
     * 4. Default buildstamp (mid.buildstamp overridden by mid.version.override)
     *
     * @param {string|null|undefined} midSysId - The sys_id of the ecc_agent record, or null/undefined for a new MID.
     * @returns {{ result: string, error: string, buildstamp: string }}
     *   result: 'success' or 'failed'
     *   error: error message string if result is 'failed', otherwise empty string
     *   buildstamp: resolved build stamp string, or empty string if not found
     */
    getMidBuildstamp: function(midSysId) {
        return this.agentUtility.getMidBuildstamp(midSysId);
    },

    type: 'AgentService'
};
