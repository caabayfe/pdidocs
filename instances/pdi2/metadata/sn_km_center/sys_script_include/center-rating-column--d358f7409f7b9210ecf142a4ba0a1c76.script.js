(function transform(transformBuilder, transformScriptArgs) {
    try {
        if(!transformBuilder) return;
        var listModel = transformBuilder.transform();
        
    
        listModel.columnDefinitions.columns.forEach(function(column) {
            if (column.key === 'rating') {
                column.alignment = 'center';
            }
        });
        
        return listModel;
    }

    // do not remove
    catch(error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
