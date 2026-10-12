function onCondition() {
    var currentState = g_form.getValue('state');

    var validTransitions = {
        'pre_activation': ['pre_activation', 'active', 'suspended', 'compromised', 'deactivated'],
        'active': ['active', 'suspended', 'compromised', 'deactivated'],
        'suspended': ['suspended', 'active', 'compromised', 'deactivated'],
        'compromised': ['compromised'],
        'deactivated': ['deactivated', 'active', 'compromised']
    };

    var allValues = ['pre_activation', 'active', 'suspended', 'compromised', 'deactivated'];
    var allowed = validTransitions[currentState] || allValues;

    for (var i = 0; i < allValues.length; i++) {
        if (allowed.indexOf(allValues[i]) === -1) {
            g_form.removeOption('state', allValues[i]);
        }
    }

    if (currentState === 'compromised') {
        g_form.setReadOnly('state', true);
    }
}
