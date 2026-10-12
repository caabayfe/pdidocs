function transform(input) {
    var distinctValues = [];
    var results = {
        "distinctValues": distinctValues
    };

    // GlideAggregate evaluates neither table nor field read ACLs, and the
    // fieldType metadata declared in this broker's props is enforced only by the
    // UI. Any caller the execute ACL admits -- which includes the delegated,
    // non-admin hermes_admin role -- therefore reaches this query directly, so
    // the caller's own read access must be checked here before any value is
    // returned.
    var isFieldReadable = function(gr, fieldName) {
        if (!gr.isValidField(fieldName))
            return false;

        // A GlideElement holding an empty value is itself falsy, so these must
        // be compared against null explicitly -- a truthiness test here would
        // reject every field, including ones the caller is allowed to read.
        var element = gr.getElement(fieldName);
        if (element == null || !element.canRead())
            return false;

        var dictionary = element.getED();
        if (dictionary == null)
            return false;

        // The display value of a credential column is masked, but the raw
        // getValue() below would bypass that masking, so never group by one.
        var internalType = String(dictionary.getInternalType());
        return internalType != "password" && internalType != "password2" && internalType != "glide_encrypted";
    };

    if (!input.table || !input.groupBy)
        return results;

    var accessProbe = new GlideRecord(input.table);
    if (!accessProbe.isValid())
        return results;

    accessProbe.initialize();
    if (!accessProbe.canRead())
        return results;

    if (!isFieldReadable(accessProbe, input.groupBy))
        return results;

    // orderBy is typically the same field as groupBy; skip re-checking a
    // field already cleared above.
    if (input.orderBy && input.orderBy !== input.groupBy && !isFieldReadable(accessProbe, input.orderBy))
        return results;

    var ga = new GlideAggregate(input.table);
    ga.groupBy(input.groupBy);
    ga.orderBy(input.orderBy);
    ga.addAggregate("COUNT");
    ga.query();
    while (ga.next()) {
        distinctValues.push({
            "value": ga.getValue(input.groupBy),
            "displayValue": ga.getDisplayValue(input.groupBy)
        });
    }

    return results;
}
