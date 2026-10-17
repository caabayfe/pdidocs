function transform(input) {
    var results = [];
    var typeaheadValue = input.fieldTypeaheadValue;
    var gr = new GlideRecord(input.table);
    var fields = gr.getElements();

    for (var i = 0; i < fields.length; i++) {
        var fieldLabel = fields[i].getED().getLabel();
        var fieldName = fields[i].getED().getName();

        if (!typeaheadMatchesFieldLabel(typeaheadValue, fieldLabel) || fieldExistsInResults(results, fieldName)) {
            continue;
        }

        results.push({
            "label": fieldLabel,
            "name": fieldName
        });
    }

    results.sort(function(a, b) {
        a = a.label.toLowerCase();
        b = b.label.toLowerCase();
        return (a < b) ? -1 : (a > b) ? 1 : 0;
    });
    return results;

    function typeaheadMatchesFieldLabel(typeaheadValue, fieldLabel) {
        // if typeaheadValue is nil, always return true since all fields should be displayed
        return gs.nil(typeaheadValue) ? true : !gs.nil(fieldLabel) &&
            fieldLabel.toLowerCase().startsWith(typeaheadValue.toLowerCase());
    }

    function fieldExistsInResults(results, fieldName) {
        return results.some(function(result) {
            return result.name === fieldName;
        });
    }
}
