function transform(input) {
    var returnVal = {};
    var all_actions = [];
    var items = [];
    var viewConfigGr = {};
    var selectedTable = input.selectedTable;
    input.relatedRecords
        .forEach(function(item) {
            viewConfigGr = new sn_uib_dyn_rel_rec.RelatedRecordsUtil().getMatchingViewConfig(selectedTable, item._row_data.uniqueValue);
            var relatedRecordGr = new GlideRecordSecure(selectedTable);
            relatedRecordGr.get(item._row_data.uniqueValue);
            if (viewConfigGr)
                items.push(new sn_uib_dyn_rel_rec.RelatedRecordsUtil().getConfigFieldsTemplate(relatedRecordGr, viewConfigGr));
            else
                gs.info(gs.getMessage("No matching view config record found for {0}", selectedTable));
        });
    returnVal.items = items;
    if (viewConfigGr)
        returnVal.all_actions = new sn_uib_dyn_rel_rec.RelatedRecordsUtil().getAllActionsForViewConfig(viewConfigGr);
    else
        gs.info(gs.getMessage("No matching view config record found for {0}", selectedTable));
    return returnVal;
}
