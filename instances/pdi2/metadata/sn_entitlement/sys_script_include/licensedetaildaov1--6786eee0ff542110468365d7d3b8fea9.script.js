/**
 * Data access functions that return a single or many licenseId (license_details.sys_id)
 *
 */
var LicenseDetailDaoV1 = Class.create();
LicenseDetailDaoV1.prototype = {
    initialize: function() {
        this._logSourceName = `sn_entitlement.${this.type}`;
        this.logger = new LoggingUtil();
    },

    /**
     * Retrieves all of the active licenseIds (license_details.sys_id)
     *
     * @returns {array} An array of license_details.sys_id values
     */
    getLicenseIdsByAllActive: function() {
        const gr = new GlideRecord('license_details');
        this._addUnexpiredLicenceQueryCondition(gr);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(gr.getUniqueValue());
        return Array.from(ids);
    },

    /**
     * Retrieves all of the active licenseDetailIds (license_details.sys_id)
     * That are of type Per-User
     *
     * @returns {array} An array of license_details.sys_id values
     */
    getLicenseIdsByIsPerUser: function() {
        const gr = new GlideRecord('license_details');
        this._addUnexpiredLicenceQueryCondition(gr);
        gr.addQuery('license_type', 0); // Per-User
        gr.query();

        const ids = [];
        while (gr.next())
            ids.push(gr.getUniqueValue());
        return ids;
    },

    /**
     * Retrieves the licenseIds (license_details.sys_id) belonging to a user
     *
     * @param {guid} userId The sys_user.sys_id for the user to retrieve license information for
     * @returns {array} An array of license_details.sys_id values the user is subscribed to
     */
    getLicenseIdsByUserIdAndIsPerUser: function(userId) {
        // Note: suhl_active always seems to be false. So it has not been included in the query filters.
        const gr = new GlideRecord('license_subscribed_users');
        this._addUnexpiredLicenceQueryCondition(gr, 'gts_license');
        gr.addQuery('grm_user.sys_id', userId); // sys_user_has_role.sys_id
        gr.addQuery('gts_license.license_type', 0); // per-user
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(String(gr.gts_license.sys_id));
        return Array.from(ids);
    },

    /**
     * Retrieves the license_details.sys_id belonging to the group
     *
     * @param {guid} groupId The sys_user_group.sys_id for the group to retrieve license information for
     * @returns {array} An array of license_details.sys_id values the group is subscribed to
     */
    getLicenseIdsByGroupIdAndIsPerUser: function(groupId) {
        const gr = new GlideRecord('license_group_has_subscription');
        gr.addQuery('group.sys_id', groupId);
        this._addUnexpiredLicenceQueryCondition(gr, 'license');
        gr.addQuery('license.license_type', 0); // per-user
        gr.query();

        const ids = [];
        while (gr.next())
            ids.push(String(gr.license.sys_id));
        return ids;
    },

    /**
     * Retrieves all of the active subscription ids that have a subscription type 
     * of unrestricted user.
     *
     * @returns {array} An array of subscription IDs
     */
    getLicenseIdsByActiveAndIsUnrestrictedUser: function() {
        const gr = new GlideRecord('license_details');
        this._addUnexpiredLicenceQueryCondition(gr);
        // Note: The quota_defn_id is hard-coded to this value for UU
        gr.addQuery('quota_defn_id', 'DEF1000204');
        gr.query();

        const ids = [];
        while (gr.next())
            ids.push(gr.getUniqueValue());
        return ids;
    },

    /**
     * Retrieves the licenseIds (license_details.sys_id) belonging all active modules
     *
     * @returns {array} An array of license_details.sys_id values
     */
    getLicenseIdsByIsModule: function() {
        try {
            const gr = new GlideRecord('license_details');

            if (!gr.isValidField('meter_type')) {
                gs.warn(`getLicenseIdsByIsModule failed. meter_type is not present.`);
                return [];
            }

            this._addUnexpiredLicenceQueryCondition(gr);
            gr.addQuery('meter_type', 'STARTSWITH', 'Module');
            gr.query();

            const ids = [];
            while (gr.next())
                ids.push(gr.getUniqueValue());
            return ids;
        } catch (err) {
            gs.warn(`getLicenseIdsByIsModule failed.`, err);
            return [];
        }
    },

    /**
     * Return information about all active subscriptions
     * @return {array} an array of SubscriptionEntitlementData
     */
    getLicenseDetailsByAllActive: function() {
        const gr = new GlideRecord('license_details');
        this._addUnexpiredLicenceQueryCondition(gr);
        gr.query();
        return this._collectRecords(gr);
    },

    /**
     * Return information about active subscriptions which contain specified app bundles
     * @param {array} appBundles names of app bundles
     * @return {array} an array of subscriptions where object is of the form
     * {
     *   sys_id: "unique identifier of a subscription"
     *   name: "name of subscription"
     *   start_date: "date when subscription became active"
     *   end_date: "date when subscription will expire"
     *   purchased: "purchased quantity or NA"
     *   allocated: "allocated quantity or NA"
     * }
     */
    getLicenseDetailsByContainsAppBundles: function(appBundles) {
        const gr = new GlideRecord('license_itom_ci_su_ratio');
        this._addUnexpiredLicenceQueryCondition(gr, 'license');
        gr.addQuery('app_bundle', appBundles);
        gr.query();
        return this._distinct(this._collectRecords(gr, 'license'));
    },

    /**
     * Return information about id of ALL app bundles
     * @return {array} an array of ids of ALL app bundles 
     */
    getAppBundles: function() {
        const gr = new GlideRecord('license_itom_ci_su_ratio');
        this._addUnexpiredLicenceQueryCondition(gr, 'license');
        gr.query();

        var result = {};
        while (gr.next()) {
            let app_bundle = gr.getValue("app_bundle");
            result[app_bundle] = '1';
        }
        return Object.keys(result);
    },

    /**
     * Return information about active subscription ratio records which contain specified app bundles
     * @param {array} appBundles names of app bundles
     * @return {array} an array of subscriptions where object is of the form
     * {
     *   sys_id: "unique identifier of a subscription ratio record"
     *   app_bundle: "id of application bundle"
     *   ci_per_su: "value of subscription ratio"
     * }
     */
    getSubscriptionRatiosByContainsAppBundles: function(appBundles, entitlementSysId) {
        const gr = new GlideRecord('license_itom_ci_su_ratio');
        gr.addQuery('license', entitlementSysId);
        gr.addQuery('app_bundle', appBundles);
        gr.query();

        var valueObjectArray = [];
        while (gr.next()) {
            const valueObject = {
                "ci_type": gr.getValue("ci_type"),
                "ci_name": gr.getValue("ci_name"),
                "ci_per_su": gr.getValue("ci_per_su"),
                "app_bundle": gr.getValue("app_bundle"),
            };
            valueObjectArray.push(valueObject);
        }
        return valueObjectArray;
    },
    /**
     * Retrieves quota id from a license_details entry
     *
     * @param {guid} sysId The license_details.sys_id to retrieve license information for
     * @returns {string} An array of license_details.sys_id values the user is subscribed to
     */
    getQuotaId: function(sysId) {
        const gr = new GlideRecord('license_details');
        gr.get(sysId);

        if (!gr.isValid()) {
            gs.warn(`${this._logSourceName}.getQuotaId failed. Unable to locate license_details entry : ${sysId}`);
            return "";
        }
        return gr.getValue("quota_defn_id");
    },

    /**
     * Adds query conditions for the license_details record to filter out
     * licenses that are not active
     *
     * @param {GlideRecord} gr The GlideRecord object to add the conditions to
     * @param {string} prefix Optional value to prefix the column names by (e.g. for dot walking)
     * @returns {array} An array of license_details.sys_id values the group is subscribed to
     */
    _addUnexpiredLicenceQueryCondition: function(gr, prefix = '') {
        prefix = prefix && prefix.length > 0 ?
            prefix + '.' :
            '';

        const now = new GlideDate().getValue();

        gr.addQuery(`${prefix}expired`, false);
        gr.addQuery(`${prefix}start_date`, '<=', now);
        gr.addQuery(`${prefix}end_date`, '>=', now);
    },

    _collectRecords: function(gr, columnName) {
        var result = [];
        while (gr.next()) {
            const record = columnName ? gr[columnName].getRefRecord() : gr;
            result.push(this._mapToObject(record));
        }
        return result;
    },

    _mapToObject: function(record) {
        return SubscriptionEntitlementData.fromRecord(
            record.getUniqueValue(),
            record.name.toString(),
            record.start_date.toString(),
            record.end_date.toString(),
            record.count.toString(),
            record.allocated.toString()
        );
    },

    _distinct: function(licenseDetails) {
        const map = new Map();
        licenseDetails.forEach(obj => map.set(obj.id, obj));
        return Array.from(map.values());
    },

    /**
     * Retrieves TablesUsed from a license_details entry
     *
     * @param {guid} sysId The license_details.sys_id to retrieve license information for
     * @returns {number} Tables used count for license_details.sys_id
     */
    getTablesUsed: function(sysId) {
        const gr = new GlideRecord('license_details');
        //added isEntitlementLoggingEnabled check as there has been observed exessive logs for this in the event of customer instance downgrade from SMV2 to SMV1
        if (this.logger.isEntitlementLoggingEnabled() && !gr.get(sysId)) {
            gs.warn(`${this._logSourceName}.getTablesUsed failed. Unable to locate license_details entry : ${sysId}`);
            return "";
        }
        const count = parseInt(gr.getValue("tables_used"));
        return !Number.isInteger(count) ? 0 : Number(count);
    },

    /**
     * Return information about all active subscriptions for ITOM team to identify legacy itom licenses.
     * @return {array} an array of Subscription data
     */
    getLicenseDetailsITOM: function() {
        const licenseDetailsObjList = [];
        const gr = new GlideRecord('license_details');
        this._addUnexpiredLicenceQueryCondition(gr);
        gr.query();
        while (gr.next()) {
            const licenseDetailsObj = {
                'license': gr.getValue('name'),
                'product_code': gr.getValue('product_code'),
                'purchased_count': gr.getValue('count'),
                'details_url': "license_details?sys_id=" + gr.sys_id

            };
            licenseDetailsObjList.push(licenseDetailsObj);
        }
        return licenseDetailsObjList;
    },

    type: 'LicenseDetailDaoV1'
};
