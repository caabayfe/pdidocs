(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    class MobileUXThemeService {
        getMobileUXThemes(mobileThemeIds) {
            const transformedThemes = [];
            mobileThemeIds.forEach((themeId) => {
                const baseThemeGr = this.getBaseThemeGr(themeId);
                if (!baseThemeGr) return;
                const baseTheme = this.formatTheme(baseThemeGr);
                const variantGr = this.getDarkVariantGr(themeId);
                if (variantGr) {
                    transformedThemes.push({
                        ...baseTheme,
                        isDark: false,
                        hasVariant: variantGr.getDisplayValue('style'),
                    });
                    transformedThemes.push({
                        id: variantGr.getValue('style'),
                        label: baseTheme.label,
                        parentThemeId: baseTheme.id,
                        isDark: true,
                    });
                } else {
                    transformedThemes.push(baseTheme);
                }
            });
            return transformedThemes;
        }
        
        getBaseThemeGr(themeId) {
            const gr = new GlideRecord('sys_ux_theme');
            return gr.get(themeId) && gr.isValidRecord() ? gr : null;
        }
        
        getDarkVariantGr(themeId) {
            const gr = new GlideRecord('m2m_theme_style');
            gr.addEncodedQuery(`theme=${themeId}^style.type=variant^style.name=Dark`);
            gr.query();
            return gr.next() ? gr : null;
        }
        
        formatTheme(themeGr) {
            return {
                id: themeGr.getUniqueValue(),
                label: themeGr.getDisplayValue(),
            };
        }
    }

    var mobileThemeIds = new sn_mobile_theme.MobileThemeColorAPI().getMobileThemeIds();
    try {
        return new MobileUXThemeService().getMobileUXThemes(mobileThemeIds);
    } catch (error) {
        new ErrorHandler().throwSnWsError(error);
    }
})(request, response);
