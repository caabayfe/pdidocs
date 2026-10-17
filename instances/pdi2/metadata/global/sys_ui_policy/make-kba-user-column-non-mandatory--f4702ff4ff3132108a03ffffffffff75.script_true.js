function onCondition() {
    var propValue = true;
    var gr = new GlideRecord('sys_properties');
    gr.addQuery('name', 'glide.auth_factors.kba.enable_user_column');
    gr.query();

    if (gr.next()) {
        propValue = gr.value == 'true';
    }
    g_form.setMandatory('user_column', propValue);
}
