function transform(input) {
    var list = input.graphqlData;
    var results = [];

    for (var i = 0; i < list.length; i++) {
        var data = {};

        var item = list[i];
        var hasSysId = !gs.nil(item.sys_id) && !gs.nil(item.sys_id.value);
        var hasTitle = !gs.nil(item.title) && !gs.nil(item.title.value);
        var hasCatalog = !gs.nil(item.sc_catalog) && !gs.nil(item.sc_catalog.displayValue);

        if (hasSysId && (hasTitle || hasCatalog)) {
            data['id'] = item.sys_id.value;

            if (hasTitle) {
                data['label'] = item.title.value;
            }

            if (hasCatalog) {
                data['sublabel'] = item.sc_catalog.displayValue;
            }

            results.push(data);
        }
    }

    return results;
}
