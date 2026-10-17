(function executeRule(current, previous /*null when async*/ ) {

    var result = new global.PAAnalyticsSourceUtil().unSupportedFields(current.table, current.conditions, current.dimensions, '', current.id);
    var vMessage = gs.getMessage("The following action(s) are not supported in this release: ") + "<br/> <br/> <ul>";
    current.setAbortAction(true);

    for (var i = 0; i < result.length; i++) {
        var unsupported_field = result[i];
        if (unsupported_field.key.equals("Table") && unsupported_field.value.length > 0) {
            vMessage = vMessage + "<li> " + gs.getMessage("Unsupported table as source. Analytics is not supported on this table.") + "</li>";
            break;
        }
        else if (unsupported_field.key.equals("ExcludedTable") && unsupported_field.value.length > 0)
            vMessage = vMessage + "<li> " + gs.getMessage("You cannot create a source from this table because it is on a list of tables excluded from source creation. Please contact your system administrator.") + "</li>";
        else if (unsupported_field.key.equals("Fields Removed") && unsupported_field.value.length > 0)
            vMessage = vMessage + "<li> " + gs.getMessage("Removing fields from data sources is restricted") + "</li>";
        else if (unsupported_field.value.length > 0)
            vMessage = vMessage + "<li> " + gs.getMessage("Selected fields {0} have a type not currently supported", [JSON.stringify(unsupported_field.value)]) + "</li>";
    }
    gs.addErrorMessage(vMessage + "</ul>");
    gs.setRedirectURL(current);
    var isFormPage = GlideTransaction.get().getRequestParameter('isFormPage');
    if (!isFormPage) {
        gs.flushMessages();
    }

})(current, previous);
