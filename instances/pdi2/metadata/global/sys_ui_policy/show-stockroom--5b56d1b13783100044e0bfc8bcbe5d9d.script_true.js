function onCondition() {
    if (g_form.getTableName() !== 'alm_license') {
        g_form.setMandatory('stockroom', true);
    }
}
