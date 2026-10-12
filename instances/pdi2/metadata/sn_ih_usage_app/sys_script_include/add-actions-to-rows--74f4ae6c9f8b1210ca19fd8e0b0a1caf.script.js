(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
        var listModel = transformBuilder.transform();

        listModel.rowDefinitions.actions = {
            position: 'start',
            actionsItems: [{
                id: 'view_aggregate_breakdown',
                icon: 'circle-info-outline',
                label: 'View aggregate breakdown',
                action: 'view_aggregate_breakdowm'
            }]
        };

        return listModel;
    }

    // do not remove
    catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
