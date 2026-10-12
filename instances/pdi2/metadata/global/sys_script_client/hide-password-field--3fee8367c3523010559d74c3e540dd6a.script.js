function onLoad() {
    var grProp = new GlideRecord('sys_properties');
    grProp.addQuery('name', 'glide.user.show.password.field');
    grProp.query();
    if (grProp.next()) {
        var showPassword = grProp.value;
        if (showPassword == 'false') {
            g_form.setDisplay('user_password', false);
        }
    }
}
