var TaskConfigurationServerUtilSNC = Class.create();
TaskConfigurationServerUtilSNC.prototype = {
    initialize: function() {},
    process: function(tableName, referenceColumn) {
        tableName = gs.nil(tableName) ? current.table : tableName;
        referenceColumn = gs.nil(referenceColumn) ? current.reference_column : referenceColumn;
        var extensions = [];
        if (!gs.nil(referenceColumn)) {
            var gr = new GlideRecord(tableName);
            var glideElement = gr.getElement(referenceColumn);
            var descriptor = glideElement.getED();
            var columnType = descriptor.getInternalType();
            if (columnType === 'reference') {
                var referenceTable = glideElement.getReferenceTable();
                // if table has any extended tables, get the list	
                extensions = new GlideTableHierarchy(referenceTable).getAllExtensions();
            } else {
                var extensionPoints = new GlideScriptedExtensionPoint().getExtensions('sn_ex_sp.RefNonTaskTables');
                for (var i = 0; i < extensionPoints.length; i++)
                    extensions = extensions.concat(extensionPoints[i].getRefTables());
            }
        }
        return extensions;
    },
    type: 'TaskConfigurationServerUtilSNC'
};
