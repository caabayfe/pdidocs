var MIFManagerUtil = Class.create();
MIFManagerUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    type: 'MIFManagerUtil',

    /**
     * Get the current instance's ID.
     * @returns the ID from sys_properties.
     */
    getCurrentInstanceId: function() {
        const instanceId = gs.getProperty("instance_id");
        this.setAnswer(instanceId);
    },

    getInstanceNamesEligibleToBeManaged() {
        const instanceId = gs.getProperty("instance_id");
        const grThisInstance = new GlideRecordSecure('sn_mif_instance');
        grThisInstance.addQuery('instance_id', instanceId);
        grThisInstance.setLimit(1);
        grThisInstance.query();
        if (!grThisInstance.next()) {
            gs.warn(this.type + ": Couldn't query MIF instance table.");
            this.setAnswer([]);
            return;
        }
        var isProd = grThisInstance.getValue("is_prod");
        // Prevent subprod from managing prod.
        const gr_instance = new GlideRecordSecure('sn_mif_instance');
        gr_instance.addQuery('instance_id', '!=', instanceId);
        if (!isProd || isProd == '0')
            gr_instance.addQuery('is_prod', 'false');
        gr_instance.query();
        var prospectiveIds = new Map();
        while (gr_instance.next()) {
            var newName = gr_instance.getValue('instance_name');
            var newId = gr_instance.getValue('instance_id');
            prospectiveIds.set(newId, newName);
        }
        if (prospectiveIds.size == 0) {
            gs.info(this.type + ": Couldn't find any eligible managed instances.");
            this.setAnswer([]);
            return;
        }
        const gr_managed = new GlideRecordSecure('sn_mif_managing_instance');
        gr_managed.addQuery('managed_instance', 'IN', Array.from(prospectiveIds.keys()));
        gr_managed.addQuery('status', 'approved');
        gr_managed.query();
        var eligibleNames = prospectiveIds;
        while (gr_managed.next()) {
            var ineligibleId = gr_managed.getValue('managed_instance');
            eligibleNames.delete(ineligibleId);
        }
        this.setAnswer(Array.from(eligibleNames.values()));
    },

    /**
     * Send a request to become the global manager of instances by instance name.
     * @returns a list of instance names for which global manager status was requested.
     */
    sendGlobalManagerRequestByName() {
        var instanceNames = this.getParameter('sysparm_instance_names');
        if (gs.nil(instanceNames) || instanceNames.length == 0) {
            this.setAnswer([]);
            return;
        }
        const results = [];
        const sender = new sn_mif_core.ManagerChangeSender();
        var names = instanceNames.split(',');
        for (const name of names) {
            if (!gs.nil(name)) {
                gs.debug(this.type + ': Adding global manager relationship for ' + name);
                try {
                    sender.requestGlobalManagement(name);
                    results.push(name);
                } catch (e) {
                    gs.warn(this.type + ": Could not add the following instance as managed globally: [" + name +
                        "] due to an error: " + e);
                }
            }
        }
        gs.info(this.type + ": Global manager requests were sent to: " + results);
        gs.addInfoMessage(gs.getMessage("Managing instance requests successfully sent, pending approvals."));
        this.setAnswer(results);
    }
});
