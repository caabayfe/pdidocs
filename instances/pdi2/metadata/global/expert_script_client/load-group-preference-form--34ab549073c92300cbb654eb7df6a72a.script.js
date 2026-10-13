function onLoad() {
    showLoadingDialog();

    hideGroupField();

    //this fields are needed to be carry over values to and from next and previous panels
    g_form.setDisplay('group_preferences_modified', false);
    g_form.setDisplay('rota_managers', false);
    g_form.setDisplay('pto_approval_config', false);
    g_form.setDisplay('allow_rota_overlap', false);
    g_form.setDisplay('escalation_rule_rota_overlap', false);

    var groupPrefGr = new GlideRecord('on_call_group_preference');
    groupPrefGr.addQuery('group', g_form.getValue('group') + "");
    groupPrefGr.query(function(gr) {
        var groupPreferenceSysId;
        if (gr.next())
            groupPreferenceSysId = gr.sys_id + "";
        else
            groupPreferenceSysId = "-1";

        var iframe = gel('on-call-group-preference');
        var params = {};
        params.sys_id = groupPreferenceSysId;
        params.sysparm_stack = 'no';
        params.sysparm_link_less = true;
        params.sysparm_titleless = true;
        params.sysparm_view = 'on_call_wizard';
        params.sysparm_view_forced = true;
        params.sysparm_goto_url = '$on_call_form_saved.do';
        iframe.setAttribute('src', '/on_call_group_preference.do?' + convertObjectToUrlParams(params));

        hideLoadingDialog();
    });

}

function hideGroupField() {
    //this field is needed to be carried over from the previous panel
    //but we don't want it to be visible
    g_form.setDisplay('group', false);
}

function convertObjectToUrlParams(obj) {
    return Object.keys(obj).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
    }).join('&');
}

function hideLoadingDialog() {
    loadingDialog.destroy();
}

function showLoadingDialog() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    loadingDialog = new dialogClass("dialog_loading", true, 300);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.render();
}
