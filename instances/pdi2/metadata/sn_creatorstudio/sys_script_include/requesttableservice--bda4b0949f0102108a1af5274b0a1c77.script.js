var RequestTableService = Class.create();

function getTableDictionaryRecord(tableName) {
    var grDict = new GlideRecordSecure("sys_dictionary");

    grDict.addQuery("name", tableName);
    grDict.addQuery("internal_type", "collection");
    grDict.addActiveQuery();
    grDict.query();
    if (grDict.next()) {
        return grDict;
    }
    return null;
}

RequestTableService.prototype = {
    initialize: function() {},
    updateTableAttributes(tableName) {
        var csDataProxy = new global.CreatorStudioDataProxy();
        var grTableDict = getTableDictionaryRecord(tableName);
        if (!grTableDict)
            return;
        return csDataProxy.update(grTableDict, {
            audit: true
        });
    },
    type: 'RequestTableService'
};
