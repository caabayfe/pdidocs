var SysCustomDBObjectDAO = Class.create();
SysCustomDBObjectDAO.prototype = {
    initialize: function() {},

    isCustomTable: function(tableName) {
        var custObjGR = new GlideRecord(LicensingEngineDBConstants.SYS_CUSTOM_DB_OBJECT);
        if (custObjGR.isValid() && custObjGR.isValidField(LicensingEngineDBConstants.SOURCE) &&
            custObjGR.isValidField(LicensingEngineDBConstants.SOURCE_TYPE)) {
            custObjGR.addQuery(LicensingEngineDBConstants.SOURCE_TYPE, LicensingEngineConstants.TABLE);
            custObjGR.addQuery(LicensingEngineDBConstants.SOURCE, tableName);
            custObjGR.query();
            return custObjGR.hasNext();
        }
        return false;
    },

    getTablesPartOfAppInstall: function() {
        var tablesIncludedInAppInstall = [];
        var gr = new GlideRecord(LicensingEngineDBConstants.SYS_CUSTOM_DB_OBJECT);
        gr.addQuery(LicensingEngineDBConstants.SOURCE_TYPE, LicensingEngineConstants.TABLE);
        gr.addQuery(LicensingEngineDBConstants.IS_FROM_APP_INSTALL, true);
        gr.query();
        while (gr.next()) {
            tablesIncludedInAppInstall.push(gr.getValue(LicensingEngineDBConstants.SOURCE));
        }
        return tablesIncludedInAppInstall;
    },

    type: 'SysCustomDBObjectDAO'
};
