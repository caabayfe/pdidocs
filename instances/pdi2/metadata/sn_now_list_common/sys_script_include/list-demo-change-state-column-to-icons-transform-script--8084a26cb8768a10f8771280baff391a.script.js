(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
        var listModel = transformBuilder.transform();

        listModel.columnDefinitions.columns[2].type = "icon";

        var iconMap = {
            New: {
                value: "star-outline",
                color: "info",
            },
            "In Progress": {
                value: "action-outline",
                color: "positive",
            },
            "On Hold": {
                value: "workflow-on-hold-outline",
                color: "warning",
            },
            Resolved: {
                value: "emoji-positive-outline",
                color: "positive",
            },
            Closed: {
                value: "square-close-outline",
                color: "moderate",
            },
            Canceled: {
                value: "circle-close-outline",
                color: "high",
            },
        };

        listModel.rowDefinitions.rows.forEach(function(row) {
            var currentValue = row.cells.state.value;
            var newValue = iconMap[currentValue];
            row.cells.state = newValue;
        });

        return listModel;
    } catch (error) {
        // do not remove
        return {
            failed: true,
            error: error.message,
        };
    }
})(transformBuilder, transformScriptArgs);
