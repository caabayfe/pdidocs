function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    g_form.getReference('taxonomy', function(grTaxonomy) {
        if (grTaxonomy.currentRow !== -1 && grTaxonomy.rows.length !== 0) {
            g_form.setValue('table', grTaxonomy.getValue("table"));
        } else {
            g_form.setValue('table', null);
        }
    });
}
