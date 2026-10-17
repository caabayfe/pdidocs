(function() {
    var template_sys_id = event.parm1;
    var data = JSON.parse(event.parm2);

    if (data.global)
        return;

    var payload = {
        type: 'app_template.deactivated',
        template_name: data.template_name
    };

    payload['template_sys_id'] = template_sys_id;

    if (data.users && data.users.length > 0) {
        payload['user_sys_ids'] = data.users;
    }
    if (data.groups && data.groups.length > 0) {
        payload['group_sys_ids'] = data.groups;
    }

    sn_fd.FlowAPI.executeSubflow('sn_app_eng_studio.process_app_template_email_data', payload);
})();
