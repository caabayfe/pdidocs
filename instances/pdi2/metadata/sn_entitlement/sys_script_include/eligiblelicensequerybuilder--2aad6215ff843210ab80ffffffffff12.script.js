var EligibleLicenseQueryBuilder = Class.create();
EligibleLicenseQueryBuilder.prototype = {
    initialize: function() {
        this.SYS_ID_IS_EMPTY = 'sys_idISEMPTY';
    },

    /**
     * Constructs a complete encoded query string for all custom application subscriptions
     * that are eligible to be mapped.
     *
     * Purpose: Provide a single, reliable query that filters out subscriptions which
     * should not be selectable for custom apps, based on the system's entitlement model
     * and business rules.
     *
     * How it works:
     * 1. Determines if the system should route to the EMS entitlement model.
     * 2. If EMS:
     *    - Builds a query using primary subscriptions only (active ± expired if enabled).
     * 3. If non-EMS (legacy):
     *    - Builds a simpler query excluding expired subscriptions.
     * 4. Always excludes "store app" licenses.
     * 5. Always excludes grandfathered licenses.
     * 6. Combines all conditions into a single encoded query string.
     *
     * Returns: {String} Encoded ServiceNow query string or SYS_ID_IS_EMPTY if no subscriptions found.
     */
    getEligibleCustomAppSubscriptionsQuery: function() {
        var canRouteToEMS = this._canRouteToEMS();
        var queryParts = [];

        // Step 1: Build the base of the query based on the entitlement model.
        if (canRouteToEMS) {
            var subscriptionQuery = this.getPrimarySubscriptionsForMappingCustomTables();
            if (subscriptionQuery === this.SYS_ID_IS_EMPTY) {
                return this.SYS_ID_IS_EMPTY; // Abort if no primary subscriptions are found.
            }
            // Always exclude store apps
            queryParts.push(
                LicensingEngineDBConstants.CATEGORY + '!=' +
                LicensingEngineDBConstants.CATEGORY_VALUE.STORE_APPLICATION
            );
            queryParts.push(subscriptionQuery);
        } else {
            // Always exclude store apps
            queryParts.push(
                LicensingEngineDBConstants.CATEGORY + '!=' +
                LicensingEngineDBConstants.CATEGORY_VALUE.STORE_APPLICATION
            ); // Always exclude store apps.
            queryParts.push('expired!=true');
        }

        // Step 2: Append the filter to exclude all grandfathered licenses.
        var gfLicSysIds = this._getGrandFatherLicenseSysIds();
        if (gfLicSysIds.length > 0) {
            queryParts.push(LicensingEngineDBConstants.SYS_ID +
                LicensingEngineDBConstants.NOT_IN + gfLicSysIds.join(LicensingEngineDBConstants.COMMA));
        }

        // Step 3: Join all parts of the query with the '^' (AND) operator and return.
        return queryParts.join(LicensingEngineDBConstants.AND);
    },

    /**
     * @description Internal helper method. Checks system properties to determine if the logic should route to EMS.
     *
     * @purpose To act as a switch that directs the script to use the correct data model and logic
     * (either the modern EMS model or the legacy one).
     *
     * @how-it-works
     * 1. Reads the `glide.entitlement.surf.routing` system property.
     * 2. Reads the `glide.entitlement.ems.data.available` system property.
     * 3. Returns `true` only if SURF routing is 'false' AND EMS data is 'true'.
     *
     * @returns {boolean} - True if the system should route to EMS, false otherwise.
     */
    _canRouteToEMS: function() {
        var canRouteToEMS = new SubscriptionEntitlementsService().canRouteToEMS();
        return canRouteToEMS;
    },

    // Returns sys_ids of licenses marked as grandfather
    _getGrandFatherLicenseSysIds: function() {
        var licSysIds = [];
        var ctiReferenceField = this._getCTISubscriptionReference();

        var licCustTblAllotmentGr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        licCustTblAllotmentGr.addQuery(LicensingEngineDBConstants.ALLOTMENT_TYPE, LicensingEngineDBConstants.ALLOTMENT_TYPE_GRANDFATHER);
        licCustTblAllotmentGr.addNotNullQuery(ctiReferenceField);
        licCustTblAllotmentGr.query();

        while (licCustTblAllotmentGr.next()) {
            licSysIds.push(licCustTblAllotmentGr.getValue(ctiReferenceField));
        }
        return licSysIds;
    },

    /**
     * Builds a query string for primary subscriptions eligible for custom-table mapping.
     *
     * Purpose: Identify subscriptions that can be mapped .
     * Only active subscriptions are included, unless the system allows mapping expired subscriptions.
     *
     * Returns a ServiceNow encoded query string that:
     * - Filters by entitlement type = primary subscription
     * - Filters by status (active ± expired)
     * - Filters by sys_id of collected subscriptions
     *
     * If no eligible subscriptions are found, returns SYS_ID_IS_EMPTY.
     */
    getPrimarySubscriptionsForMappingCustomTables: function() {
        var primarySubscriptionSysIds = [];
        var licCustTblAllotmentGR = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        licCustTblAllotmentGR.addNotNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);

        // Determine which entitlement statuses to allow:If expired-entitlement mapping is enabled → allow both ACTIVE & EXPIRED,Otherwise → allow only ACTIVE
        var status = this._IsExpiredEntitlementMappingEnabled() ?
            LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK.join(LicensingEngineDBConstants.COMMA) :
            LicensingEngineDBConstants.ENTITLEMENT_STATUS.ACTIVE;

        licCustTblAllotmentGR.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT + '.status', LicensingEngineDBConstants.IN, status);
        licCustTblAllotmentGR.query();

        while (licCustTblAllotmentGR.next()) {
            primarySubscriptionSysIds.push(licCustTblAllotmentGR.getValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT));
        }

        if (primarySubscriptionSysIds.length > 0) {
            var query = [];
            // Build query: primary subscriptions only, matching status and sys_ids
            query.push(LicensingEngineDBConstants.ENTITLEMENT_TYPE + '=' +
                LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.PRIMARY_SUBSCRIPTION);
            query.push(LicensingEngineDBConstants.STATUS +
                LicensingEngineDBConstants.IN + status);
            query.push(LicensingEngineDBConstants.SYS_ID +
                LicensingEngineDBConstants.IN + primarySubscriptionSysIds.join(LicensingEngineDBConstants.COMMA));
            return query.join(LicensingEngineDBConstants.AND);
        }
        return this.SYS_ID_IS_EMPTY;
    },

    /**
     * @description Internal helper method. Dynamically determines the correct database field to use for linking.
     *
     * @purpose To select the correct database column (`license` or `SUBSCRIPTION_ENTITLEMENT`)
     * based on the system's entitlement model. This makes the `_getGrandFatherLicenseSysIds` function
     * adaptable to different data structures.
     *
     * @how-it-works
     * 1. It calls `_canRouteToEMS()` to check the current model.
     * 2. If `true`, it returns the modern `LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT` name.
     * 3. If `false`, it returns the legacy `LICENSE_FIELD` name.
     *
     * @returns {String} The name of the reference field to use.
     */
    _getCTISubscriptionReference: function() {
        if (this._canRouteToEMS()) {
            return LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT;
        }
        return LicensingEngineDBConstants.LICENSE;
    },

    // Returns true if expired-entitlement mapping(CTI & Custom APP) feature is enabled
    _IsExpiredEntitlementMappingEnabled: function() {
        return gs.getProperty(
            LicensingEngineConstants.PROP_GLIDE_EXPIRED_ENTITLEMENT_MAPPING_ENABLED,
            'false' // default as string
        ).toLowerCase() === 'true';

    },


    type: 'EligibleLicenseQueryBuilder'
};
