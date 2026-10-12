(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
        transformBuilder.columnDefinitions.columns.forEach(function(column) {
                transformBuilder.editColumnLabels([{
                    columnKey: column.key,
                    newLabel: column.label.toUpperCase(),
                }]);
        });
        var listModel = transformBuilder.transform();

        return listModel;
    } catch (error) {
        // do not remove
        return {
            failed: true,
            error: error.message,
        };
    }
})(transformBuilder, transformScriptArgs);
