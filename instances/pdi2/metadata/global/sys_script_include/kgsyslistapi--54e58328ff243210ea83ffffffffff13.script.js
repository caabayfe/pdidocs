var KGSysListAPI = Class.create();

KGSysListAPI.prototype = {
    initialize: function(tableName) {
        this.tableName = tableName || '';
    },
    getListRecord: function() {
        try {
            var sysList = new GlideSysList(this.tableName);
            var columns = sysList.getListRecords();
            var recordsArray = [];

            if (columns) {
                var iterator = columns.iterator();
                while (iterator.hasNext()) {
                    recordsArray.push(iterator.next());
                }
            }

            return recordsArray;
        } catch (e) {
            gs.error('Error in getListRecord for table ' + this.tableName + ': ' + e.message);
            return [];
        }
    },
    /**
     * Get the display column name of the given tables 
     * 
     */
    getOutgoingReferenceDisplayColumnsDetails: function(tables) {
        var result = {};
        if (!tables || !tables.length) {
            return result;
        }
        try {
            for (var table of tables) {
                var td = GlideTableDescriptor.get(table);
                if (!td) {
                    gs.error('Table descriptor not found for table: ' + table);
                    continue;
                }
                var displayColumnName = td.getDisplayName();
                result[table] = {
                    "tableName": table,
                    "displayColumn": displayColumnName
                };
            }
        } catch (e) {
            gs.error('Error in getOutgoingReferenceDisplayColumnsDetails for table ' + this.tableName + ': ' + e.message);
        }
        return result;
    },
    type: 'KGSysListAPI'
};
