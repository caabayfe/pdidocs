(function executeRule(current, previous /*null when async*/ ) {
    var tables = [];
    var overridedTables = gs.getProperty('glide.db.archive.no.archive.override');

    var gr = new GlideRecord('sys_dictionary');
    gr.addNullQuery('element');
    gr.addQuery('attributes', 'CONTAINS', 'no_archive');
    gr.addQuery('attributes', 'DOES NOT CONTAIN', 'no_archive=false');
    gr.query();
    while (gr.next()) {
        var table = gr.getValue('name');
        if (overridedTables) {
            if (!overridedTables.includes(table))
                tables.push(table);
        } else
            tables.push(table);
    }

    gr = new GlideRecord('sys_db_object');
	gr.addQuery("is_df_table", true);
	gr.query();
	while (gr.next()) {
        table = gr.getValue('name');
        tables.push(table);
    }

    g_scratchpad.no_archive_tables = tables;
})(current, previous);
