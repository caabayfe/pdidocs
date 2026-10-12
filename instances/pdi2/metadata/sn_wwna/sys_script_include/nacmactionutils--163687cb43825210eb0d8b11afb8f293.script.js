var NacmActionUtils = Class.create();
NacmActionUtils.prototype = {
    initialize: function() {
        this.logger = new sn_wwna.WWNALogger();
    },

    /**
     * API to add an INACTIVE NAcm action in the wwna_quick_actions table.
     */
    addNAcmAction: function(name, commandName, capabilityID) {
        commandName = commandName ? String(commandName).replaceAll(' ', '') : String(name).replaceAll(' ', '');
        let skillAttributes = sn_one_extend.OneExtendUtil.getCapabilityAttributes(capabilityID);
		const skillConfigId = new sn_wwna.NAAWWNAUtils().getSkillConfigIdFromCapabilityId(capabilityID);
        const script = sn_wwna.WWNAConstants.getQuickActionScript(capabilityID, skillConfigId);
        let gr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);

        gr.initialize();
        gr.setValue('active', false);
        gr.setValue('name', name);
        gr.setValue('command_name', commandName);
        gr.setValue('script', script);
        gr.setValue('table_name', "sys_one_extend_capability");
        gr.setValue('action_type', "common");
        gr.setValue('skill', capabilityID);
        const recordSysID = gr.insert();

        return recordSysID;
    },

    /**
     * Retrieves WWNA Quick Action record IDs, grouped by capability and active status.
     *
     * @function
     * @param {string|string[]} capabilityIDs - A list of skill (capability) IDs. Can be an array of IDs or a single comma-separated string.
     * @param {boolean} [active] - Optional. If specified (true/false), filters records based on the 'active' field.
     *
     * @returns {Object} An object where each key is a capability ID, and each value is an object with:
     *                   - "activeRecords": Array of sys_ids for active quick actions.
     *                   - "inactiveRecords": Array of sys_ids for inactive quick actions.
     *
     * @example
     * getWWNAQuickActions(["cap1", "cap2"], true);
     * // Possible return:
     * {
     *   "cap1": {
     *     "activeRecords": ["sys_id1", "sys_id2"]
     *   },
     *   "cap2": {
     *     "activeRecords": ["sys_id3"]
     *   }
     * }
     *
     * getWWNAQuickActions("cap1,cap2");
     * // Possible return:
     * {
     *   "cap1": {
     *     "activeRecords": ["sys_id1"],
     *     "inactiveRecords": ["sys_id2"]
     *   },
     *   "cap2": {
     *     "activeRecords": ["sys_id3"]
     *   }
     * }
     *
     * @description
     * Queries the WWNA Quick Actions table based on the given capability IDs.
     * Returns a grouped structure of sys_ids for each capability, further divided into "activeRecords" and "inactiveRecords".
     */
    getWWNAQuickActions: function(capabilityIDs, active) {
        if (!capabilityIDs) return {};

        if (Array.isArray(capabilityIDs)) {
            capabilityIDs = capabilityIDs.join(',');
        }

        let gr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);
        let result = {};

        gr.addQuery('skill', 'IN', capabilityIDs);
        if (typeof active !== 'undefined') {
            gr.addQuery('active', active);
        }

        gr.query();

        while (gr.next()) {
            let capability = gr.getValue('skill');
            let actionStatus = gr.getValue('active') === 'true' ? 'activeRecords' : 'inactiveRecords';
            let actionId = gr.getUniqueValue();

            if (!result[capability]) {
                result[capability] = {};
            }

            if (!result[capability][actionStatus]) {
                result[capability][actionStatus] = [];
            }

            result[capability][actionStatus].push(actionId);
        }

        return result;
    },

    /**
     * API to fetch all the NAcm actions linked to a skill (capability). Ideally one NAcm action can be linked to many actions and the internal script can have customizations.
     */
    getNAcmActions: function(capabilityID, active) {
        let gr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);
        let results = [];
        gr.addQuery('skill', capabilityID);
        if (active)
            gr.addQuery('active', active);
        gr.query();

        while (gr.next()) {
            results.push({
                sys_id: gr.getUniqueValue()
            });
        }

        return results;
    },

    /**
     * API to update the name of the action once a skill name is updated. Ideally one NAcm action can be linked to many actions and the internal script can have customizations.
     */
    updateNAcmAction: function(capabilityID, params = {}) {
        let gr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);
        gr.addQuery('skill', capabilityID);
        if (params.hasOwnProperty('name'))
            gr.setValue('name', params['name']);
        if (params.hasOwnProperty('active'))
            gr.setValue('active', params['active']);

        return gr.updateMultiple();
    },

    /**
     * API to delete a NAcm action linked to a specific skill (capability).
     */
    deleteNAcmAction: function(capabilityID) {
        if (!capabilityID) {
            return false;
        }

        let gr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);
        gr.addQuery('skill', capabilityID);
        gr.query();

        let deletedRecords = 0;
        while (gr.next()) {
            if (gr.deleteRecord()) {
                deletedRecords++;
            }
        }

        return deletedRecords > 0;
    },

    type: 'NacmActionUtils'
};
