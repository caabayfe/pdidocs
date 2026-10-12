function transform(input) {
    var res = "";
    var gr = new GlideRecord('sys_properties');
    if (gr.get('name', 'sn_vsc.configure_security_banner_announcements')) {
    gr.setValue('value', input.data);
    var isUpdated = gr.update();
    if (isUpdated != null)
        res = 'success';
    else
        res = 'fail';

    }
    return res;
}
