var SubscriptionApplicationFamilyDao = Class.create();
SubscriptionApplicationFamilyDao.prototype = {
    initialize: function() {
        this._grHelper = new sn_entitlement.LicensingEngineGlideRecordHelper();
        // params are unique on each call, no need for PassThroughCache
        this._usersDao = new sn_entitlement.SubscriptionApplicationUsersDao();
    },

    getData: function(subscription, licenseFamily) {
        // EE is disabled by default, therefore, as a short-term optimization, skip caclculating user-counts if EE is disabled.
        const calcUsers = gs.getProperty("sn_sub_man.ee_cpe_data_display_user_and_roles") == "true";

        const includeNonInstallableRowsProperty = gs.getProperty('sn_entitlement.ee_cpe_data_include_non_installable', false).toLowerCase() === 'true';

        const gr = new GlideRecord("subscription_has_family");
        addQueryUsingParameters(gr, subscription, licenseFamily);

        // since these have a custom reference key, the ReferenceOptimizer is unable to preLoad these.
        // adding this avoids a lookup query by sys_id for each row.
        this._grHelper.addExtraField(gr, "subscription_family.sys_id");
        this._grHelper.addExtraField(gr, "subscription.sys_id");
        gr.query();

        const rows = [];
        const subToLicFamIdMap = new Map();
        const ZERO = Number(0).toLocaleString();
        while (gr.next()) {
            // default capacity of a remote table is 1000. Setting a limit so that `rows` list below does not consume too much memory
            // If more than 1000 rows are desired, enable "Enhanced Capacity" in the Advanced tab and introduce batching.
            if (rows.length >= 1000)
                continue;

            const row = {
                sys_id: gr.subscription_family.sys_id, // reference key is 'family_id', therefore, add dot-walk for sys_id
                subscription: gr.subscription.sys_id.toString(), // reference key is 'entitlement_id', therefore, add dot-walk for sys_id
                subscription_family: gr.subscription_family.sys_id.toString(),
                entitled_role_types: gr.entitled_role_types.getDisplayValue(),
                unrestricted_role_types: gr.unrestricted_role_types.getDisplayValue(),
                installation_status: getInstallationStatus(gr.installable),
                user_count: ZERO,
                active_users: ZERO
            };

            if (includeNonInstallableRowsProperty || gr.installable) {
                let licFamIds = subToLicFamIdMap.get(row.subscription);
                if (!licFamIds)
                    licFamIds = [];

                licFamIds.push(row.subscription_family);
                subToLicFamIdMap.set(row.subscription, licFamIds);

                rows.push(row);
            }
        }

        if (!calcUsers)
            return rows;

        const subToLicFamIdToUserCounts = new Map();
        subToLicFamIdMap.forEach((licFamIds, subId) => {
            subToLicFamIdToUserCounts.set(subId, this._usersDao.getUsersCountForSubscriptionAndFamilies(subId, licFamIds));
        });

        rows.forEach(row => {
            const aMap = subToLicFamIdToUserCounts.get(row.subscription);
            if (!aMap)
                return;
            const userCount = aMap.get(row.subscription_family);
            if (!userCount)
                return;
            row.user_count = Number(userCount).toLocaleString();
            row.active_users = Number(userCount).toLocaleString();
        });

        return rows;

        function getInstallationStatus(status) {
            return (status.toString() === 'true') ? 'Installable' : 'Not installable';
        }

        function addQueryUsingParameters(gr, subscription, licenseFamily) {
            if (!gs.nil(subscription)) {
                gr.addQuery("subscription.sys_id", subscription);
                gr.addQuery("display_type", "!=", LicensingEngineDBConstants.FAMILY_DISPLAY_TYPE.HIDE);
                if (!gs.nil(licenseFamily))
                    gr.addQuery("subscription_family.sys_id", licenseFamily);
            }
        }
    },

    type: 'SubscriptionApplicationFamilyDao'
};
