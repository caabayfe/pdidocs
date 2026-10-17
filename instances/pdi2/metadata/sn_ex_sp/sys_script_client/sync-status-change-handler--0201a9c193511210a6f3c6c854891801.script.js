function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.clearMessages();

    if (newValue === 'in_progress') {
        hideUiActions();
        g_form.addFormMessage(getMessage('Sync is in progress. Once the sync completes you will be notified via email.'), 'warning');
    } else if (newValue === 'completed') {
        g_form.addFormMessage(getMessage('Sync complete - all menu items are now up to date.'), 'info');
        GlideList2.get(g_form.getTableName() + '.sn_ex_sp_portal_extensible_navigation_item.portal_extensible_navigation').refresh();
        showUiActions();
    } else if (newValue === 'last_sync_failed') {
        g_form.addFormMessage(getMessage('Sync failed - There was a problem syncing the menu items. Please try again.'), 'info');
    }

    if (newValue === 'completed' || newValue === 'last_sync_failed') {
        setTimeout(function() {
            location.reload(true);
        }, 5000);
    }
}

    function hideUiActions() {
        g_form.hideRelatedList('sn_ex_sp_portal_extensible_navigation_item.portal_extensible_navigation');
        var isFormDisabled = g_form.isDisabled('active');
        if (!isFormDisabled) {
            sysverb_update.style.display = "none";
            sysverb_update_bottom.style.display = "none";
            sysverb_delete.style.display = "none";
            sysverb_delete_bottom.style.display = "none";
        }
    }

    function showUiActions() {
        g_form.showRelatedList('sn_ex_sp_portal_extensible_navigation_item.portal_extensible_navigation');
        var isFormDisabled = g_form.isDisabled('active');
        if (!isFormDisabled) {
            sysverb_update.style.display = "";
            sysverb_update_bottom.style.display = "";
            sysverb_delete.style.display = "";
            sysverb_delete_bottom.style.display = "";
        }
}
