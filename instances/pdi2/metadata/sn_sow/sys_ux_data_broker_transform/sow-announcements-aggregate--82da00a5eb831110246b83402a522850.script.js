function transform(inputs) {
    var total = 0;
    var m2mGr = new GlideRecord('sys_ux_composite_data_m2m_datasource');
    //Fetching the EVAM definition referenced in Announcements - EVAM Data Resource to keep the total in sync.
    m2mGr.addQuery('dataset', 'bb194caac3023010965e070e9140dd50');
    m2mGr.query();
    while (m2mGr.next()) {
        var gr = new GlideRecord('sys_ux_composite_datasource');
        if (gr.get(m2mGr.datasource) && gr.active) {
            var aggGr = new GlideAggregate(gr.table);
            aggGr.addAggregate('COUNT');
            if (!aggGr.canRead())
                continue;
            aggGr.addEncodedQuery(gr.condition, true);
            aggGr.query();
            if (aggGr.next())
                total = total + parseInt(aggGr.getAggregate('COUNT'));
        }
    }

    return total;
}
