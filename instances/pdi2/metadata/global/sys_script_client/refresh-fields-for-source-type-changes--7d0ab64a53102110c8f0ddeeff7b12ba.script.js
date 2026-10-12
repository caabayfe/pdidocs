function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.clearValue('parent_entity');
    if (newValue == 'TABLE') {
        var defaultTable = g_form.getControl("table").options[0].value;
        if (defaultTable)
            g_form.setValue('table', defaultTable);
        setReadOnlyPreviewBtn(false);
    } else if (newValue == 'REPORT_SOURCE') {
        g_form.setValue('report_source', '');
        setReadOnlyPreviewBtn(true);
    } else if (newValue == 'EXTERNAL_DATA') {
        g_form.setValue('external_dataset', '');
        setReadOnlyPreviewBtn(false);
    }
}

function setReadOnlyPreviewBtn(readOnly) {
    try {
        if (readOnly) {
            jQuery('.filter-header button.sn-filter-tooltip').addClass('disabled');
            jQuery('.filter-header a').addClass('disabled');
        } else {
            jQuery('.filter-header button.sn-filter-tooltip').removeClass('disabled');
            jQuery('.filter-header a').removeClass('disabled');
        }
    } catch (e) {
        jslog(e);
    }
}
