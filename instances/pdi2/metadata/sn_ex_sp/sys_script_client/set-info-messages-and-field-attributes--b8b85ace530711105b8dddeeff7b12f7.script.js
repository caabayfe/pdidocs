function onLoad() {
    // Function to handle navigation style changes
    function handleNavigationStyle() {
        var navStyle = g_form.getValue('navigation_style');
        if (navStyle === 'left') {
            g_form.setDisplay('default_icon', true);
            g_form.setMandatory('default_icon', true);
        } else {
            g_form.setDisplay('default_icon', false);
            g_form.setMandatory('default_icon', false);
        }
    }
    

    if (!g_form.isNewRecord()) {
        g_form.addInfoMessage(new GwtMessage().getMessage('When using this feature, be sure to sync any changes in the service portal menu or root topics in the active taxonomy to show them here.'));
        handleNavigationStyle();
    } else {
        g_form.addInfoMessage(new GwtMessage().getMessage('Customize menu items in a selected portal.'));
        g_form.setValue('navigation_style', 'left');
        g_form.setMandatory('default_icon', true);
    }
    
    // Add change handler for the navigation_style field
    if (g_form.getControl('navigation_style')) {
        g_form.getControl('navigation_style').onchange = function() {
            handleNavigationStyle();
        };
    }
    
    var sync_status = g_form.getValue('sync_status');
    if (sync_status === 'in_progress') {
        g_form.addFormMessage(
            getMessage('Sync is in progress. Once the sync completes you will be notified via email.'),
            'warning'
        );
    }
}
