function onCondition() {
    var public_client = g_form.getValue('public_client');
    var mobile_client = g_form.getValue('mobile_client');
    var client_id = g_form.getValue('client_id');
    var mobile_app_client_ids = mobileAppClientIDs();

    if (public_client == 'true' || mobile_client == 'true' || mobile_app_client_ids.includes(client_id)) {
        g_form.setDisplay('client_type', false);
    }
}

function mobileAppClientIDs() {
    var propGR = new GlideRecord('sys_properties');
    propGR.addQuery('name', 'com.glide.mobile_app_client_ids');
    propGR.query();
    if (propGR.next())
        return propGR.value;
    return '';

}
