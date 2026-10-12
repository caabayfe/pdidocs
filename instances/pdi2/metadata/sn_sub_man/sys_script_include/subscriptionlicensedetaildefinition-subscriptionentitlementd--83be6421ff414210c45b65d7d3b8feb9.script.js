var SubscriptionLicenseDetailDefinition_SubscriptionEntitlementDao = Class.create();
SubscriptionLicenseDetailDefinition_SubscriptionEntitlementDao.prototype = {
    initialize: function() {},

    getSubscriptionEntitlementRecords: function() {
        const gr = new GlideRecord('subscription_entitlement');
        gr.query();

        const records = [];
        while (gr.next()) {
            records.push({
                sys_id: gr.getValue('sys_id'),
                entitlement_id: gr.getValue('entitlement_id'),
                parent_entitlement_id: gr.getValue('parent_entitlement_id'),
                meter_type: gr.getValue('meter_type'),
                name: gr.getValue('name'),
                entitlement_type: parseInt(gr.getValue('entitlement_type')),
                purchased_count: Number(gr.getValue('purchased_count')) || 0,
            });
        }
        return records;
    },

    getSubscriptionIdsByCustomTableAllotment: function() {
        const gr = new GlideRecord('license_cust_table_allotment');
        gr.addNotNullQuery('subscription_entitlement');
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(gr.getValue('subscription_entitlement'));
        return [...ids];
    },

    type: 'SubscriptionLicenseDetailDefinition_SubscriptionEntitlementDao'
};
