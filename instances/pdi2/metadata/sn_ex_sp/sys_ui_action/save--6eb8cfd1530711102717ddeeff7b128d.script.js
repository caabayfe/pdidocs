function formSaveConfirmationDialog() {
    var messageMap = new GwtMessage().getMessages(["Start with current navigation menu", "Skip", "Yes"]);
    var dialog = new GlideModal('glide_modal_confirm', false, 400);
    dialog.setTitle(messageMap["Start with current navigation menu"]);
    dialog.setPreference('body', new GwtMessage().getMessage("To help you get started, we can bring over your existing navigation menu items and you can edit from there. You can also skip this and start from scratch. Do you want to bring over your current menu now?"));
    dialog.setPreference('buttonLabelComplete', messageMap["Yes"]);
    dialog.setPreference('onPromptComplete', onConfirm);
    dialog.setPreference('buttonLabelCancel', messageMap["Skip"]);
    dialog.setPreference('onPromptCancel', onCancel);
    dialog.render();

    function onConfirm() {
        gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
        var ga = new GlideAjax('PortalExtensibleNavigationAjax');
        ga.addParam('sysparm_name', 'fetchPortalMenuItemsData');
        ga.addParam('sysparm_sysId', g_form.getUniqueValue());
        ga.addParam('sysparm_portal', g_form.getValue('portal'));
        ga.addParam('sysparm_active', g_form.getValue('active'));
        ga.addParam('sysparm_navigationStyle', g_form.getValue('navigation_style'));
        ga.getXML(ajaxCallback);
    }

    function onCancel() {
        gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
    }

    function ajaxCallback(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer == 'true') {
            GlideList2.get(g_form.getTableName() + '.sn_ex_sp_portal_extensible_navigation_item.portal_extensible_navigation');
        }
    }
}
