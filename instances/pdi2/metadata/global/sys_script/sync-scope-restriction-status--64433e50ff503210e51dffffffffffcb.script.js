(function executeRule(current, previous /*null when async*/ ) {
    var userAccountScopeSysId = gs.getProperty("glide.oauth.token.scope.useraccount", "d67787c4c321011089a7dd5c2840dd6e");
    var currentAuthScope = current.getValue('auth_scope');
    var previousAuthScope = previous ? previous.getValue('auth_scope') : null;
    if (userAccountScopeSysId != currentAuthScope && userAccountScopeSysId != previousAuthScope) {
        return;
    }

    // Proceed further only if previous or current has auth_scope as user account
    var currEntity = current.getValue('oauth_entity');
    var prevEntity = previous ? previous.getValue('oauth_entity') : null;

    if ((current.operation() == 'insert' || current.operation() == 'update')) {
        if (userAccountScopeSysId == currentAuthScope) {
            updateScopeRestrictionStatus(currEntity, 'useraccount');
            gs.addWarningMessage(gs.getMessage("Overriding Scope Restriction status to User Account as the useraccount scope is configured for this entity"));
        } else {
            // current has scope different than useraccount
            // if same entity then update it to unrestricted
            if (currEntity == prevEntity)
                updateScopeRestrictionStatus(currEntity, 'unrestricted');
        }

        if (prevEntity && currEntity != prevEntity && previousAuthScope == userAccountScopeSysId)
            updateScopeRestrictionStatus(prevEntity, 'unrestricted');
    } else {
        // operation delete
        var scopeRestrictionStatus = current.oauth_entity ? String(current.oauth_entity.scope_restriction_status) : "";
        if (scopeRestrictionStatus == 'useraccount')
            updateScopeRestrictionStatus(currEntity, 'unrestricted');
    }

    function updateScopeRestrictionStatus(entitySysId, status) {
        var entityGr = new GlideRecord('oauth_entity');
        if (entityGr.get(entitySysId)) {
            entityGr.setValue('scope_restriction_status', status);
            entityGr.setWorkflow(false);
            entityGr.update();
        }
    }

})(current, previous);
