function onClick(g_form) {
    try {
        g_aw.openRecord(g_form.getTableName(), g_form.getUniqueValue(), { "mode": "view" });
    } catch (e) {
        console.log(e);
    }
}
