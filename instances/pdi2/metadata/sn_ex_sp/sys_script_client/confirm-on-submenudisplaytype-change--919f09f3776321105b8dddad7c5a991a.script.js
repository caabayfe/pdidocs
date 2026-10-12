var gFormAlreadySubmitted = false;

function onSubmit() {
    var submenuType = g_form.getValue('submenu_type');
    var depth = Number(g_scratchpad.nav_item_depth);

    if (g_form.isNewRecord() || !g_scratchpad.top_nav_item_display_type || submenuType === g_scratchpad.top_nav_item_display_type || depth != 0) {
        return true;
    }

    if (!gFormAlreadySubmitted) {
        var dialog = new GlideModal('glide_modal_confirm', true, 400);
        dialog.setTitle(new GwtMessage().getMessage('Confirm update'));
        dialog.setPreference('body', new GwtMessage().getMessage("Changing submenu display type will change the way submenus display in the navigation menu. You may also have to reconfigure your quick links to make sure they show the way you want them to. Do you want to continue with this change?"));
        dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('Yes'));
        dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('Cancel'));
        dialog.setPreference('onPromptComplete', onConfirm);
        dialog.setPreference('onPromptCancel', function() {});
        dialog.render();
        return false;
    }

    function onConfirm() {
        gFormAlreadySubmitted = true;
        gsftSubmit(undefined, undefined, g_form.getActionName());
    }

}
