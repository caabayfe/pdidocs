const ThemeM2M = Class.create();
ThemeM2M.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'm2m_app_config_theme',
    FIELDS: ['theme'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },

    updateRecord: function({
        adminPanelID,
        primaryThemeId
    }) {
		if (primaryThemeId !== null) {
            const themeEncodedQuery = `ux_app_configuration=${adminPanelID}`;
            if (primaryThemeId === '') {
                this.deleteRecordsByEncodedQuery(`${themeEncodedQuery}^order=0`);
            }
			let themeM2Mid = '';
            const fieldValues = {
                ux_app_configuration: adminPanelID,
                theme: primaryThemeId,
                order: 0
            };
            const themeGR = this.getRecordsByQuery(themeEncodedQuery, 'order', true);
            if (themeGR && themeGR.next()) {
                if (themeGR.canWrite()) {
                    this.setFieldValues(themeGR, fieldValues);
                    themeM2Mid = themeGR.update();
                }
            } else {
				themeM2Mid = this.createRecord(fieldValues);
            }
			return themeM2Mid;
        }
    },

    type: 'ThemeM2M'
});
