var UXAQueryBuilderConfigurationService = Class.create();
UXAQueryBuilderConfigurationService.prototype = {
    initialize: function() {
        this.USER_QB_PREFERENCE_TABLE = 'sn_uxa_menu_category_mapping';
        this.USER_CONDITIONS_MAX_NUM = 20;
        this.USER_PREFERENCE_TABLE = 'sys_user_preference';
        this.MAX_SEVER_LIMIT = gs.getProperty('uxa.query_builder.max_num_of_user_filter', 500);
    },
    savePredicateComposition: function(permission, name, appSysId, componentId, predicateComposition) {
        const userSysId = gs.getUserID();
        const canUserSaveConditionValidaitonMessage = this._validateUserCanSaveCondition(userSysId, name);
        if (canUserSaveConditionValidaitonMessage != UXAConstants.QB_UPDATE_STATUS.SUCCESS) {
            return canUserSaveConditionValidaitonMessage;
        }
        let qbPreferenceGr = new GlideRecord(this.USER_QB_PREFERENCE_TABLE);
        qbPreferenceGr.initialize();
        qbPreferenceGr.setValue('subcategory', name);
        qbPreferenceGr.setValue('app_sys_id', appSysId);
        qbPreferenceGr.setValue('component_id', componentId);
        qbPreferenceGr.setValue('preconfiguredpredicate', JSON.stringify(predicateComposition));
        qbPreferenceGr.setValue('user_id', userSysId);
        qbPreferenceGr.setValue('permission', permission);
        if (qbPreferenceGr.insert())
            return canUserSaveConditionValidaitonMessage;
        return UXAConstants.QB_UPDATE_STATUS.ERROR;
    },
    getQueryBuilderConfigurations: function(appSysId, componentId) {
        const qbPreferenceGr = new GlideRecord(this.USER_QB_PREFERENCE_TABLE);
        const filterPreferences = [];
        qbPreferenceGr.addQuery('app_sys_id', appSysId);
        qbPreferenceGr.addQuery('component_id', componentId);
        qbPreferenceGr.addEncodedQuery(`user_id=${gs.getUserID()}^ORpermission=1`);
        qbPreferenceGr.query();
        while (qbPreferenceGr.next()) {
            filterPreferences.push({
                name: qbPreferenceGr.getValue('subcategory'),
                predicateComposition: this._parsePredicateComposition(qbPreferenceGr.getValue('preconfiguredpredicate')),
                readOnly: !(qbPreferenceGr.getValue('user_id') === gs.getUserID() || gs.hasRole('analytics_admin')),
                id: qbPreferenceGr.getValue('sys_id'),
                permissionType: qbPreferenceGr.getValue('permission'),
                owned: qbPreferenceGr.getValue('user_id') === gs.getUserID()
            });
        }
        return filterPreferences;
    },
    _parsePredicateComposition: function(predicateComposition) {
        if (typeof predicateComposition === 'string') {
            try {
                return JSON.parse(predicateComposition);
            } catch {
                return predicateComposition;
            }
        }
    },
    deleteNonUserQBPreference: function(sysId) {
        const nonUserGr = new GlideRecord(this.USER_QB_PREFERENCE_TABLE);
        nonUserGr.get(sysId);
        if (nonUserGr.canDelete())
            nonUserGr.deleteRecord();
    },
    _validateUserCanSaveCondition: function(sysUserId, preferenceName) {
        const gr = new GlideRecord(this.USER_QB_PREFERENCE_TABLE);
        gr.addEncodedQuery(`user_id=${sysUserId}^ORsubcategory=${preferenceName}`);
        gr.query();
        let rowCountForUser = 0;

        while (gr.next()) {
            if (gr.getValue('user_id') === sysUserId)
                rowCountForUser++;
            if (rowCountForUser >= this.USER_CONDITIONS_MAX_NUM)
                return UXAConstants.QB_UPDATE_STATUS.USER_LIMIT_REACHED;
            // Check for duplicate based on the original conditions
            if (gr.getValue('subcategory') == preferenceName && gr.getValue('user_id') === sysUserId)
                return UXAConstants.QB_UPDATE_STATUS.DUPLICATE_NAME;

            if (gr.getValue('subcategory') == preferenceName && gr.getValue('permission') == 1)
                return UXAConstants.QB_UPDATE_STATUS.DUPLICATE_NAME;
        }

        var agg = new GlideAggregate(this.USER_QB_PREFERENCE_TABLE);
        agg.addEncodedQuery('permissionISNOTEMPTY');
        agg.addAggregate('COUNT');
        agg.query();
        if (agg.next()) {
            if (parseInt(agg.getAggregate('COUNT')) >= parseInt(this.MAX_SEVER_LIMIT))
                return UXAConstants.QB_UPDATE_STATUS.SERVER_LIMIT_REACHED;
        }
        return UXAConstants.QB_UPDATE_STATUS.SUCCESS;
    },

    type: 'UXAQueryBuilderConfigurationService'
};
