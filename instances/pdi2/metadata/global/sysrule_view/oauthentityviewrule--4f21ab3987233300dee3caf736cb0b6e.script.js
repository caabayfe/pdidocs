(function overrideView(view, is_list) {
    var url = gs.action.getGlideURI().getMap();
    var sysId = url.get('sys_id');
    var gr = new GlideRecord('oauth_entity');

    if (gr.get(sysId)) {
        if (gr.type == 'oauth_provider') {
            if (GlidePluginManager().isActive('com.snc.mid.enhanced_security.oauth_vault') && gr.client_id == '{stored-in-external-vault}')
                answer = 'external_credential_storage';
            else
                answer = 'oauth_provider';
        } else
            answer = "default";
    }
})(view, is_list);
