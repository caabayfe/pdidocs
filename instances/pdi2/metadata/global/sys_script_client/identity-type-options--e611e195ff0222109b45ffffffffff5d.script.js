function onLoad() {
    var isNewRecord = g_form.isNewRecord();
    var isAIUserAdmin = g_user.hasRole('ai_user_admin') && !g_user.hasRole('user_admin');
    if (isAIUserAdmin) {
        handleAIUserAdminCase(isNewRecord);
        return;
    }
    if (isNewRecord) {
        removeIdentityTypeOptions(['unclassified', '']);
        g_form.setValue('identity_type', 'human');
        return;
    }

    var identityType = g_form.getValue('identity_type');
    if (identityType) {
        removeIdentityTypeOptions(['']);
        configureOptionsByIdentityType(identityType);
    } else {
        // edge case: if identity_type is empty in database
        removeIdentityTypeOptions(['unclassified', 'ai_agent']);
    }
}
    
/**
 * Handles form behavior for ai_user_admin role
 * @param {boolean} isNewRecord - Whether this is a new record
 */
function handleAIUserAdminCase(isNewRecord) {
	g_form.setReadOnly('identity_type', true);
	if (isNewRecord) {
		g_form.setValue('identity_type', 'ai_agent');
	}
}

function removeIdentityTypeOptions(options) {
    options.forEach(function(option) {
        g_form.removeOption('identity_type', option);
    });
}

function configureOptionsByIdentityType(identityType) {
    switch (identityType) {
        case 'machine':
            removeIdentityTypeOptions(['unclassified', 'ai_agent']);
            break;

        case 'unclassified':
            removeIdentityTypeOptions(['ai_agent']);
            break;

        case 'human':
            removeIdentityTypeOptions(['unclassified', 'ai_agent']);
            break;

        case 'ai_agent':
            g_form.setReadOnly('identity_type', true);
            break;
    }
}
