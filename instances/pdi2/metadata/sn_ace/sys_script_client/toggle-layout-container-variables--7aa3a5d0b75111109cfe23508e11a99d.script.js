function onLoad() {

    var DYNAMIC_LAYOUT_CONTAINER_SYS_ID = 'db739554b71111109cfe23508e11a921';
    if (g_form.getValue('type') !== DYNAMIC_LAYOUT_CONTAINER_SYS_ID)
        return;

    // Add visible fields for a display value
    var displayValueToVisibleFieldsMap = {
        'none': [],
        'flex': ['flex_direction', 'justify', 'align', 'gap'],
        'grid': ['row_template', 'column_template', 'gap'],
    };

    function _setDisplay(fields, isVisible) {
        var fieldNames = fields || [];
        fieldNames.forEach(function(fieldName) {
            g_form.setDisplay(fieldName, isVisible);
        });
    }

    function toggleRelevantVariables() {
        var displayValue = g_form.getValue('display');
        for (var displayValueKey in displayValueToVisibleFieldsMap) {
            if (displayValueKey !== displayValue)
                _setDisplay(displayValueToVisibleFieldsMap[displayValueKey], false);
        }
        _setDisplay(displayValueToVisibleFieldsMap[displayValue], true);
    }

    // Toggling on load
    toggleRelevantVariables();

    // Toggling on display selection change. This works only for Desktop UI
    var displaySelectElement = g_form.getElement('display');
    if (displaySelectElement) {
        displaySelectElement.onchange = toggleRelevantVariables;
    }
    
    // For non-desktop UI types, onchange event does not fire. Workaround is request user to update the record
    if (!g_form.isNewRecord())
        g_form.addInfoMessage('Additional customizations can be added after updating the record');

    /**
        More apis to explore:
        g_form.onUserChangeValue(toggleRelevantVariables);
        setInterval(toggleRelevantVariables, 1000);
    **/

}
