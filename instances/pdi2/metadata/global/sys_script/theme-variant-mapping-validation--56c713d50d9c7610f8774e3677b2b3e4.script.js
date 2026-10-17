(function executeRule(current, previous) {
    var themeId = current.getValue('theme');
    var name = current.getValue('name');

    if (!themeId || !name) {
        return;
    }

    var hasThemeVariant = !!current.getValue('theme_variant');
    var hasUxfVariant = !!current.getValue('matching_now_experience_theme_variant');

    if (!hasThemeVariant && !hasUxfVariant) {
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            'service_portal.theme_variants',
            'Theme variant mappings must include either a Service Portal theme variant or a matching Next Experience theme variant.'
        ));
        current.setAbortAction(true);
        return;
    }

    var duplicate = new GlideRecord('m2m_sp_theme_sp_theme_variant');
    duplicate.addQuery('theme', themeId);
    duplicate.addQuery('name', name);
    duplicate.addQuery('sys_id', '!=', current.getUniqueValue());
    duplicate.query();
    if (duplicate.hasNext()) {
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            'service_portal.theme_variants',
            'A theme variant mapping named "{name}" already exists for theme "{themeName}". Choose a different name.',
            {
                name: name,
                themeName: current.theme.getDisplayValue()
            }
        ));
        current.setAbortAction(true);
        return;
    }

    if (!current.active || !hasUxfVariant) {
        return;
    }

    var theme = new GlideRecord('sp_theme');
    if (!theme.get(themeId)) {
        gs.error('Theme Variant Mapping Validation: unable to load theme {0}', themeId);
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            'service_portal.theme_variants',
            'Unable to save theme variant mapping because the associated theme could not be found.'
        ));
        current.setAbortAction(true);
        return;
    }

    var themeName = theme.getDisplayValue();
    var uxfThemeId = theme.getValue('matching_now_experience_theme');
    if (!uxfThemeId) {
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            'service_portal.theme_variants',
            'Cannot set a matching Next Experience theme variant when the theme "{themeName}" does not have a matching Next Experience theme.',
            {
                themeName: themeName
            }
        ));
        current.setAbortAction(true);
        return;
    }

    var variantId = current.getValue('matching_now_experience_theme_variant');
    var uxfMapping = new GlideRecord('m2m_theme_style');
    uxfMapping.addQuery('theme', uxfThemeId);
    uxfMapping.addQuery('style', variantId);
    uxfMapping.query();
    if (!uxfMapping.next()) {
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            'service_portal.theme_variants',
            'The selected matching Next Experience theme variant is not linked to the theme "{themeName}".',
            {
                themeName: themeName
            }
        ));
        current.setAbortAction(true);
    }
})(current, previous);
