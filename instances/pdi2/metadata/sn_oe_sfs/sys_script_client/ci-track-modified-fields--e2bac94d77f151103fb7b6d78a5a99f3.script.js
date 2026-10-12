function onSubmit() {
    if (g_form && !g_form.newRecord && g_form.modified) {
        Object.keys(g_form.modifiedFields).forEach(function(dataItem, index, array) {
            GlideUXMetrics.track('CI - Frequently modified fields - Open NLU Driver Language', {
                'fields': dataItem.replace(g_form.tableName + '.', '')
            });
        });
    }

}
