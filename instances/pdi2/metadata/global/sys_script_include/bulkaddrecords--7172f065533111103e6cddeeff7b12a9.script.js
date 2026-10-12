var BulkAddRecords = Class.create();
BulkAddRecords.prototype = {
    initialize: function() {},

    callExtensionPoint: function(extensionPoint, method, params) {
        var eps = new GlideScriptedExtensionPoint().getExtensions(extensionPoint);
        if (method === "canRelateRecord") {
            for (var i = 0; i < eps.length; i++) {
                var result = eps[i][method](params[0], params[1], params[2]);
                if (typeof result === "undefined")
                    continue;
                return result;
            }
        } else if (method === "getFixedQuery") {
            for (var i = 0; i < eps.length; i++) {
                var result = eps[i][method](params[0], params[1]);
                if (typeof result === "undefined")
                    continue;
                return result;
            }
        }
    },

    getFixedQuery: function(parentTable, parentColumn) {
        var params = [parentTable, parentColumn];
        var query = this.callExtensionPoint("MRABulkAddRecordsFilter", "getFixedQuery", params);
        if (typeof query !== "undefined")
            return query;
        return "active=true^" + parentColumn + "ISEMPTY";
    },

    canRelateRecord: function(parentTable, relatedRecordGr, parentColumn) {
        var params = [parentTable, relatedRecordGr, parentColumn];
        var check = this.callExtensionPoint("MRABulkAddRecordsFilter", "canRelateRecord", params);
        if (typeof check !== "undefined")
            return check;
        return (relatedRecordGr.canWrite() && relatedRecordGr.getElement(parentColumn).canWrite());
    },

    type: 'BulkAddRecords'
};
