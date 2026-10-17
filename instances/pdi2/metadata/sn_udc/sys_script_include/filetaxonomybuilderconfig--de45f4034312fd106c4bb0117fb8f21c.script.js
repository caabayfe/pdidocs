class FileTaxonomyBuilderConfig {
	static type = 'FileTaxonomyBuilderConfig';
	static TABLE = 'sn_udc_file_taxonomy_builder_config';

	/**
	 * Returns GlideRecord object represents Taxonomy Builder Config
	 * @param {String} typeSysId
	 * @param {String} [builderSysId] if not specified, the default builder config will be provided
	 * @param {String} [studioPlatform] if not specific, builders with a platform set will be filtered out
	 * @returns {GlideRecord|null} GlideRecord object represents Taxonomy Builder Config
	 */
	static getRecordForTaxonomy(typeSysId, builderSysId, studioPlatform) {
		if (gs.nil(typeSysId)) return null;

		if (builderSysId) {
			// Specific builder requested - don't fall back if not found
			return FileTaxonomyBuilderConfig.getRecordForTypeSysIdAndBuilderSysId(
				typeSysId,
				builderSysId,
				studioPlatform
			);
		}
		// No specific builder - use default discovery
		return FileTaxonomyBuilderConfig.getRecordForTypeSysId(typeSysId, studioPlatform);
	}

	/**
	 * Default builder discovery
	 */
	static getRecordForTypeSysId(typeSysId, studioPlatform) {
		if (gs.nil(typeSysId))
			throw new Error(`${FileTaxonomyBuilderConfig.type}: Must specify a type`);

		const gr = new GlideRecord(FileTaxonomyBuilderConfig.TABLE);
		gr.addQuery('active', true);
		gr.addEncodedQuery(
			[
				`taxonomy_type=${typeSysId}`,
				'^builder.hidden=false',
				'^ORbuilder.hiddenISEMPTY',
				'^ORDERBYorder',
			].join('')
		);
		gr.setLimit(50); // setting an arbitrary limit
		gr.query();
		while (gr.next()) {
			const builder = gr.builder.getRefRecord();
			if (
				!builder ||
				FileTaxonomyBuilderConfig.isBuilderPlatformCompatible(builder, studioPlatform)
			)
				return gr;
		}
		return null;
	}

	/**
	 * Fetch configuration for a named builder
	 */
	static getRecordForTypeSysIdAndBuilderSysId(typeSysId, builderSysId, studioPlatform) {
		if (!builderSysId) return null;

		const gr = new GlideRecord(FileTaxonomyBuilderConfig.TABLE);
		gr.addQuery('active', true);
		gr.addEncodedQuery(
			[
				`builder=${builderSysId}`,
				`^taxonomy_type=${typeSysId}`,
				'^ORtaxonomy_typeISEMPTY',
				'^ORDERBYDESCtaxonomy_type',
			].join('')
		);
		gr.setLimit(1);
		gr.query();
		if (gr.next()) {
			const builder = gr.builder.getRefRecord();
			if (
				builder &&
				FileTaxonomyBuilderConfig.isBuilderPlatformCompatible(builder, studioPlatform)
			)
				return gr;
		}
		return null;
	}

	static isBuilderPlatformCompatible(builderGr, studioPlatform) {
		if (!builderGr)
			throw new Error(`${FileTaxonomyBuilderConfig.type}: Invalid builder record specified`);

		const builderProperties =
			FileTaxonomyBuilder.parseJSONString(builderGr.getValue('builder_properties')) || {};

		// @note: builders without a platform defined are generally available
		return (
			!builderProperties.studio_platform ||
			builderProperties.studio_platform === studioPlatform
		);
	}
}
