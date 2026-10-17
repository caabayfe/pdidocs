const AppAndCustomTableRecommenderScraper = Class.create();
(function() {
    const _grHelper = new sn_entitlement.LicensingEngineGlideRecordHelper();
    const licenseCustTableAllotmentDAO = new LicenseCustTableAllotmentDAO();

    function createLicenseFinder() {
        const primaryEntitlementToSubscriptionNameMap = new sn_entitlement.LicenseCustTableAllotmentDAO().getEntitlementToSubscriptionNamesMap();

        const lineageIdToSubscriptionNamesCache = {};

        function getSubscriptionNamesByLineageId(lineageId) {
            if (lineageIdToSubscriptionNamesCache.hasOwnProperty(lineageId)) {
                return lineageIdToSubscriptionNamesCache[lineageId];
            }
            const subscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);

            const jq = subscriptionGR.addJoinQuery(
                LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY,
                LicensingEngineDBConstants.ENTITLEMENT_ID,
                LicensingEngineDBConstants.SUBSCRIPTION
            );

            const applicationEntitlementQuery = `${LicensingEngineDBConstants.SUBSCRIPTION_FAMILY}.${LicensingEngineDBConstants.FAMILY_ID}`;

            jq.addCondition(applicationEntitlementQuery, lineageId);
            subscriptionGR.query();

            if (!subscriptionGR.next()) {
                lineageIdToSubscriptionNamesCache[lineageId] = null;
                return null;
            }

            // If we find a subscription that is not entitlement_type Primary Subscription with a value of '0', we will use the primaryEntitlementToSubscriptionNameMap to find the name of it's
            // parent subscription_entitlement.
            let entitlementType = subscriptionGR.getValue(LicensingEngineDBConstants.ENTITLEMENT_TYPE);
            let licenseCode = null;

            if (entitlementType !== '0') {
                let parentEntitlementId = subscriptionGR.getValue(LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID);
                licenseCode = primaryEntitlementToSubscriptionNameMap[parentEntitlementId];
                lineageIdToSubscriptionNamesCache[lineageId] = licenseCode;
            } else {
                licenseCode = subscriptionGR.getValue(LicensingEngineDBConstants.NAME);
                lineageIdToSubscriptionNamesCache[lineageId] = licenseCode;
            }

            return licenseCode;
        }

        const packageIdToSubscriptionNamesCache = {};

        function getSubscriptionNamesByPackageId(packageId) {
            if (packageIdToSubscriptionNamesCache.hasOwnProperty(packageId)) {
                return packageIdToSubscriptionNamesCache[packageId];
            }

            const results = [];
            let packageIdCom = "com." + packageId;
            let packageIdComSnc = "com.snc." + packageId;
            const uaAppFamilyGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_FAMILY);
            uaAppFamilyGR
                .addQuery(LicensingEngineDBConstants.APP_ID, packageId)
                .addOrCondition(LicensingEngineDBConstants.APP_ID, packageIdCom)
                .addOrCondition(LicensingEngineDBConstants.APP_ID, packageIdComSnc);
            uaAppFamilyGR.query();
            while (uaAppFamilyGR.next()) {
                let lineageId = uaAppFamilyGR.getValue(LicensingEngineDBConstants.LINEAGE_ID);
                let licenseCode = getSubscriptionNamesByLineageId(lineageId);
                if (licenseCode !== null) {
                    results.push(licenseCode);
                }
            }
            packageIdToSubscriptionNamesCache[packageId] = results;
            return results;
        }

        const scopeIdToSubscriptionNamesCache = {};

        function getSubscriptionNamesByScopeId(scopeId) {
            if (scopeIdToSubscriptionNamesCache.hasOwnProperty(scopeId)) {
                return scopeIdToSubscriptionNamesCache[scopeId];
            }

            const results = [];
            const uaAppFamilyGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_FAMILY);
            uaAppFamilyGR.addQuery(LicensingEngineConstants.SCOPE, scopeId);
            uaAppFamilyGR.query();
            while (uaAppFamilyGR.next()) {
                let lineageId = uaAppFamilyGR.getValue(LicensingEngineDBConstants.LINEAGE_ID);
                let licenseCode = getSubscriptionNamesByLineageId(lineageId);
                if (licenseCode !== null) {
                    results.push(licenseCode);
                }
            }
            scopeIdToSubscriptionNamesCache[scopeId] = results;
            return results;
        }

        const tableNameToSubscriptionNamesCache = {};

        /**
         * Given a table name (sys_db_object.name) finds any applicable licenses
         * for this table. Licenses are found by the following logic:
         *
         * 1. Find the package (sys_package) and application (sys_app) the table
         *    is defined in. One or both of these may be undefined.
         * 2. Find any ua_app_family records referencing the package ID
         *    (sys_package.source) or scope ID (sys_scope.scope), taking into
         *    consideration that the package ID may be in many formats.
         * 3. Walk from the ua_app_family records to the license for product
         *    family on this customer instance.
         *
         * Note that some internal and demo instances will not have ua_app_family
         * populated, and most internal instances will not have the license details
         * tables popualated (license_has_family, license_details, etc.)
         *
         * @param {string} tableName
         * @returns {number[]} - License shortcodes that can be translated by inspecting `licenseMap.getMap()`
         */
        function getSubscriptionNamesByTableName(tableName) {
            if (tableNameToSubscriptionNamesCache.hasOwnProperty(tableName)) {
                return tableNameToSubscriptionNamesCache[tableName];
            }

            const sysDbObjectGR = new GlideRecord(LicensingEngineDBConstants.SYS_DB_OBJECT);
            sysDbObjectGR.addQuery(LicensingEngineDBConstants.NAME, tableName);
            sysDbObjectGR.query();
            if (!sysDbObjectGR.hasNext()) {
                return [];
            }

            _grHelper.addExtraField(sysDbObjectGR, `${LicensingEngineDBConstants.SYS_SCOPE}.${LicensingEngineDBConstants.SCOPE}`);
            _grHelper.addExtraField(sysDbObjectGR, `${LicensingEngineDBConstants.SYS_PACKAGE}.${LicensingEngineDBConstants.SOURCE}`);
            sysDbObjectGR.next();

            let result = [];
            const packageId = sysDbObjectGR[LicensingEngineDBConstants.SYS_SCOPE][LicensingEngineDBConstants.SCOPE].toString();
            const scopeId = sysDbObjectGR[LicensingEngineDBConstants.SYS_PACKAGE][LicensingEngineDBConstants.SOURCE].toString();

            if (packageId !== null) {
                result = result.concat(getSubscriptionNamesByPackageId(packageId));
            }

            if (scopeId !== null && scopeId !== LicensingEngineDBConstants.GLOBAL_SCOPE) {
                result = result.concat(getSubscriptionNamesByScopeId(scopeId));
            }

            tableNameToSubscriptionNamesCache[tableName] = result;

            return result;
        }

        return {
            byTableName: getSubscriptionNamesByTableName
        };
    }

    const licenseFinder = createLicenseFinder();


    /*
        Get a list of custom tables on the instance
    */
    function getCustomTables() {
        const customTables = {};

        const customTableInventoryGR = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        _grHelper.addExtraField(customTableInventoryGR, `${LicensingEngineDBConstants.TABLE_REF}.${LicensingEngineDBConstants.SYS_SCOPE}`);
        _grHelper.addExtraField(customTableInventoryGR, `${LicensingEngineDBConstants.TABLE_REF}.${LicensingEngineDBConstants.SYS_SCOPE}.${LicensingEngineDBConstants.SCOPE}`);
        _grHelper.addExtraField(customTableInventoryGR, `${LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT}.${LicensingEngineDBConstants.NAME}`);
        customTableInventoryGR.query();

        while (customTableInventoryGR.next()) {
            const tableName = customTableInventoryGR.getValue(LicensingEngineDBConstants.TABLE_NAME);
            const customTableInventorySysId = customTableInventoryGR.getValue(LicensingEngineDBConstants.SYS_ID);

            //check the scope name, if it exists, then use the scope id, if not then it should go to 'global'
            const scopeId = customTableInventoryGR[LicensingEngineDBConstants.TABLE_REF][LicensingEngineDBConstants.SYS_SCOPE][LicensingEngineDBConstants.SCOPE].toString() != '' ? customTableInventoryGR[LicensingEngineDBConstants.TABLE_REF][LicensingEngineDBConstants.SYS_SCOPE].toString() : 'global';
            customTables[tableName] = {
                license: customTableInventoryGR[LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT][LicensingEngineDBConstants.NAME].toString(),
                appSysId: scopeId,
                customTableInventorySysId,
                related: []
            };
        }

        return customTables;
    }


    /*
        Get all tables which extend another table
    */
    function getExtendedTables() {
        const encodedQuery = "super_classISNOTEMPTY";
        const sysDbObjectGR = new GlideRecord(LicensingEngineDBConstants.SYS_DB_OBJECT);
        sysDbObjectGR.addEncodedQuery(encodedQuery, true);

        _grHelper.addExtraField(sysDbObjectGR, `super_class.name`);
        sysDbObjectGR.query();

        const table = {};
        while (sysDbObjectGR.next()) {
            table[sysDbObjectGR.getValue(LicensingEngineDBConstants.NAME)] =
                sysDbObjectGR.super_class.name.toString();
        }

        return table;
    }

    /*
        Get all tables which reference this table
        table : string - table name - must correspond to the sys_dictionary.name field
    */
    function getReferringTables(tableName) {
        const encodedQuery = "internal_type=reference^reference.name=" + GlideStringUtil.escapeQueryTermSeparator(tableName);

        const sysDictionaryGR = new GlideAggregate("sys_dictionary");
        sysDictionaryGR.addEncodedQuery(encodedQuery, true);
        sysDictionaryGR.addAggregate("GROUP_CONCAT_DISTINCT", LicensingEngineDBConstants.NAME);
        sysDictionaryGR.groupBy("reference.name");
        sysDictionaryGR.query();

        let tables = [];
        if (sysDictionaryGR.next())
            tables = sysDictionaryGR
            .getAggregate("GROUP_CONCAT_DISTINCT", LicensingEngineDBConstants.NAME)
            .split(",");

        return tables;
    }

    /*
        Get all tables referenced by this table
        table.reference => u_reference
    */
    function getTablesReferenced(tableName) {
        const encodedQuery = "name=" + GlideStringUtil.escapeQueryTermSeparator(tableName) + "^internal_type=reference";

        const sysDictionaryGR = new GlideAggregate("sys_dictionary");
        sysDictionaryGR.addEncodedQuery(encodedQuery, true);
        sysDictionaryGR.addAggregate("GROUP_CONCAT_DISTINCT", "reference.name");
        sysDictionaryGR.groupBy(LicensingEngineDBConstants.NAME);
        sysDictionaryGR.query();

        let tables = [];
        if (sysDictionaryGR.next())
            tables = sysDictionaryGR
            .getAggregate("GROUP_CONCAT_DISTINCT", "reference.name")
            .split(",");

        return tables;
    }

    /*
        Get a list of tables from the basic_query_from field in the Relationships (sys_relationship) table
        where the passed in tableName is the basic_apply_to value
        "applies to -> custom table" is similar to getReferringTables
    */
    function getQueryFromAppliesTo(tableName) {
        const encodedQuery = "basic_apply_toNSAMEASbasic_query_from^basic_apply_to=" + GlideStringUtil.escapeQueryTermSeparator(tableName);

        const sysRelationshipGR = new GlideAggregate("sys_relationship");
        sysRelationshipGR.addEncodedQuery(encodedQuery, true);
        sysRelationshipGR.addAggregate("GROUP_CONCAT_DISTINCT", "basic_query_from");
        sysRelationshipGR.groupBy("basic_apply_to");
        sysRelationshipGR.query();

        let tables = [];
        if (sysRelationshipGR.next())
            tables = sysRelationshipGR
            .getAggregate("GROUP_CONCAT_DISTINCT", "basic_query_from")
            .split(",");

        return tables;
    }

    /*
        Get a list of tables from the basic_apply_to field in the Relationships (sys_relationship) table
        where the passed in tableName is the basic_query_from value
        "query from -> custom table" is similar to getTablesReferenced
    */
    function getAppliesFromQueryFrom(tableName) {
        const encodedQuery = "basic_apply_toNSAMEASbasic_query_from^basic_query_from=" + GlideStringUtil.escapeQueryTermSeparator(tableName);

        const sysRelationshipGR = new GlideAggregate("sys_relationship");
        sysRelationshipGR.addEncodedQuery(encodedQuery, true);
        sysRelationshipGR.addAggregate("GROUP_CONCAT_DISTINCT", "basic_apply_to");
        sysRelationshipGR.groupBy("basic_query_from");
        sysRelationshipGR.query();

        let tables = [];
        if (sysRelationshipGR.next())
            tables = sysRelationshipGR
            .getAggregate("GROUP_CONCAT_DISTINCT", "basic_apply_to")
            .split(",");

        return tables;
    }

    function getTableSubscription(
        tableName,
        source,
        customTables,
        nonCustomTables,
        licences
    ) {
        if (customTables[tableName]) {
            licences.push({
                table: tableName,
                source: source
            });
            return licences;
        }

        if (!nonCustomTables[tableName]) {
            nonCustomTables[tableName] = licenseFinder.byTableName(tableName);
        }

        for (let i = 0; i < nonCustomTables[tableName].length; i++) {
            licences.push({
                table: tableName,
                license: nonCustomTables[tableName][i],
                source: source
            });
        }

        return licences;
    }

    /*
        Gets all table subscriptions for table and from related tables
    */
    function getCustomTableLicenses(
        tableName,
        extendedTables,
        customTables,
        nonCustomTables
    ) {

        const subscriptions = licenseFinder.byTableName(tableName);
        let licences = subscriptions.map(function(license) {
            return {
                table: tableName,
                license: license,
                source: AppAndCustomTableRecommenderConstants.RELATION_CODES.subscription
            };
        });

        // find extension
        const extendedTableName = extendedTables[tableName];

        if (extendedTableName) {
            licences = getTableSubscription(
                extendedTableName,
                AppAndCustomTableRecommenderConstants.RELATION_CODES.extension,
                customTables,
                nonCustomTables,
                licences
            );
        }

        // find out if anyone is referring to it
        const referringTables = getReferringTables(tableName);
        referringTables.forEach(tableName => {
            licences = getTableSubscription(
                tableName,
                AppAndCustomTableRecommenderConstants.RELATION_CODES.referenceTo,
                customTables,
                nonCustomTables,
                licences
            );
        });

        // find out if it is referencing anyone
        const tablesReferenced = getTablesReferenced(tableName);
        for (let i = 0; i < tablesReferenced.length; i++) {
            licences = getTableSubscription(
                tablesReferenced[i],
                AppAndCustomTableRecommenderConstants.RELATION_CODES.referenceFrom,
                customTables,
                nonCustomTables,
                licences
            );
        }

        // find out if it is in a relationship TO
        const tablesRelationshipTo = getQueryFromAppliesTo(tableName);
        for (let i = 0; i < tablesRelationshipTo.length; i++) {
            licences = getTableSubscription(
                tablesRelationshipTo[i],
                AppAndCustomTableRecommenderConstants.RELATION_CODES.relationTo,
                customTables,
                nonCustomTables,
                licences
            );
        }

        // find out if it is in a relationship FROM
        const tablesRelationshipFrom = getAppliesFromQueryFrom(tableName);
        for (let i = 0; i < tablesRelationshipFrom.length; i++) {
            licences = getTableSubscription(
                tablesRelationshipFrom[i],
                AppAndCustomTableRecommenderConstants.RELATION_CODES.relationFrom,
                customTables,
                nonCustomTables,
                licences
            );
        }

        return licences;
    }

    function formatData(customTables) {
        const trimLicense = (license = '') => license.trim();

        const result = {};
        const grandfatherSubscriptionLookup = licenseCustTableAllotmentDAO.getAllGrandFatherSubscriptionByName();
        const primarySubscriptions = licenseCustTableAllotmentDAO.getAllActivePrimarySubscriptions();
        const primarySubscriptionLookup = primarySubscriptions.reduce((lookup, value) => ({
            ...lookup,
            [trimLicense(value.subscriptionName)]: true
        }), {});

        for (const [table, data] of Object.entries(customTables)) {
            let relatedLicensesAndTables = data.related.map(({
                table,
                source,
                license
            }) => {
                const currentSource = {
                    code: source,
                    label: AppAndCustomTableRecommenderConstants.RELATION_DETAILS[source].label
                };

                const trimmedLicense = trimLicense(license);

                return {
                    table: table,
                    // Only add the license key if it's defined.
                    // Do not remove this or the 'in' key check in
                    // AppAndCustomTableRecommenderEngine will behave incorrectly.
                    ...(trimmedLicense && {
                        license: trimmedLicense
                    }),
                    source: currentSource
                };
            });


            // Remove all grandfathered subscriptions so that it is never recommended AND
            // Remove all subscriptions that are not primary subscriptions or expired
            relatedLicensesAndTables = relatedLicensesAndTables.filter(entry => {
                if (!entry.license) {
                    // This is a Table entry, so we need to keep it
                    return true;
                }

                const trimmedLicense = trimLicense(entry.license);

                if (grandfatherSubscriptionLookup[trimmedLicense]) {
                    // This is a grandfathered subscription, so should be removed
                    return false;
                }

                if (!primarySubscriptionLookup[trimmedLicense]) {
                    // This is not available on license_cust_table_allotment and is not an active subscription.
                    return false;
                }

                // All checks passed, so this is a valid subscription
                return true;
            });

            const trimmedDataLicense = trimLicense(data.license);
            // Remove the assignedLicense from the table if it is grandfathered or if it is not a primary subscription
            const assignedLicense = (grandfatherSubscriptionLookup[trimmedDataLicense] || !primarySubscriptionLookup[trimmedDataLicense]) ? null : trimmedDataLicense;

            // Set the hasAssignedLicense flag so that we do not recommend subscriptions for this table
            const hasAssignedLicense = !!data.license;

            result[table] = {
                appSysId: customTables[table].appSysId,
                customTableInventorySysId: customTables[table].customTableInventorySysId,
                assignedLicense: assignedLicense,
                hasAssignedLicense: hasAssignedLicense,
                relatedLicensesAndTables: relatedLicensesAndTables
            };
        }

        return result;
    }

    AppAndCustomTableRecommenderScraper.getCustomTableRelations = function() {
        const customTables = getCustomTables();
        const tableNames = Object.keys(customTables);
        const extendedTables = getExtendedTables();
        const nonCustomTables = [];

        for (let i = 0; i < tableNames.length; i++) {
            const tableName = tableNames[i];
            const licenses = getCustomTableLicenses(
                tableName,
                extendedTables,
                customTables,
                nonCustomTables
            );

            customTables[tableName].related = licenses;
        }

        const formattedData = formatData(customTables);

        return formattedData;
    };

    AppAndCustomTableRecommenderScraper.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        type: 'AppAndCustomTableRecommenderScraper',
    };
})();
