function onLoad() {
    if (g_form.isNewRecord()) {
        var template = "/**\n* Initialize the mobile screen builder based on the Mobile Screen Type.\n*\n* List: \n* initListScreen(tableName) or\n* initListScreen(tableName, listQuery) \n* \n* Form: \n* initRecordScreen(tableName, sysId)\n*\n* Browser: \n* initMobileWebScreen(url)\n**/\n\n(function initializeMobileScreenBuilder(/*String*/ urlPath, /*Dictionary*/ urlQuery, /*String*/ originalUrl) {\n\u0009var mobileScreenBuilder = new sn_mobile.ScriptableMobileScreenBuilder();\n\u0009\n\u0009// Initialize mobile screen builder\n\u0009\n\u0009return mobileScreenBuilder;\n})(urlPath, urlQuery, originalUrl);";
        g_form.setValue("mobile_applet_builder", template);
    }
}
