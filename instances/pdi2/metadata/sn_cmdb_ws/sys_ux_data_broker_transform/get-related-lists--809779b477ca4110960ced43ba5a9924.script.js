function transform(input) {

    var workspaceId = input.workspaceId;
    var configIdentifierId = input.configIdentifierId;

    var SORT_DIRECTION = {
        ASC: "asc",
        DESC: "desc",
        ASCENDING: gs.getMessage("Ascending"),
        DESCENDING: gs.getMessage("Descending")
    };

    var result = {
        errors: [],
        relatedLists: []
    };

    try {
        var tmpResult = new UnifiedMapHelper().getRelatedList(workspaceId, configIdentifierId);
        if (tmpResult.success) {
            var lists = tmpResult.result;
            var allSelectComponentData = {};
            lists.forEach(function(record) {
                var selectComponentData = [];
                var sortFieldArray = record.sort_fields ? record.sort_fields.split(",") : [];
                sortFieldArray.forEach(function(sortField) {
                    // push a Descending and Ascending sort for each sort field to the sort select item data
                    var gr = new GlideRecord(record.tableName + "");
                    var label = gr.getElement(sortField + "").getLabel();
                    selectComponentData.push({
                        id: sortField,
                        label: label
                    });
                });
                allSelectComponentData[record.sys_id] = selectComponentData;
            });
            result.relatedLists = {
                original: lists,
                allSelectComponentData: allSelectComponentData
            };
        } else {
            //TODO: map with user-friendly error messages WRT tmpResult.error.code
            result.errors.push(tmpResult.error.message);
        }
    } catch (error) {
        result.errors.push(error.toString());
    }

    return result;
}
