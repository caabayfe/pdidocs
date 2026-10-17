function onLoad() {
    if (g_form.getValue('entity') == '') { // User is trying to add new activity definition from direct URL
        setTimeout(function() {
            g_form.setReadOnly('field', true);
            g_form.clearOptions('field');
        }, 500);
    } else { // entity table is pre-populated when clicked on "New" button from RL
        g_form.setReadOnly('entity', true);
    }
}
