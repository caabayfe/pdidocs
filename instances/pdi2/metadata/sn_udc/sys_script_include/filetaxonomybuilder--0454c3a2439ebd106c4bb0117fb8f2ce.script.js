class FileTaxonomyBuilder {
	static type = 'FileTaxonomyBuilder';
	static TABLE = 'sn_udc_file_taxonomy_builder';
	static WHITE_LISTED_FIELD_NAMES = [
		'sys_id',
		'name',
		'sys_class_name',
		'view',
		'admin_panel',
		'sc_template',
		'sys_scope',
		'skill_id',
		'id',
		'endpoint',
		'subtitle',
	];
	static DEFAULT_BUILDER = '4cc7ada7439231106c4bb0117fb8f2b1'; // Platform UI-16 Form
	static BUILDER_CONFIG_TABLE = 'sn_udc_file_taxonomy_builder_config';
	static TAXONOMY_BUILDERS_SCOPED_CACHE_NAME = 'Taxonomy Builders';
	static COLUMNS = {
		SYS_ID: 'sys_id',
		ACTIVE: 'active',
		NAME: 'name',
		LABEL: 'label',
		DESCRIPTION: 'description',
		ICON: 'icon',
		HOME_PATH: 'home_path',
		CREATE_PATH: 'create_path',
		EDIT_PATH: 'edit_path',
		PREVIEW_PATH: 'preview_path',
		BUILDER_PROPERTIES: 'builder_properties',
		DOCUMENTATION_URL: 'documentation_url',
		COMMUNITY_URL: 'community_url',
		TAXONOMY_TYPE: 'taxonomy_type',
		HIDDEN: 'hidden',
		ORDER: 'order',
	};

	static #LOG = new Logger(FileTaxonomyBuilder.type);

	// this contains both cached and non-cached builders
	static #allBuildersCache = null;

	/**
	 * Returns builder details
	 * @param {String} builder It can be either builder name or sysId
	 * @returns {Object}
	 */
	static getBuilderDetails(builder) {
		// Find Taxonomy Builder record either with builderSysId (or) builderName
		const builderGr = FileTaxonomyBuilder.getRecordForSysIdORName(builder);
		const builderSysId = builderGr ? builderGr.getUniqueValue() : '';

		try {
			// Builder home page
			if (!builderSysId && !builderGr) throw UDCConstants.errors.BUILDER_DOES_NOT_EXISTS;

			return {
				name: builderGr.getValue(FileTaxonomyBuilder.COLUMNS.NAME) || '',
				label: builderGr.getDisplayValue(FileTaxonomyBuilder.COLUMNS.LABEL) || '',
				sysId: builderSysId,
				icon:
					builderGr.getDisplayValue(FileTaxonomyBuilder.COLUMNS.ICON) ||
					UDCConstants.fallbackIcons.TOOL,
				url: UDCUtil.createCanonicalizedUri(
					builderGr.getValue(FileTaxonomyBuilder.COLUMNS.HOME_PATH)
				),
				homePath: UDCUtil.createCanonicalizedUri(
					builderGr.getValue(FileTaxonomyBuilder.COLUMNS.HOME_PATH)
				),
				documentationUrl:
					builderGr.getValue(FileTaxonomyBuilder.COLUMNS.DOCUMENTATION_URL) || '',
				properties: FileTaxonomyBuilder.parseJSONString(
					builderGr.getValue(FileTaxonomyBuilder.COLUMNS.BUILDER_PROPERTIES)
				),
			};
		} catch (e) {
			let message;
			let code;

			switch (e) {
				case UDCConstants.errors.BUILDER_DOES_NOT_EXISTS:
					message = gs.getMessage(
						'Builder not found: Check Builder name for any errors before trying again.'
					);
					code = 404;
					break;

				default:
					message = gs.getMessage('Unhandled exception: {0}', [e]);
					code = 500;
					break;
			}

			return {
				name: builder,
				error: {
					message,
					code,
				},
			};
		}
	}

	/**
	 * Retrieves parsed JSON object
	 * @param {string} jsonStr
	 * @returns {Object} parsed JSON value
	 */
	static parseJSONString(jsonStr) {
		try {
			return JSON.parse(jsonStr);
		} catch (e) {
			return {};
		}
	}

	/**
	 * Get object of builder detail using builder Gliderecord
	 * @param {GlideRecord} gr, GlideRecord object represent taxonomy builder record
	 * @returns {Object} object of builder details
	 */
	static getBuilderDetailsFromGr(gr) {
		return {
			sysId: gr.getUniqueValue(),
			name: gr.getValue(FileTaxonomyBuilder.COLUMNS.NAME),
			label: gr.getDisplayValue(FileTaxonomyBuilder.COLUMNS.LABEL) || '',
			description: gr.getDisplayValue(FileTaxonomyBuilder.COLUMNS.DESCRIPTION) || '',
			icon:
				gr.getDisplayValue(FileTaxonomyBuilder.COLUMNS.ICON) ||
				UDCConstants.fallbackIcons.TOOL,
			homePath: UDCUtil.createCanonicalizedUri(
				gr.getValue(FileTaxonomyBuilder.COLUMNS.HOME_PATH)
			),
			documentationUrl: gr.getValue(FileTaxonomyBuilder.COLUMNS.DOCUMENTATION_URL) || '',
			communityUrl: gr.getValue(FileTaxonomyBuilder.COLUMNS.COMMUNITY_URL) || '',
			properties: FileTaxonomyBuilder.parseJSONString(
				gr.getValue(FileTaxonomyBuilder.COLUMNS.BUILDER_PROPERTIES)
			),
		};
	}

	/**
	 * Retrieves types and tables based on tools
	 * @returns {Map} hash map of key as builderSysId and value as object with typeSysId and tableName
	 */
	static getTypeRecordsForBuilders() {
		const builderTypes = new Map();
		const builderGr = new GlideRecord(FileTaxonomyBuilder.BUILDER_CONFIG_TABLE);
		builderGr.addQuery(FileTaxonomyBuilder.COLUMNS.ACTIVE, true);
		builderGr.query();

		while (builderGr.next()) {
			const builderSysId = builderGr.getValue('builder');
			const typeSysId = builderGr.getValue(FileTaxonomyBuilder.COLUMNS.TAXONOMY_TYPE);
			const type = builderGr.taxonomy_type.getRefRecord();
			if (!UDCUtil.isValidGlideRecord(type)) continue;
			const configRecord = {
				typeSysId,
				tableName: type.getValue('table'),
				order: builderGr.getValue(FileTaxonomyBuilder.COLUMNS.ORDER),
			};
			if (builderTypes.has(builderSysId)) builderTypes.get(builderSysId).push(configRecord);
			else builderTypes.set(builderSysId, [configRecord]);
		}
		return builderTypes;
	}

	/**
	 * Retrieves list of categories based on builder
	 * @param {Map} typeCategory
	 * @param {Map} builderTypes
	 * @param {String} builderId
	 * @returns {Array} array of builders
	 */
	static getCategoriesForBuilder(typeCategory, builderTypes, builderId) {
		const builderCategories = [];
		if (typeCategory && builderTypes && builderId) {
			const typesForBuilderId =
				(builderTypes.has(builderId) && builderTypes.get(builderId)) || [];
			if (typesForBuilderId.length) {
				typesForBuilderId.forEach(type => {
					const categories = typeCategory.get(type.typeSysId) || [];
					if (categories.length) {
						categories.forEach(category => {
							if (
								!builderCategories.some(element => element.sysId === category.sysId)
							)
								builderCategories.push(category);
						});
					}
				});
			}
		}
		return builderCategories;
	}

	/**
	 * Retrieves list of tools
	 * @returns {Array} array of builders
	 */
	static getBuilders(options = {}) {
		const isIncludeCategory = options?.include_categories === 'true';
		const isIncludeMetadataTables = options?.include_metadata_tables === 'true';
		const cacheEntryKeyName = FileTaxonomyBuilder.#getCacheEntryKeyName(
			isIncludeCategory,
			isIncludeMetadataTables
		);
		const result = UDCCache.get(
			FileTaxonomyBuilder.TAXONOMY_BUILDERS_SCOPED_CACHE_NAME,
			cacheEntryKeyName
		);

		if (!result) {
			const builders = [];
			const typeCategories =
				isIncludeCategory && FileTaxonomyCategoryMap.getCatagoriesForType();
			const builderTypes =
				(isIncludeCategory || isIncludeMetadataTables) &&
				FileTaxonomyBuilder.getTypeRecordsForBuilders();
			const gr = new GlideRecord(FileTaxonomyBuilder.TABLE);
			gr.addActiveQuery();
			gr.addEncodedQuery(
				`${FileTaxonomyBuilder.COLUMNS.HOME_PATH}ISNOTEMPTY^OR${FileTaxonomyBuilder.COLUMNS.DOCUMENTATION_URL}ISNOTEMPTY`
			);
			gr.addEncodedQuery(
				`${FileTaxonomyBuilder.COLUMNS.HIDDEN}=false^OR${FileTaxonomyBuilder.COLUMNS.HIDDEN}ISEMPTY`
			);
			gr.orderBy(FileTaxonomyBuilder.COLUMNS.LABEL);
			gr.query();
			while (gr.next()) {
				const builderSysId = gr.getUniqueValue();
				const builderDetails = FileTaxonomyBuilder.getBuilderDetailsFromGr(gr);
				if (isIncludeCategory) {
					builderDetails.categories = FileTaxonomyBuilder.getCategoriesForBuilder(
						typeCategories,
						builderTypes,
						builderSysId
					);
				}
				if (isIncludeMetadataTables)
					builderDetails.metadataTables = builderTypes.get(builderSysId) || [];

				builders.push(builderDetails);
			}
			UDCCache.put(
				FileTaxonomyBuilder.TAXONOMY_BUILDERS_SCOPED_CACHE_NAME,
				cacheEntryKeyName,
				builders
			);
			return builders;
		}

		return result;
	}

	/**
	 * Returns GlideRecord object represents Taxonomy Builder
	 * @param {String} builderSysId
	 * @returns {GlideRecord|null} GlideRecord object represents Taxonomy Builder
	 */
	static getRecordForSysId(builderSysId) {
		const gr = new GlideRecord(FileTaxonomyBuilder.TABLE);
		if (gr.get(builderSysId)) return gr;
		return null;
	}

	/**
	 * Returns GlideRecord object represents Taxonomy Builder
	 * @param {String} builderName
	 * @returns {GlideRecord|null} GlideRecord object represents Taxonomy Builder
	 */
	static getRecordForName(builderName) {
		const gr = new GlideRecord(FileTaxonomyBuilder.TABLE);
		if (gr.get(FileTaxonomyBuilder.COLUMNS.NAME, builderName)) return gr;
		return null;
	}

	/**
	 * Get GlideRecord object for sn_udc_file_taxonomy_builder record
	 * @param {String} builder builderName (or) builderSysId
	 * @returns {GlideRecord|null} GlideRecord object represents Taxonomy Builder
	 */
	static getRecordForSysIdORName(builder) {
		if (gs.nil(builder)) return null;
		const gr = new GlideRecord(FileTaxonomyBuilder.TABLE);
		gr.addEncodedQuery(
			`${FileTaxonomyBuilder.COLUMNS.SYS_ID}=${builder}^OR${FileTaxonomyBuilder.COLUMNS.NAME}=${builder}`
		);
		gr.addQuery(FileTaxonomyBuilder.COLUMNS.ACTIVE, true);
		gr.setLimit(1);
		gr.query();
		if (gr.next()) return gr;
		return null;
	}

	/**
	 * Returns interpolated URL
	 * @param {String} rawUrl
	 * @param {GlideRecord} fileObjectRecord
	 * @returns {String} interpolated URL
	 */
	static getInterpolatedUrl(rawUrl, fileObjectRecord, fileDetailsFromScript) {
		if (!rawUrl.includes('${')) return rawUrl;
		let interpolatedUrl = rawUrl;
		// Find the ${} parameters embedded in the url
		const interpolatedFieldsRegEx = /\$\{(.*?)}/g;
		let match = interpolatedFieldsRegEx.exec(rawUrl);

		while (match !== null) {
			const replacementStr = match[0];
			const interpolatedFieldName = match[1];
			let interpolatedFieldValue = '';

			if (interpolatedFieldName === 'table') {
				interpolatedFieldValue = encodeURIComponent(fileObjectRecord.getTableName());
				interpolatedUrl = interpolatedUrl.replace(replacementStr, interpolatedFieldValue);
			} else if (interpolatedFieldName === 'sys_scope_name') {
				interpolatedFieldValue = encodeURIComponent(fileObjectRecord.sys_scope.scope);
				interpolatedUrl = interpolatedUrl.replace(replacementStr, interpolatedFieldValue);
			} else if (
				FileTaxonomyBuilder.WHITE_LISTED_FIELD_NAMES.includes(interpolatedFieldName)
			) {
				let value = fileObjectRecord.getValue(interpolatedFieldName);
				if (gs.nil(value) && fileDetailsFromScript)
					value = fileDetailsFromScript[interpolatedFieldName];

				interpolatedFieldValue = encodeURIComponent(value);
				interpolatedUrl = interpolatedUrl.replace(replacementStr, interpolatedFieldValue);
			} else gs.info(`Field ${interpolatedFieldName} is not whitelisted`);

			match = interpolatedFieldsRegEx.exec(rawUrl);
		}
		return interpolatedUrl;
	}

	/**
	 * Substitutes dynamic parameters in a given URL with values from additionalParams.
	 *
	 * This function processes two types of dynamic parameters:
	 * 1. `${uxfOptionalParams:...}` - Optional parameters that are included only if they have values in additionalParams.
	 * 2. `${...}` - Regular parameters that are directly substituted with values from additionalParams.
	 * Remaining additional params are added to the query string.
	 *
	 * @param {string} rawUrl - The URL string containing dynamic parameters to be substituted.
	 * @param {Object} additionalParams - An object containing key-value pairs for substitution.
	 * @returns {string} - The URL with substituted dynamic parameters.
	 */
	static substituteDynamicParams(rawUrl = '', additionalParams) {
		if (!rawUrl) {
			return {
				url: '',
				builderUrlPathParams: [],
			};
		}

		if (!rawUrl.includes('${') && gs.nil(additionalParams)) {
			return {
				url: rawUrl,
				builderUrlPathParams: [],
			};
		}
		if (!additionalParams) additionalParams = {};

		let interpolatedUrl = rawUrl;
		let match;
		const remainingAdditionalParams = Object.assign({}, additionalParams);

		const { basePath = '' } = UDCUtil.parseURLParts(rawUrl);
		const hasParamsAlready = basePath.includes('/params/');
		const builderUrlPathParams = [];

		// Substitute UXF optional params
		const optionalUxfParamsRegEx = /\/\$\{uxfOptionalParams:(.*?)}/g;
		match = optionalUxfParamsRegEx.exec(rawUrl);
		while (match !== null) {
			const replacementStr = match[0];
			const uxfOptionalParams = match[1].split(',').map(p => p.trim());

			// Filter out invalid optional params. Invalid means params don't have value.
			const validOptionalParams = uxfOptionalParams.filter(param => additionalParams[param]);

			const interpolatedFieldValue = validOptionalParams.length
				? validOptionalParams.reduce(
						(acc, param) => {
							delete remainingAdditionalParams[param];

							const paramName = encodeURIComponent(param);
							const paramValue = encodeURIComponent(additionalParams[param]);
							if (!builderUrlPathParams.includes(paramName))
								builderUrlPathParams.push(paramName);
							return `${acc}/${paramName}/${paramValue}`;
						},
						hasParamsAlready ? '' : '/params'
				  )
				: '';

			interpolatedUrl = interpolatedUrl.replace(replacementStr, interpolatedFieldValue);

			match = optionalUxfParamsRegEx.exec(rawUrl);
		}

		if (Object.keys(additionalParams).length === 0) {
			return {
				url: interpolatedUrl,
				builderUrlPathParams,
			};
		}

		// Substitute remaining ${} parameters embedded in the url
		const interpolatedFieldsRegEx = /\$\{(.*?)}/g;
		match = interpolatedFieldsRegEx.exec(rawUrl);
		while (match !== null) {
			const replacementStr = match[0];
			const interpolatedFieldName = match[1];

			delete remainingAdditionalParams[interpolatedFieldName];

			if (additionalParams[interpolatedFieldName]) {
				const interpolatedFieldValue = encodeURIComponent(
					additionalParams[interpolatedFieldName]
				);
				interpolatedUrl = interpolatedUrl.replace(replacementStr, interpolatedFieldValue);
				if (!builderUrlPathParams.includes(interpolatedFieldName))
					builderUrlPathParams.push(interpolatedFieldName);
			}

			match = interpolatedFieldsRegEx.exec(rawUrl);
		}

		// Add remaining additionalParams to query params
		interpolatedUrl = UDCUtil.createCanonicalizedUri(
			interpolatedUrl,
			remainingAdditionalParams
		);

		return {
			url: interpolatedUrl,
			builderUrlPathParams,
		};
	}

	/**
	 * Returns valid builder sysId
	 * @param {String} value either builder name (or) sys_id
	 * @returns {String|null} builder sys_id
	 */
	static getBuilderSysId(value) {
		if (gs.nil(value)) return null;
		const gr = new GlideRecord(FileTaxonomyBuilder.TABLE);
		gr.addEncodedQuery(
			`${FileTaxonomyBuilder.COLUMNS.SYS_ID}=${value}^OR${FileTaxonomyBuilder.COLUMNS.NAME}=${value}`
		);
		gr.setLimit(1);
		gr.query();
		if (gr.next()) return gr.getUniqueValue();

		return null;
	}

	/**
	 * Returns the edit path for the specified builder by its sys_id.
	 * @param {string} builderSysId - The `sys_id` of the builder to retrieve.
	 * @returns {string|null} - The `editPath` if available, otherwise null.
	 */
	static getBuilderEditPathFromBuilderProperties(builderSysId) {
		if (!builderSysId) return null;
		const builderRecord = FileTaxonomyBuilder.getRecordForSysIdORName(builderSysId);
		if (!builderRecord || gs.nil(builderRecord)) return null;

		const builderProperties = builderRecord.getValue(
			FileTaxonomyBuilder.COLUMNS.BUILDER_PROPERTIES
		);

		if (!builderProperties || gs.nil(builderProperties)) return null;

		try {
			const parsedProperties = JSON.parse(builderProperties);
			const editPath = parsedProperties?.editPath || '';
			if (!editPath) return null;
			return editPath;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Retrieves a builder object from the cache by its sysId.
	 * If the cache is not initialized, it will be populated by fetching all builders and mapping them by sysId.
	 * Returns null if the builder is not found or if cache initialization fails.
	 *
	 * @param {string} builderSysId - The sys_id of the builder to retrieve from the cache.
	 * @returns {Object|null} The builder object if found, otherwise null.
	 *
	 * Example usage:
	 *   const builder = FileTaxonomyBuilder.getBuilderFromCache('abc123');
	 */
	static getBuilderFromCache(builderSysId) {
		if (!builderSysId) return null;

		if (!FileTaxonomyBuilder.#allBuildersCache) {
			try {
				// Initialize the cache if not already done
				const builders =
					FileTaxonomyBuilder.getBuilders({
						include_categories: 'true',
						include_metadata_tables: 'true',
					}) || [];

				FileTaxonomyBuilder.#allBuildersCache = {};

				// Create a map with sysId as key for quick lookup
				builders.forEach(builder => {
					if (builder && builder.sysId)
						FileTaxonomyBuilder.#allBuildersCache[builder.sysId] = builder;
				});
			} catch (e) {
				var errorMsg = 'Failed to initialize builders cache';
				if (e && typeof e.message === 'string') errorMsg += `: ${e.message}`;

				FileTaxonomyBuilder.#LOG.error(errorMsg);
				FileTaxonomyBuilder.#allBuildersCache = {}; // Set to empty object to avoid repeated failed calls
				return null;
			}
		}

		// If missing, fetch and cache on demand
		if (!FileTaxonomyBuilder.#allBuildersCache[builderSysId]) {
			const builder = FileTaxonomyBuilder.getBuilderDetails(builderSysId);
			if (builder) FileTaxonomyBuilder.#allBuildersCache[builderSysId] = builder;
			else return null;
		}

		return FileTaxonomyBuilder.#allBuildersCache[builderSysId];
	}

	/**
	 * @param {String} typeSysId
	 * @param {GlideRecord} fileObjectRecord
	 * @param {String} [builder] sys_id or name of the builer. If not specified, the default builder config will be considered
	 * @param {String} [studioPlatform] if specified, studio platform specific builders will be unlocked
	 */
	constructor(typeSysId, fileObjectRecord, builder, studioPlatform, fileDetailsFromScript) {
		this.typeSysId = typeSysId;
		this.fileObjectRecord = fileObjectRecord;
		this.builderSysId = FileTaxonomyBuilder.getBuilderSysId(builder);
		this.builderRecord = null;
		this.configRecord = null;

		this.configRecord = FileTaxonomyBuilderConfig.getRecordForTaxonomy(
			this.typeSysId,
			this.builderSysId,
			studioPlatform
		);

		const builderRecordFromConfig = !gs.nil(this.configRecord?.builder)
			? this.configRecord.builder.getRefRecord()
			: null;
		this.builderRecord = UDCUtil.isValidGlideRecord(builderRecordFromConfig)
			? builderRecordFromConfig
			: FileTaxonomyBuilder.getRecordForSysId(FileTaxonomyBuilder.DEFAULT_BUILDER);

		this.fileDetailsFromScript = fileDetailsFromScript;
	}
	/**
	 * @returns {String} metadata builder URL
	 */
	getEditUrlForMetadata(additionalParams) {
		if (!this.fileObjectRecord) {
			if (this.configRecord) {
				const { url: createPath, builderUrlPathParams } =
					FileTaxonomyBuilder.substituteDynamicParams(
						this.configRecord.getValue(FileTaxonomyBuilder.COLUMNS.CREATE_PATH),
						additionalParams
					);
				return {
					url: UDCUtil.createCanonicalizedUri(createPath),
					builderUrlPathParams,
				};
			}

			return {
				url: '',
				builderUrlPathParams: [],
			};
		}

		// Determine the raw edit path based on the presence of config record
		const rawEditPath = this.configRecord
			? this.configRecord.getValue(FileTaxonomyBuilder.COLUMNS.EDIT_PATH)
			: FileTaxonomyBuilder.getBuilderEditPathFromBuilderProperties(this.builderSysId);

		if (!gs.nil(rawEditPath)) {
			let { url: editUrl, builderUrlPathParams } =
				FileTaxonomyBuilder.substituteDynamicParams(rawEditPath, additionalParams);
			editUrl = FileTaxonomyBuilder.getInterpolatedUrl(
				editUrl,
				this.fileObjectRecord,
				this.fileDetailsFromScript
			);

			// TODO: Apply associated feature flags in the final builder URL
			return {
				url: UDCUtil.createCanonicalizedUri(editUrl),
				builderUrlPathParams,
			};
		}
		return {
			url: '',
			builderUrlPathParams: [],
		};
	}

	/**
	 * @returns {String} metadata builder URL
	 */
	getPreviewUrlForMetadata(additionalParams) {
		// Determine the raw preview path based on the presence of config record
		const rawPreviewPath = this.configRecord
			? this.configRecord.getValue(FileTaxonomyBuilder.COLUMNS.PREVIEW_PATH)
			: null;

		if (!gs.nil(rawPreviewPath)) {
			let { url: previewUrl, builderUrlPathParams } =
				FileTaxonomyBuilder.substituteDynamicParams(rawPreviewPath, additionalParams);
			previewUrl = FileTaxonomyBuilder.getInterpolatedUrl(
				previewUrl,
				this.fileObjectRecord,
				this.fileDetailsFromScript
			);

			// TODO: Apply associated feature flags in the final builder URL
			return {
				url: UDCUtil.createCanonicalizedUri(previewUrl),
				builderUrlPathParams,
			};
		}
		return {
			url: '',
			builderUrlPathParams: [],
		};
	}

	/**
	 * @returns {String} metadata creator URL
	 */
	getCreateUrlForMetadata() {
		if (!this.configRecord) return '';
		return UDCUtil.createCanonicalizedUri(
			this.configRecord.getValue(FileTaxonomyBuilder.COLUMNS.CREATE_PATH)
		);
	}

	/**
	 * @returns {String} builder label
	 */
	getLabel() {
		if (!this.builderRecord) return '';
		return this.builderRecord.getDisplayValue(FileTaxonomyBuilder.COLUMNS.LABEL) || '';
	}

	/**
	 * @returns {String} builder name
	 */
	getName() {
		if (!this.builderRecord) return '';
		return this.builderRecord.getValue(FileTaxonomyBuilder.COLUMNS.NAME) || '';
	}

	/**
	 * @returns {String} icon
	 */
	getIcon() {
		if (!this.builderRecord) return '';
		return (
			this.builderRecord.getDisplayValue(FileTaxonomyBuilder.COLUMNS.ICON) ||
			UDCConstants.fallbackIcons.TOOL
		);
	}

	/**
	 * @returns {String} builder sys_id
	 */
	getSysId() {
		if (!this.builderRecord) return '';
		return this.builderRecord.getUniqueValue() || '';
	}

	/**
	 * @returns {String} builder documentation URL
	 */
	getDocumentationUrl() {
		if (!this.builderRecord) return '';
		return this.builderRecord.getValue(FileTaxonomyBuilder.COLUMNS.DOCUMENTATION_URL) || '';
	}

	/**
	 * @returns {String} builder home page URL
	 */
	getHomeUrlForBuilder() {
		if (!this.builderRecord) return '';
		return UDCUtil.createCanonicalizedUri(
			this.builderRecord.getValue(FileTaxonomyBuilder.COLUMNS.HOME_PATH)
		);
	}

	/**
	 * @returns {Object} builder properties
	 */
	getBuilderProperties() {
		if (!this.builderRecord) return {};
		return FileTaxonomyBuilder.parseJSONString(
			this.builderRecord.getValue(FileTaxonomyBuilder.COLUMNS.BUILDER_PROPERTIES)
		);
	}

	/**
	 * Returns the cache entry key name based on the specified parameters.
	 *
	 * @param {boolean} isIncludeCategory - Indicates whether to include the category in the key name.
	 * @param {boolean} isIncludeMetadataTables - Indicates whether to include the metadata tables in the key name.
	 * @returns {string} The cache entry key name.
	 */
	static #getCacheEntryKeyName(isIncludeCategory, isIncludeMetadataTables) {
		if (isIncludeCategory && isIncludeMetadataTables)
			return 'taxonomy_builders_with_categories_and_metadata_tables';
		else if (isIncludeCategory) return 'taxonomy_builders_with_categories';
		else if (isIncludeMetadataTables) return 'taxonomy_builders_with_metadata_tables';

		return 'taxonomy_builders'; // include_categories and include_metadata_tables are false
	}
}
