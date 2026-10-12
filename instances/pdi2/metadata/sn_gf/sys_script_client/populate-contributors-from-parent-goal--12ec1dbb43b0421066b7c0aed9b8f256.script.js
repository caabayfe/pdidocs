function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.getReference('goal', function(gr) {
            g_form.setValue('contributors', gr.getValue('contributors'));
        });
    }
}
