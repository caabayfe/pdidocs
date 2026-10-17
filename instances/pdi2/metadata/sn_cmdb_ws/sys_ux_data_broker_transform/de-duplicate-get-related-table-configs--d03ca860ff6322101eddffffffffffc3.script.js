function transform(input) {

    var configList = [];
    var gr = new GlideRecord('reconcile_duplicate_related_table_config');
    if (!gr.isValid()) {
        return configList;
    }
    gr.query();
    while (gr.next()) {
        configList.push({
            'sysID': gr.getUniqueValue(),
            'tableName': gr.getValue('table'),
            'skip_business_rules': gr.getValue('skip_business_rules'),
            'ignore_errors': gr.getValue('ignore_errors')
        });
    }

    return configList;
}
