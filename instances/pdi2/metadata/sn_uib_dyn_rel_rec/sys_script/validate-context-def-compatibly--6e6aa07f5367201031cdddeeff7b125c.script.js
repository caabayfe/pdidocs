(function executeRule(current, previous /*null when async*/ ) {
    var context = new GlideRecord("sn_related_record_context");
    var defintion = new GlideRecord("sn_related_record_definition");
    context.get(current.related_record_context);
    defintion.get(current.related_record_definition);

    var source_rec = new GlideRecord(context.applies_to_table);

    if (!gs.nil(context.primary_field) && source_rec.getElement(context.primary_field).getED().getInternalType() === "GUID") {
        //if the table in Defs can be instantiated from the reference in the context. Def must be that table or higher in hierarchy
        if (!gs.nil(defintion.primary_table) && (new GlideTableHierarchy(context.applies_to_table + '')
                .getTables().indexOf(defintion.primary_table + '') === -1)) {
            invalid();
        }
    }

    if (!gs.nil(context.primary_field) && source_rec.getElement(context.primary_field).getED().getInternalType() === "reference") {
        //if the table in Defs can be instantiated from the reference in the context. Def must be that table or higher in hierarchy
        if (!gs.nil(defintion.primary_table) && (new GlideTableHierarchy(source_rec.getElement(context.primary_field + '')
                .getReferenceTable()).getTables().indexOf(defintion.primary_table + '') === -1)) {
            invalid();
        }
    }

    if (!gs.nil(context.secondary_field) && source_rec.getElement(context.secondary_field).getED().getInternalType() === "reference") {
        //if the table in Defs can be instantiated from the reference in the context. Def must be that table or higher in hierarchy
        if (!gs.nil(defintion.secondary_table) && (new GlideTableHierarchy(source_rec.getElement(context.secondary_field + '')
                .getReferenceTable()).getTables().indexOf(defintion.secondary_table + '') === -1)) {
            invalid();
        }
    }

    if ((!gs.nil(defintion.secondary_table) && gs.nil(context.secondary_field)) ||
        (!gs.nil(defintion.primary_table) && gs.nil(context.primary_field))) {
        invalid();
    }

    function invalid() {
        gs.addErrorMessage(gs.getMessage("Primary table of the Related Record Defintion and primary reference of the Related Record Context are not compatible"));
        current.setAbortAction(true);
    }
    return;

})(current, previous);
