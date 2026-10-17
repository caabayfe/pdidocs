function transform(input) {
    var offset = input.offset;
    var limit = input.limit;
    try {
        var gr = new GlideRecord("upgrade_preview_log");
        var query = "preview.sys_id=" + input.upgrade_history_sys_id + "^disposition=4^ORdisposition=10^ORdisposition=5";
        gr.addQuery(query);
        gr.orderBy("resolution");
        gr.orderBy("file_name");
        gr.chooseWindow(offset, offset + limit);
        gr.query();

        var result = [];
        var keys = ["file_name", "application_category", "resolution", "disposition", "sys_id", "priority", "plugin"];

        while (gr.next()) {
            var temp = {};
            keys.forEach(function(el) {
                temp[el] = {};
                temp[el]["displayValue"] = gr.getDisplayValue(el);
                temp[el]["value"] = gr.getValue(el);
            });

            var fileName = gr.getDisplayValue("file_name");
            var countGr = new GlideAggregate("sys_traced_metadata");
            countGr.addAggregate("COUNT");
            countGr.addQuery("file_name", fileName);
            countGr.query();

            var totalCount = 0;
            if (countGr.next()) {
                totalCount = parseInt(countGr.getAggregate("COUNT"), 10);
            }
            temp["test_count"] = totalCount;
            result.push(temp);
        }
        return result;
    } catch (error) {
        gs.info("Error in executing data broker Upgrade Management - Get Predicted Skipped Records" + error);
    }
}
