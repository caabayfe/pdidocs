logPassword2ImportUsage();

function logPassword2ImportUsage() {
    var tableList = event.parm1.split(',');
    if (tableList.length == 0)
        return;

    var GCF_CATEGORY = 'import_exports';
    var IMPORT_USAGE_COLLECTION_POINT = 'password2_imports';
    var IMPORT_USAGE_EVENT = 'password2_import_run';
    var IS_LEGACY = "is_legacy_password2=true";
    var PARENT_MODULE_ID = '7d7ee9e3b7030010ebf7082e7e11a979';
    var password2CryptoScopeList = getPassword2ModuleScopeList();

    var password2Table = [];
    var password2TripleDESTable = [];

    var sysDictionaryGr = new GlideRecord('sys_dictionary');
    sysDictionaryGr.addQuery('internal_type', 'password2');
    sysDictionaryGr.addQuery('name', 'IN', tableList);
    sysDictionaryGr.query();
    while (sysDictionaryGr.next()) {
        var scope = sysDictionaryGr.getValue('sys_package');
        var tableName = sysDictionaryGr.getValue('name');
        var isLegacy = null;
        if (sysDictionaryGr.getValue('attributes') != null) {
            isLegacy = sysDictionaryGr.getValue('attributes').contains(IS_LEGACY);
        }
        var isScopeNotPresentInPW2Submodule = password2CryptoScopeList.length == 0 || (password2CryptoScopeList.length > 0 && !password2CryptoScopeList.includes(scope));
        if (!password2TripleDESTable.includes(tableName) && isLegacy && isScopeNotPresentInPW2Submodule) {
            password2TripleDESTable.push(tableName);
        } else if (!password2Table.includes(tableName)) {
            password2Table.push(tableName);
        }
    }

    if (password2Table.length > 0 || password2TripleDESTable.length > 0) {
        var sampleMap = new GCFSampleMap();
        sampleMap.put('password2_kmf_tables', password2Table.join(','));
        sampleMap.put('password2_kmf_tables_count', password2Table.length.toString());
        sampleMap.put('password2_triple_des_tables', password2TripleDESTable.join(','));
        sampleMap.put('password2_triple_des_tables_count', password2TripleDESTable.length.toString());
        GCFCollector.recordUsageEvent(GCF_CATEGORY, IMPORT_USAGE_COLLECTION_POINT, IMPORT_USAGE_EVENT, sampleMap);
    }

    function getPassword2ModuleScopeList() {
        var password2ModuleScopeList = [];
        var gr = new GlideRecord('sys_kmf_crypto_module');
        gr.addQuery('parent_crypto_module', PARENT_MODULE_ID);
        gr.query();
        while (gr.next()) {
            password2ModuleScopeList.push(gr.getValue('sys_package'));
        }
        return password2ModuleScopeList;
    }
}
