const UXTheme = Class.create();
UXTheme.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_theme',
    FIELDS: ['name', 'type', 'sys_id'],
    FIELD_TYPE: {
        name: 'string',
        type: 'string'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPE);
    },

    /**
     * Fetch all themes from sys_ux_theme
     *
     * @returns
     */
    getAllThemes: function() {
        // Fetch all themes from sys_ux_theme
        const themes = this.getRecordsByQuery('', 'name');

        return themes ? themes.map((theme) => ({
            name: theme.name,
            id: theme.sysId,
            variants: this.findVariants(theme.sysId)
        })) : [];
    },

    findVariants: function(themeId) {
        // Query for theme ID associated with
        const m2mThemeGR = new GlideRecordSecure('m2m_theme_style');
        m2mThemeGR.addQuery('theme', themeId);
        m2mThemeGR.query();

        // List of variants (name, id)
        const variants = [];
        while (m2mThemeGR.next()) {
            const styleSysId = m2mThemeGR.getValue('style');

            // Fetch the style
            const style = this.getRecordById(styleSysId);

            // Determine if the style type is core or variant
            if (style && style.type === 'variant') {
                variants.push({
                    name: style.name,
                    id: styleSysId,
                });
            }
        }

        return variants;
    },

    type: 'UXTheme'
});
