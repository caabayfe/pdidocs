var PlatLicExemptionDAO = Class.create();
PlatLicExemptionDAO.prototype = {
    initialize: function() {
        this.nameToTypeMap = new Map();
    },

    insertExemptedEntities: function(exemptedEntities, type) {
        for (const idx in exemptedEntities) {
            var gr = new GlideRecord(LicensingEngineDBConstants.PLAT_LIC_EXEMPTION);
            gr.addQuery(LicensingEngineDBConstants.TYPE, type);
            gr.addQuery(LicensingEngineDBConstants.NAME, exemptedEntities[idx]);
            gr.query();

            if (!gr.next()) {
                gr.initialize();
                gr.setValue(LicensingEngineDBConstants.TYPE, type);
                gr.setValue(LicensingEngineDBConstants.NAME, exemptedEntities[idx]);
                gr.insert();
            }
        }
    },

    /**
     * @param {String} name of the table
     * @returns {Boolean} true if the table is exempted by base table else false
     */
    isExemptedByBaseTable: function(tableName) {
        if (global.JSUtil.nil(tableName))
            return false;
        const extendedTables = new global.LicensingEngineGlobalHelper().getExtendedTables(tableName);

        if (!this.nameToTypeMap.size)
            this.loadNameToTypeMap();

        for (const table in extendedTables) {
            if (this.nameToTypeMap.get(table) == LicensingEngineDBConstants.BASE_TABLE)
                return true;
        }
        return false;
    },

    /**
     * @param {String} name of the table
     * @returns {Boolean} true if the table is exempted by scope else false
     */
    isExemptedByScope: function(tableName) {
        if (global.JSUtil.nil(tableName))
            return false;
        const appInstallationCustomObjects = new SysCustomDBObjectDAO().getTablesPartOfAppInstall();
        // will skip checking if table is part of scope/app which is actively installing as the app already exists
        if (!appInstallationCustomObjects.includes(tableName))
            return false;

        const scopeObj = new SysDBObjectDAO().getScopeDetailsByTable(tableName);
        const tableScope = scopeObj[LicensingEngineDBConstants.SCOPE].trim();

        if (!this.nameToTypeMap.size)
            this.loadNameToTypeMap();

        return this.nameToTypeMap.get(tableScope) == LicensingEngineConstants.SCOPE;
    },

    loadNameToTypeMap: function() {
        var gr = new GlideRecord(LicensingEngineDBConstants.PLAT_LIC_EXEMPTION);
        gr.query();
        while (gr.next()) {
            const type = gr.getValue(LicensingEngineDBConstants.TYPE);
            const name = gr.getValue(LicensingEngineDBConstants.NAME);
            this.nameToTypeMap.set(name, type);
        }
    },

    type: 'PlatLicExemptionDAO'
};
