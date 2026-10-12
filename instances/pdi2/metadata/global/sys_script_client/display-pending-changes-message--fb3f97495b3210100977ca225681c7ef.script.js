function onLoad() {
    if (g_form.getValue('state') == 'DRAFT') {
        g_form.addInfoMessage(getMessage('There are pending changes for this Dictionary. Click the Publish button to makes these changes take effect.'));
    }
}
