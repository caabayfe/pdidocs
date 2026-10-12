var AgentUtility = Class.create();
AgentUtility.prototype = {
    initialize: function() {
        // Tables
        this.TABLE_NAME = 'ecc_agent';
        this.TABLE_ECC_AGENT_CONFIG = 'ecc_agent_config';
        this.TABLE_ECC_AGENT_PROPERTY = 'ecc_agent_property';

        // Fields
        this.FIELD_SYS_ID = 'sys_id';
        this.FIELD_ECC_AGENT = 'ecc_agent';
        this.FIELD_PARAM_NAME = 'param_name';
        this.FIELD_NAME = 'name';
        this.FIELD_VALUE = 'value';

        // Properties
        this.PROPERTY_GLIDE_WAR = 'glide.war';
        this.PROPERTY_GLIDE_WAR_ASSIGNED = 'glide.war.assigned';
        this.PROPERTY_GLIDE_WAR_NO_UPGRADE = 'glide.war.no_upgrade';
        this.PROPERTY_MID_BUILDSTAMP = 'mid.buildstamp';
        this.PROPERTY_MID_VERSION_OVERRIDE = 'mid.version.override';

        // Constants
        this.MID_PINNED_VERSION_KEY = 'mid.pinned.version';
        this.RESULT_SUCCESS = 'success';
        this.RESULT_FAILED = 'failed';
        this.ERROR_PLATFORM_UPGRADE_IN_PROGRESS = 'Platform upgrade is currently in progress.';

        // STRY63822367: shared criterion with STRY63822356 (migration dashboard UI).
        this.FIELD_VALIDATED = 'validated';
        this.REASON_NOT_VALIDATED = 'MID Server has not been validated for migration';
        this.REASON_AGENT_NOT_FOUND = 'MID Server record not found';

        this.validationUtil = undefined;
    },

    /**
     * Retrieves an agent record by its sys_id.
     * @param {string} sysId - The sys_id of the ecc_agent record.
     * @returns {GlideRecord|null} The GlideRecord object if found, otherwise null.
     */
    getAgentRecord: function(sysId) {
        this._getValidationUtil().validateNonEmptyString(sysId, 'sysId', true);
        var agentGr = new GlideRecord(this.TABLE_NAME);
        agentGr.addQuery(this.FIELD_SYS_ID, sysId)
        agentGr.query();
        if (agentGr.next()) {
            return agentGr;
        }
        return null;
    },

    /**
     * Retrieves an agent record by its short name or full ECC-qualified name (mid.server.<name>).
     * @param {string} name - The agent name (with or without 'mid.server.' prefix).
     * @returns {GlideRecord|null} The GlideRecord object if found, otherwise null.
     */
    getAgentRecordByName: function(name) {
        var shortName = ('' + name).replace(/^mid\.server\./, '');
        var agentGr = new GlideRecord(this.TABLE_NAME);
        agentGr.addQuery(this.FIELD_NAME, shortName);
        agentGr.setLimit(1);
        agentGr.query();
        return agentGr.next() ? agentGr : null;
    },

    /**
     * Gets a parameter value for a given agent and param name.
     * Checks ecc_agent_config first, then ecc_agent_property.
     * @param {string} agentSysId - The sys_id of the MID server.
     * @param {string} paramName - The param_name to look up.
     * @returns {string|null} The value field, or null if not found in either table.
     */
    getAgentConfigValue: function(agentSysId, paramName) {
        var configGr = new GlideRecord(this.TABLE_ECC_AGENT_CONFIG);
        configGr.addQuery(this.FIELD_ECC_AGENT, agentSysId);
        configGr.addQuery(this.FIELD_PARAM_NAME, paramName);
        configGr.setLimit(1);
        configGr.query();

        if (configGr.next())
            return configGr.getValue(this.FIELD_VALUE);

        var propGr = new GlideRecord(this.TABLE_ECC_AGENT_PROPERTY);
        propGr.addQuery(this.FIELD_ECC_AGENT, agentSysId);
        propGr.addQuery(this.FIELD_NAME, paramName);
        propGr.setLimit(1);
        propGr.query();

        if (propGr.next())
            return propGr.getValue(this.FIELD_VALUE);

        return null;
    },

    /**
     * Returns the build stamp applicable for a given MID server sys_id.
     * If a platform upgrade is in progress, returns a failed result.
     * Buildstamp resolution precedence:
     * 1. Platform upgrade guard (returns failed)
     * 2. If MID sys_id present: check MID-specific pinned version first
     *    (ecc_agent_config, then ecc_agent_property) — return immediately if found
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
        try {
            if (this._isPlatformUpgradeInProgress())
                return { result: this.RESULT_FAILED, error: this.ERROR_PLATFORM_UPGRADE_IN_PROGRESS, buildstamp: '' };

            var normalizedMidSysId = gs.nil(midSysId) ? '' : String(midSysId).trim();
            if (normalizedMidSysId) {
                var pinnedVersion = this._getPinnedMidVersion(normalizedMidSysId);
                if (pinnedVersion.found)
                    return { result: this.RESULT_SUCCESS, error: '', buildstamp: pinnedVersion.value };
            }

            var buildstamp = '';
            var globalPinnedVersion = this._getGlobalPinnedMidVersion();
            if (globalPinnedVersion.found)
                buildstamp = globalPinnedVersion.value;
            else
                buildstamp = this._getDefaultBuildstamp();

            return { result: this.RESULT_SUCCESS, error: '', buildstamp: buildstamp || '' };
        } catch (e) {
            return { result: this.RESULT_FAILED, error: e && e.message ? e.message : String(e), buildstamp: '' };
        }
    },

    /**
     * Returns the default buildstamp by reading mid.buildstamp, then applying
     * mid.version.override if it is set.
     *
     * @returns {string} The default buildstamp string.
     */
    _getDefaultBuildstamp: function() {
        var buildstamp = gs.getProperty(this.PROPERTY_MID_BUILDSTAMP);
        if (buildstamp == null)
            buildstamp = '';

        var versionOverride = gs.getProperty(this.PROPERTY_MID_VERSION_OVERRIDE);
        if (versionOverride)
            buildstamp = versionOverride;

        return buildstamp;
    },

    /**
     * Checks whether a platform upgrade is currently in progress.
     * A rollback scenario (glide.war.no_upgrade == glide.war.assigned) is explicitly
     * excluded from being treated as an upgrade in progress (PRB1344057).
     *
     * @returns {boolean} True if a platform upgrade is in progress, false otherwise.
     */
    _isPlatformUpgradeInProgress: function() {
        var glideWar = gs.getProperty(this.PROPERTY_GLIDE_WAR);
        var glideAssignedWar = gs.getProperty(this.PROPERTY_GLIDE_WAR_ASSIGNED);
        var glideWarNoUpgrade = gs.getProperty(this.PROPERTY_GLIDE_WAR_NO_UPGRADE);

        var isRollBack = !gs.nil(glideWarNoUpgrade) && (glideWarNoUpgrade == glideAssignedWar);
        return !gs.nil(glideWar) && !gs.nil(glideAssignedWar) && glideWar != glideAssignedWar && !isRollBack;
    },

    /**
     * Looks up the pinned MID version for the given MID sys_id using MID-specific sources:
     *   1. ecc_agent_config where param_name = 'mid.pinned.version' for the MID
     *   2. ecc_agent_property where name = 'mid.pinned.version' for the MID
     *
     * @param {string} midSysId - The sys_id of the ecc_agent record.
     * @returns {{ found: boolean, value: string }}
     *   found: true if a pinned version was found, false otherwise
     *   value: the pinned version string if found, otherwise empty string
     */
    _getPinnedMidVersion: function(midSysId) {
        var configGr = new GlideRecord(this.TABLE_ECC_AGENT_CONFIG);
        configGr.addQuery(this.FIELD_ECC_AGENT, midSysId);
        configGr.addQuery(this.FIELD_PARAM_NAME, this.MID_PINNED_VERSION_KEY);
        configGr.addNotNullQuery(this.FIELD_VALUE);
        configGr.setLimit(1);
        configGr.query();
        if (configGr.next())
            return { found: true, value: configGr.getValue(this.FIELD_VALUE) };

        var propGr = new GlideRecord(this.TABLE_ECC_AGENT_PROPERTY);
        propGr.addQuery(this.FIELD_ECC_AGENT, midSysId);
        propGr.addQuery(this.FIELD_NAME, this.MID_PINNED_VERSION_KEY);
        propGr.addNotNullQuery(this.FIELD_VALUE);
        propGr.setLimit(1);
        propGr.query();
        if (propGr.next())
            return { found: true, value: propGr.getValue(this.FIELD_VALUE) };

        return { found: false, value: '' };
    },

    _getGlobalPinnedMidVersion: function() {
        var propGr = new GlideRecord(this.TABLE_ECC_AGENT_PROPERTY);
        propGr.addQuery(this.FIELD_NAME, this.MID_PINNED_VERSION_KEY);
        propGr.addNullQuery(this.FIELD_ECC_AGENT);
        propGr.addNotNullQuery(this.FIELD_VALUE);
        propGr.setLimit(1);
        propGr.query();
        if (propGr.next())
            return { found: true, value: propGr.getValue(this.FIELD_VALUE) };

        return { found: false, value: '' };
    },

    /**
     * STRY63822367: Single source of truth for whether a MID server is approved for
     * iPKI migration. Paired with STRY63822356 (dashboard UI) — both call this so the
     * UI gate and the server-side guard cannot diverge.
     *
     * @param {string} midSysId - The sys_id of the ecc_agent record.
     * @returns {{ valid: boolean, reason: string }}
     */
    isValidated: function(midSysId) {
        this._getValidationUtil().validateNonEmptyString(midSysId, 'midSysId', true);

        var agentGr = this.getAgentRecord(midSysId);
        if (!agentGr) {
            return { valid: false, reason: this.REASON_AGENT_NOT_FOUND };
        }

        var flag = agentGr.getValue(this.FIELD_VALIDATED);
        if (flag === 'true' || flag === true) {
            return { valid: true, reason: '' };
        }
        return { valid: false, reason: this.REASON_NOT_VALIDATED };
    },

    _getValidationUtil: function() {
        if (this.validationUtil === undefined) {
            this.validationUtil = new ValidationUtility();
        }
        return this.validationUtil;
    },

    type: 'AgentUtility'
};
