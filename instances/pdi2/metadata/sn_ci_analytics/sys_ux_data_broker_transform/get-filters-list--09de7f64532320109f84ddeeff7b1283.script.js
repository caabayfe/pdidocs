function transform(input) {
    var listType = input.listType;
    var conditionsGR = new GlideRecord('sn_ci_analytics_va_condition');
    conditionsGR.addQuery('list_type', listType);
    conditionsGR.orderByDesc('sys_created_on');
    conditionsGR.query();

    var filterList = [{
        label: gs.getMessage('All'),
        id: 'all',
        source: 'default',
    }];
    while (conditionsGR.next()) {
        filterList.push({
            label: gs.getMessage(conditionsGR.getValue('name')),
            id: conditionsGR.getValue('sys_id'),
            source: conditionsGR.getValue('condition_type'),
        });
    }

    return filterList;
}
