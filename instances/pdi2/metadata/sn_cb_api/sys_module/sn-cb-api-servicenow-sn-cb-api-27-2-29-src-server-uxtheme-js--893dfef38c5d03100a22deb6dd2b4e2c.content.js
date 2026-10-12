// eslint-disable-next-line import/no-unresolved
import {GlideRecordSecure} from '@servicenow/glide';

import {
	M2M_THEME_STYLE,
	SYS_UX_STYLE,
	SYS_UX_THEME,
} from './constants/models/index.js';

export class UXTheme {
	constructor() {}

	// Private class variables
	#VARIANT_VALUE = 'variant';
	#STYLE_COL_KEY = 'style';
	#SYS_ID_COL_KEY = 'sys_id';
	#SYS_NAME_COL_KEY = 'sys_name';
	#THEME_COL_KEY = 'theme';
	#TYPE_COL_KEY = 'type';

	findVariants(themeId) {
		// Query for theme ID associated with
		const m2mThemeGR = new GlideRecordSecure(M2M_THEME_STYLE.TABLE_NAME);
		m2mThemeGR.addQuery(this.#THEME_COL_KEY, themeId);
		m2mThemeGR.query();

		// List of variants (name, id)
		const variants = [];

		if (m2mThemeGR.hasNext()) {
			while (m2mThemeGR.next()) {
				const styleSysId = m2mThemeGR.getValue(this.#STYLE_COL_KEY);

				// Fetch the style
				const styleGR = new GlideRecordSecure(SYS_UX_STYLE.TABLE_NAME);
				styleGR.addQuery(this.#SYS_ID_COL_KEY, styleSysId);
				styleGR.query();

				if (styleGR.next()) {
					// Determine if the style type is core or variant
					if (styleGR.getValue(this.#TYPE_COL_KEY) === this.#VARIANT_VALUE) {
						variants.push({
							name: styleGR.getValue(this.#SYS_NAME_COL_KEY),
							id: styleSysId,
						});
					}
				}
			}
		}

		return variants;
	}

	/**
	 * Fetch all themes from sys_ux_theme
	 *
	 * @returns
	 */
	getAllThemes() {
		const themes = [];
		// Fetch all themes from sys_ux_theme
		const themesGR = new GlideRecordSecure(SYS_UX_THEME.TABLE_NAME);
		themesGR.query();

		while (themesGR.next()) {
			// Traverse each theme and get its name and sys_id
			const name = themesGR.getValue(this.#SYS_NAME_COL_KEY);
			const id = themesGR.getValue(this.#SYS_ID_COL_KEY);

			// Add theme and its variants
			themes.push({name, id, variants: this.findVariants(id)});
		}

		return themes;
	}
}
