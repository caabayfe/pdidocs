var SubscriptionApplicationUsersDao = Class.create();
SubscriptionApplicationUsersDao.prototype = {

    initialize: function() {
        this._licenseRoleTypes = this._getLicenseRoleTypes();
        this._licenseRoleTypeIds = this._licenseRoleTypes.map(licenseRoleTypes => licenseRoleTypes.id);
        this._grHelper = new sn_entitlement.LicensingEngineGlideRecordHelper();
        // params to _userDao.getUserIdsByValidAndHasRole(roleIds) may not be repeated. Not using pass-through cache
        this._userDao = new sn_entitlement.UserDao();

        // with pass-through cache
        this._userRoleDao = new sn_entitlement.PassThroughCache(new sn_entitlement.UserRoleDao());
        this._userHasSubscriptionDao = new sn_entitlement.PassThroughCache(new sn_entitlement.UserHasSubscriptionDao());
    },

    _getLicenseRoleTypes: function() {
        const gr = new GlideRecord('license_role_type');
        gr.addActiveQuery();
        gr.query();

        let licenseRoleTypes = [];
        while (gr.next()) {
            licenseRoleTypes.push({
                id: String(gr.id),
                name: String(gr.name),
                order: parseInt(gr.order)
            });
        }
        return licenseRoleTypes;
    },

    _getMaxRoleLevelByLicenseRoleType: function(licenseRoleTypes, roleNames) {
        const gr = new GlideRecord('license_role');
        gr.addQuery('sys_user_role', 'IN', roleNames);
        this._grHelper.addExtraField(gr, "license_role_type.id");
        gr.query();

        let roleTypeIds = [];
        while (gr.next())
            roleTypeIds.push(String(gr.license_role_type.id));

        const lowestOrderVal = licenseRoleTypes
            .filter(licenseRoleType => roleTypeIds.indexOf(licenseRoleType.id) > -1)
            .map(licenseRoleType => licenseRoleType.order)
            .reduce((a, b) => Math.min(a, b), Number.MAX_SAFE_INTEGER);

        const maxLicenseRoleType = licenseRoleTypes
            .find(licenseRoleType => licenseRoleType.order == lowestOrderVal);

        return maxLicenseRoleType ? maxLicenseRoleType.name : '';
    },

    _filterRoleNamesByRoleTypeName: function(roleNames, licenseRoleTypeName) {
        const gr = new GlideRecord('license_role');
        gr.addActiveQuery();
        gr.addQuery('name', 'IN', roleNames);
        gr.addQuery('license_role_type.name', licenseRoleTypeName);
        gr.query();

        let result = [];
        while (gr.next())
            result.push(String(gr.name));
        return result;
    },

    _getRoleNamesByRoleIds: function(roleIds) {
        const gr = new GlideRecord('sys_user_role');
        gr.addQuery('sys_id', 'IN', roleIds);
        gr.query();

        let names = [];
        while (gr.next())
            names.push(String(gr.name));
        return names;
    },

    getUsers: function(subscriptionId, licenseFamilyId) {
        return this._getDataInternal(subscriptionId, licenseFamilyId, false);
    },

    getUsersCount: function(subscriptionId, licenseFamilyId) {
        return this._getDataInternal(subscriptionId, licenseFamilyId, true);
    },

    getUsersCountForSubscriptionAndFamilies: function(subscriptionId, licenseFamilyIds) {
        return this._getDataInternalBatch(subscriptionId, licenseFamilyIds, true);
    },

    _noResults: function(returnJustTheCount) {
        return returnJustTheCount ? 0 : [];
    },

    _noResultsForFamIds: function(returnJustTheCount, licenseFamilyIds) {
        const resultMap = new Map();
        licenseFamilyIds.forEach(id => {
            resultMap.set(id, this._noResults(returnJustTheCount));
        });
        return resultMap;
    },

    _getDataInternal: function(subscriptionId, licenseFamilyId, returnJustTheCount) {
        if (!subscriptionId || !licenseFamilyId)
            return this._noResults(returnJustTheCount);

        return this._getDataInternalBatch(subscriptionId, [licenseFamilyId], returnJustTheCount).get(licenseFamilyId);
    },

    _getDataInternalBatch: function(subscriptionId, licenseFamilyIds, returnJustTheCount) {
        if (!subscriptionId) {
            return this._noResultsForFamIds(returnJustTheCount, licenseFamilyIds);
        }

        // initialized in the initialize()
        const licenseRoleTypes = this._licenseRoleTypes;
        const licenseRoleTypeIds = this._licenseRoleTypeIds;

        const userIdsSubscribed = [...this._userHasSubscriptionDao.getUserIdsBySubscriptionId(subscriptionId)];
        const roleIdsCoveredBySubscription = this._userRoleDao.getRoleIdsBySubscriptionId(subscriptionId, false);
        if ((licenseRoleTypes.length === 0) ||
            (licenseRoleTypeIds.length === 0) ||
            (userIdsSubscribed.length === 0) ||
            (roleIdsCoveredBySubscription.length === 0)) {

            return this._noResultsForFamIds(returnJustTheCount, licenseFamilyIds);
        }


        const licFamToLicUserRoleNames = this._userRoleDao.getLicensableUserRoleNamesByLicenseRoleTypeNamesForLicenseFamilyIds(licenseFamilyIds, licenseRoleTypeIds, false);
        const allRoleNames = new Set();
        licFamToLicUserRoleNames.forEach((roleNames, key) => {
            roleNames.forEach(r => allRoleNames.add(r));
        });
        const roleNameToRoleIdMap = this._userRoleDao.getUserRoleIdsForRoleNames(Array.from(allRoleNames));
        const resultMap = new Map();
        licenseFamilyIds.forEach(licenseFamilyId => {
            resultMap.set(licenseFamilyId, this._getResultForFamilyId(licenseFamilyId, returnJustTheCount, licFamToLicUserRoleNames, roleNameToRoleIdMap, roleIdsCoveredBySubscription, userIdsSubscribed, subscriptionId, licenseRoleTypes, licenseRoleTypeIds));
        });

        return resultMap;
    },

    _getResultForFamilyId: function(licenseFamilyId, returnJustTheCount, licFamToLicUserRoleNames, roleNameToRoleIdMap, roleIdsCoveredBySubscription, userIdsSubscribed, subscriptionId, licenseRoleTypes, licenseRoleTypeIds) {
        const licRoleNames = licFamToLicUserRoleNames.get(licenseFamilyId);
        if ((!licRoleNames) || (licRoleNames.length === 0)) {
            return this._noResults(returnJustTheCount);
        }


        const roleIdsForApplication = [];
        licRoleNames.forEach(roleName => {
            if (roleNameToRoleIdMap.has(roleName))
                roleIdsForApplication.push(roleNameToRoleIdMap.get(roleName));
        });

        if ((!roleIdsForApplication) || (roleIdsForApplication.length === 0))
            return this._noResults(returnJustTheCount);

        const roleIdsRelevant = roleIdsCoveredBySubscription.filter(roleId => roleIdsForApplication.indexOf(roleId) > -1);
        if (roleIdsRelevant.length === 0)
            return this._noResults(returnJustTheCount);

        const userIdsRelevant = this._userDao.getUserIdsByValidAndHasRole(roleIdsRelevant)
            .filter(userId => userIdsSubscribed.indexOf(userId) > -1);
        if (userIdsRelevant.length === 0)
            return this._noResults(returnJustTheCount);

        if (returnJustTheCount) {
            const ga = new GlideAggregate('sys_user');
            ga.addQuery('sys_id', 'IN', userIdsRelevant);
            return ga.getCount();
        }

        const gr = new GlideRecord('sys_user');
        gr.addQuery('sys_id', 'IN', userIdsRelevant);
        gr.query();

        const rows = [];

        while (gr.next()) {
            const userId = gr.getUniqueValue();
            const roleIds = this._userRoleDao.getUserRoleIdsByUserId(userId)
                .filter(roleId => roleIdsRelevant.indexOf(roleId) > -1);
            const userRoles = this._getRoleNamesByRoleIds(roleIds);
            const maxRoleLevelName = this._getMaxRoleLevelByLicenseRoleType(licenseRoleTypes, userRoles);
            const userRolesWithMaxRoleLevel = [...new Set(this._filterRoleNamesByRoleTypeName(userRoles, maxRoleLevelName))]
                .join(',');
            const row = {
                sys_id: userId,
                user_name: String(gr.getValue('user_name')),
                name: String(gr.getValue('name')),
                user_roles: userRolesWithMaxRoleLevel,
                cost_center_name: String(gr.cost_center.name),
                access_level: maxRoleLevelName,
                subscription: subscriptionId,
                license_family: licenseFamilyId
            };
            rows.push(row);
        }

        return rows;

    },
    type: 'SubscriptionApplicationUsersDao'
};
