function transform(input) {
    var gr = new GlideRecord('sn_bm_common_indicator');
    gr.addQuery('generate_global_scores', true);
    gr.orderBy('category.order');
    gr.query();
    var result = {};
    while (gr.next()) {
        if (!result.hasOwnProperty(gr.category)) {
            result[gr.category] = {};
            result[gr.category]['opted_in'] = 0;
            result[gr.category]['opted_out'] = 0;
            result[gr.category]['name'] = gr.getDisplayValue('category');

        }
        if (gr.active)
            result[gr.category]['opted_in'] = result[gr.category]['opted_in'] + 1;
        else
            result[gr.category]['opted_out'] = result[gr.category]['opted_out'] + 1;

    }
    var arr = [];

    for (var key in result) {
        result[key]['sys_id'] = key;
        result[key]['total'] = result[key]['opted_in'] + result[key]['opted_out'];


        var groupGr = new GlideRecord("sn_bm_common_indicator_group");
        groupGr.addQuery('category', key);
        groupGr.orderByDesc('order');
        groupGr.query();
        groupGr.next();
        var groups = ""+groupGr.name;
        while (groupGr.next()) {
            groups = groupGr.name + ", " + groups;
        }
        result[key]['groups'] = groups;
        arr.push(result[key]);
    }

    return arr;
}
