(function executeRule(current, previous /*null when async*/ ) {
    //This function will be automatically called when this rule is processed
    var direction = current.direction;
    var direction_string = "not set";
    if (direction == 2 || direction == 3)
        direction_string = "to " + current.getElement("direction").getDisplayValue().toLowerCase();

    var indicator_source_name;
    var conditions;
    var facts_table;

    var rec = new GlideRecord("pa_dm_analytics_source");
    if (rec.get(current.data_snapshot_source)) {
        indicator_source_name = rec.getValue("name");
        facts_table = rec.getValue("table");
    }

    conditions = current.getElement("conditions").getDisplayValue();

    var message = "{0} is measured {1}.\nThe goal for this indicator is {2}.\nIt is the {3} on data source {4}, which is using the table: {5}\nwith the following conditions:\n{6}";

    var parameters = [
        current.name,
        current.frequency.getDisplayValue().toLowerCase(),
        direction_string,
        current.aggregate.getDisplayValue().toLowerCase(),
        indicator_source_name,
        facts_table,
        conditions
    ];

    var description = gs.getMessage(message, parameters);

    // Fetch the indicator again to refresh the value of "id" and avoid UniqueConstraint error from DB
    var indicator = new GlideRecord(current.getTableName());
    if (indicator.get(current.sys_id)) {
        indicator.setValue('description', description);
        indicator.update();
    }


})(current, previous);
