(function() {
    data.portalId = $sp.getValue('sys_id');
    data.themeVariantMappings = getThemeVariants();
    data.themeVariantMappingId = $sp.getUserThemeVariant(data.portalId);

    var cssStyles = "$brand-primary,$brand-primary-darker,$body-bg,$background-primary,$background-secondary,$border-primary,$border-tertiary,$text-tertiary";
    var resolvedCss = {};
    data.themeVariantMappings.forEach(function(variant){
        resolvedCss[variant.sys_id] = $sp.getResolvedVariantStyles(variant.sys_id, cssStyles);
    });
    data.variantStyles = resolvedCss;

    if(input){
        if(input.action === "changeVariant"){
            if(input.variantId != data.themeVariantMappingId){
                if (gs.getSession().isLoggedIn()) {
                    gs.getUser().savePreference('sp.theme_variant_mapping.' + data.portalId, input.clearProperty ? null : input.variantId);
                } else {
                    gs.getSession().putProperty('sp.theme_variant_mapping.' + data.portalId, input.clearProperty ? null : input.variantId);
                }
                data.success = true;
            }
        }
    }

    function getThemeVariants() {
        var variantMappings = JSON.parse($sp.getPortalM2mThemeSysIds($sp.getValue('sys_id')));
		var themeName = $sp.getDisplayValue('theme');
		var defaultText = gs.getMessage("Default");
		var defaultVariant = themeName + " " + defaultText;
		if(variantMappings.length > 0)
			variantMappings.unshift({
				name: defaultVariant,
				sys_id: ""
			});
        return variantMappings;
    }
})();
