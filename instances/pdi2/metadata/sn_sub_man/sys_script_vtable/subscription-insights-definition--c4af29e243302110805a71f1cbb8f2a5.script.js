(function executeQuery(v_table, v_query) {
    main(unconfirmedFlowIsEnabled());

    function generateOverAllocatedSubsPayload(product, subscriptionSysId) {
        return {
            insight: sn_i18n.Message.getMessage('Subscription Management', 'You consumed more subscriptions than you purchased.'),
            product,
            category: sn_i18n.Message.getMessage('Subscription Management', 'Over-consumed subscriptions'),
            category_english: 'Over-consumed subscriptions',
            count: 1,
            subscription_entitlement: subscriptionSysId,
            sys_id: gs.generateGUID()
        };
    }

    function generateAvailableSubsPayload(product, count, subscriptionSysId) {
        return {
            insight: sn_i18n.Message.getMessage('Subscription Management', 'You have {count} unconsumed subscriptions.', {
                count: count.toString()
            }),
            product,
            category: sn_i18n.Message.getMessage('Subscription Management', 'Available subscriptions'),
            category_english: 'Available subscriptions',
            count,
            subscription_entitlement: subscriptionSysId,
            sys_id: gs.generateGUID()
        };
    }

    function generateUnconfirmedCountPayload(product, userCount, subscriptionSysId) {
        return {
            insight: sn_i18n.Message.getMessage('Subscription Management', '{userCount} user(s) have consumed subscriptions that need to be reviewed.', {
                userCount: userCount.toString()
            }),
            product,
            category: sn_i18n.Message.getMessage('Subscription Management', 'Unconfirmed users'),
            category_english: 'Unconfirmed users',
            count: userCount,
            subscription_entitlement: subscriptionSysId,
            sys_id: gs.generateGUID()
        };
    }

    function unconfirmedFlowIsEnabled() {
        const unconfirmedFlowEnabledProperty = gs.getProperty('sn_sub_man.unconfirmed_user_flow_enabled');
        return !gs.nil(unconfirmedFlowEnabledProperty) && unconfirmedFlowEnabledProperty.toLowerCase() === 'true';
    }

    function getSubscriptionEntitlementRecordsByActive() {
        const now = new GlideDate().getValue();

        const perUserType = 0;
        const displayTypeNone = 0;
        const active = 0;

        const gr = new GlideRecord('subscription_entitlement');

        //only check per user subscriptions
        gr.addQuery('subscription_type', perUserType);

        //only check active subscriptions
        gr.addQuery('status', sn_entitlement.LicensingEngineDBConstants.IN, sn_entitlement.LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);

        // checking only for non-expired subscriptions
        gr.addQuery('start_date', '<=', now).addOrCondition('start_date', 'NULL');
        gr.addQuery('display_type', displayTypeNone);

        gr.query();

        const rows = [];
        while (gr.next()) {
            rows.push({
                product: gr.getValue('name'),
                purchased: gr.getValue('purchased_count'),
                sys_id: gr.getUniqueValue(),
                isMeterTypeCreator: String(gr.getValue("meter_type")).toLowerCase() === "creator",
            });
        }
        return rows;
    }

    function getSubscriptionDetailRecordsByActive(includeUnconfirmedData) {
        const subscriptionUsageUtils = new sn_entitlement.SubscriptionUsageUtils();

        const gr = new GlideRecord('subscription_detail');
        gr.addQuery('is_latest', 'true');
        gr.query();

        const rows = [];
        while (gr.next()) {
            rows.push({
                subscription: String(gr.subscription),
                allocated_count: subscriptionUsageUtils.calculateStringAllocation(gr),
                unconfirmed_user_realtime_count: includeUnconfirmedData ? subscriptionUsageUtils.calculateRealTimeUnconfirmedUsers(gr) : null,
            });
        }
        return rows;
    }

    function main(unconfirmedFlowEnabled) {
        const groupAllocationService = new GroupAllocationService();
        const isUserAllocationDisplayEnabled = groupAllocationService.isUserAllocationDisplayEnabled();
        if (!isUserAllocationDisplayEnabled) return;

        const unconfirmedCountSubsPayloads = [];
        const overAllocatedSubsPayloads = [];
        const availableSubsPayloads = [];

        const subscriptionEntitlementRecords = getSubscriptionEntitlementRecordsByActive();
        const subscriptionDetailRecords = getSubscriptionDetailRecordsByActive(unconfirmedFlowEnabled);

        subscriptionEntitlementRecords.forEach(subscriptionEntitlementRecord => {
            const subscriptionDetailRecord = subscriptionDetailRecords.find(record => record.subscription === subscriptionEntitlementRecord.sys_id);
            if (subscriptionDetailRecord) {
                // always insights should be of this order
                // 1. Unconfirmed users Category
                // 2. Over-Allocated Category
                // 3. Available Category

                if (unconfirmedFlowEnabled) {
                    const unconfirmedUserCount = subscriptionDetailRecord.unconfirmed_user_realtime_count;
                    const isUnconfirmedUserCountValid = !gs.nil(unconfirmedUserCount) && unconfirmedUserCount > 0;
                    if (isUnconfirmedUserCountValid) {
                        // insert only when unconfirmed_flow_enabled is true and there is a valid unconfirmed user count
                        unconfirmedCountSubsPayloads.push(generateUnconfirmedCountPayload(subscriptionEntitlementRecord.product, unconfirmedUserCount, subscriptionEntitlementRecord.sys_id));
                    }
                }

                if (!subscriptionEntitlementRecord.isMeterTypeCreator) { // Creator is account level subscription, therefore, not counting available subscriptions at instance level
                    const count = subscriptionEntitlementRecord.purchased - subscriptionDetailRecord.allocated_count;
                    if (count < 0) {
                        overAllocatedSubsPayloads.push(generateOverAllocatedSubsPayload(subscriptionEntitlementRecord.product, subscriptionEntitlementRecord.sys_id));
                    } else if (count > 0) {
                        availableSubsPayloads.push(generateAvailableSubsPayload(subscriptionEntitlementRecord.product, count, subscriptionEntitlementRecord.sys_id));
                    }
                }
            }
        });

        const finalPayload = unconfirmedCountSubsPayloads.concat(overAllocatedSubsPayloads, availableSubsPayloads);
        finalPayload.forEach(row => v_table.addRow(row));
    }
})(v_table, v_query);
