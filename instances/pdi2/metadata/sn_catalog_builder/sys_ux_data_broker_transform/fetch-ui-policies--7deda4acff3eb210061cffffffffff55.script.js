function transform(input) {
    var catItemId = input.itemId;
    var hasAiGeneratedRecords = false;

    if (catItemId) {
        var recordIds = [];
        var cbAnalyticRecord = new GlideRecord("catalog_builder_analytics");
        cbAnalyticRecord.addQuery("action_type", "ai_assisted_ui_policy");
        cbAnalyticRecord.addQuery("cat_item", catItemId);
        cbAnalyticRecord.query();
        while (cbAnalyticRecord.next()) {
            var _recordId = cbAnalyticRecord.getValue("document_id");
            if (!GlideStringUtil.isEligibleSysID(_recordId))
                continue;
            recordIds.push(_recordId);
        }

        if (recordIds.length > 0) {
            var activeRecords = new GlideAggregate("catalog_ui_policy");
            activeRecords.addAggregate('COUNT');
            activeRecords.addQuery("active", true);
            activeRecords.addQuery("catalog_item", catItemId);
            activeRecords.addQuery("sys_id", recordIds);
            activeRecords.query();
            if (activeRecords.next()) {
                hasAiGeneratedRecords = activeRecords.getAggregate('COUNT') > 0;
            }
        }
    }

    return {
        hasAiGeneratedRecords: hasAiGeneratedRecords
    };
}
