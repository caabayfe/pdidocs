(function validate() {
    if (evaluatePreRequisite()) {
        calculateCoalesceUniqueness();
    }

    gs.setRedirect("sys_transform_map.do?sys_id=" + current.sys_id);
})();

function evaluatePreRequisite() {
    var validator = new SNC.CoalesceIndexValidator(current.sys_id);
    if (validator.isIndexRequired()) {
        gs.addErrorMessage(gs.getMessage("Validation skipped. Continuing this operation with a non-indexed coalesce field can negatively impact instance performance."));
        return false;
    }
    return true;
}

function calculateCoalesceUniqueness() {
    //find coalesce fields for transform map
    var transformEntry = new GlideRecord("sys_transform_entry");
    transformEntry.addQuery("map", current.sys_id);
    transformEntry.addQuery("coalesce", true);
    transformEntry.query();

    var coalesceFields = [];
    while (transformEntry.next()) {
        coalesceFields.push(transformEntry.getValue("target_field"));
    }

    if (coalesceFields.length == 0) {
        gs.addErrorMessage(gs.getMessage("Validation skipped. No coalesce field detected."));
        return;
    }

    var targetTable = new GlideRecord(current.getValue("target_table"));
    targetTable.setLimit(1);
    targetTable.query();

    if (!targetTable.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Validation failed. No data in {0} table available to validate coalesce field(s) with.", aggregate.getClassDisplayValue()));
        return;
    }

    //detect uniqueness of existing coalesce fields against target table
    var aggregate = new GlideAggregate(current.getValue("target_table"));
    aggregate.addAggregate("COUNT");
    aggregate.addHaving("COUNT", ">", "1");
    aggregate.setLimit(1);

    for (var i = 0; i < coalesceFields.length; i++) {
        aggregate.groupBy(coalesceFields[i]);
    }

    aggregate.query();

    if (aggregate.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Validation failed. Multiple target records with matching coalesce field values were found."));
        return;
    }

    gs.addInfoMessage(gs.getMessage("Validation successful."));
    return;
}
