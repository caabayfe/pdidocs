function transform(input) {
    var tableName = input.tableName;
    var config = [];

    try {
        config = Array.isArray(input.fieldIds)
            ? input.fieldIds
            : JSON.parse(input.fieldIds || '[]');
    } catch (e) {
        gs.error('[AdditionalGroupByLabels] Failed to parse additionalGroupByConfig: ' + e);
        return { sourceType: 'table', labels: [], count: 0 };
    }

    if (!tableName || !Array.isArray(config) || !config.length) {
        return { sourceType: 'table', labels: [], count: 0 };
    }

    var hasMissing = config.some(function(entry) { return entry.id && !entry.label; });
    if (!hasMissing) {
        return { sourceType: 'table', labels: config, count: config.length };
    }

    var labels = config.filter(function(entry) { return entry.id; }).map(function(entry) {
        if (entry.label) return entry;
        var label = getFieldLabel(tableName, entry.id);
        return label !== null ? { id: entry.id, label: label } : entry;
    });

    return {
        sourceType: 'table',
        labels: labels,
        count: labels.length
    };

    function getFieldLabel(table, fieldId) {
        try {
            var parts = fieldId.split('.');
            var labelParts = [];
            var currentTable = table;
            for (var j = 0; j < parts.length; j++) {
                var gr = new GlideRecordSecure(currentTable);
                if (!gr.isValidField(parts[j])) return null;
                labelParts.push(gr.getElement(parts[j]).getED().getLabel());
                currentTable = gr.getElement(parts[j]).getED().getReference();
            }
            return labelParts.join(' > ');
        } catch (e) {
            gs.error('[AdditionalGroupByLabels] getFieldLabel("' + fieldId + '" on "' + table + '"): ' + e);
            return null;
        }
    }
}
