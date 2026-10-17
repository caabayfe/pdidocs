function onCondition() {
    try {
        if (g_form.isNewRecord()) {
            g_form.setValue('show_summary', true);
        }
    } catch (e) {

    }
}
