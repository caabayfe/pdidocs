function transform(input) {
    var hideMimCard = !GlidePluginManager.isActive('com.glide.identity.machine_identity_management');
    var hideGovCard = !(GlidePluginManager.isActive('com.glide.security.scripting_governance') && GlidePluginManager.isActive('com.glide.security.scripting_governance_tool') && gs.hasRole('security_admin'));
    return {
        'hideMimCard': hideMimCard,
        'hideGovCard': hideGovCard
    };
}
