(function transform(transformBuilder, transformScriptArgs) {
    try {
        if(!transformBuilder) return;
        var listModel = transformBuilder;
        listModel.columnDefinitions.columns.forEach(function(column) {
            if (column.key === 'dict_name') {     
                column.renderAsLink = true;
            } else {
                column.renderAsLink = false;
            }
        });

        return listModel;
    } catch(error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
