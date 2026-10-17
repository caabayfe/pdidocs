function getDateTimeColumnLabels(input) {
    var {
        tableName
    } = input;
    if (!tableName) return [];
    var dict = new GlideTableDescriptor(tableName);
    var fields = dict.getSchema();
    var itr = fields.values().iterator();
    var dateTimeFields = [];
    while (itr.hasNext()) {
        var field = itr.next();
        if (field.getInternalType() == "glide_date_time") {
            dateTimeFields.push({
                label: field.getLabel(),
                id: field.getName(),
            });
        }
    }
    return dateTimeFields;
}
