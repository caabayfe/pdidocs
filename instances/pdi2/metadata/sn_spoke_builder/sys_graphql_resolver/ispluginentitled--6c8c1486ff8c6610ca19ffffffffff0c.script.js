(function process( /*ResolverEnvironment*/ env) {

    var plugin = env.getArguments().pluginName;
    var licenseDetails = new sn_entitlement.GlideEntitlementAPI().getLicenseDetailsForArtifact("app_id", plugin);

    if (licenseDetails) {
        return licenseDetails.getIsEntitled();
    }

    return false;
})(env);
