(function() {
    var template_sys_id = event.parm1;
    var data = JSON.parse(event.parm2);

    var templateGR = new GlideRecord('sys_app_template');

    // Exit if template doesn't exist
    if (!templateGR.get(template_sys_id))
        return;

    if (data.company)
        return;

    var payload = {
        type: 'app_template.unshared',
		template_name: templateGR.getValue('name')
    };

    payload['template_sys_id'] = template_sys_id;

    if (data.user) {
        payload['user_sys_ids'] = [data.user];
    }
    if (data.user_group) {
        payload['group_sys_ids'] = [data.user_group];
    }

    sn_fd.FlowAPI.executeSubflow('sn_app_eng_studio.process_app_template_email_data', payload);
})();
