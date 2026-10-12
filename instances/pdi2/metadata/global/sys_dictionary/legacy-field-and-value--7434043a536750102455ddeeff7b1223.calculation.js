(function calculatedFieldValue(current) {
    //get display name of column
    var output = '';
    var colGr = new GlideRecord('sys_dictionary');
    colGr.addQuery('name', current.table);
    colGr.addQuery('element', current.legacy_field_name);
    colGr.query();
    if (colGr.next()) {
        output += colGr.getValue('column_label') + " - ";
    } else {
        output += current.legacy_field_name + " - ";
    }

    //get display name of value
    var lang = gs.getSession().getLanguage();
    var tables = new LifeCycleUtil().getParents(current.table);
    tables.unshift(current.table);

    var result = {};
    var gr = new GlideRecord('sys_choice');
    gr.addQuery('language', lang);
    gr.addQuery('name', 'IN', tables);
    gr.addQuery('element', current.legacy_field_name);
    gr.addQuery('value', current.legacy_field_value);
    gr.query();
    while (gr.next()) {
        result[gr.getValue('name')] = gr.getValue('label');
    }

    var labelOutput = '';
    for (var key in tables) {
        if (result.hasOwnProperty(tables[key])) {
            labelOutput = result[tables[key]];
            break;
        }
    }

    if (JSUtil.nil(labelOutput)) {
        output += current.legacy_field_value;
    } else {
        output += labelOutput;
    }

    return output;

})(current);
