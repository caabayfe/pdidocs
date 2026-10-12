class AppDetailsService {
	static type = 'AppDetailsService';
	static DEFAULT_CHUNK_SIZE = 500;
	static IS_UDC_ADMIN = gs.hasRole('sn_udc.admin');
	static DEFAULT_SMALL_APP_FILE_COUNT_THRESHOLD = 1150;
	static SMALLER_APP_FILE_COUNT_THRESHOLD =
		gs.getProperty('sn_udc.smaller_app_files_count_threshold') ||
		AppDetailsService.DEFAULT_SMALL_APP_FILE_COUNT_THRESHOLD;
	// Fields supported by api today. Will be queried from individual tables that app has
	static WHITELISTED_TABLE_FIELDS = new Set([
		'sys_id',
		'label',
		'sys_updated_on',
		'sys_updated_by',
		'sys_created_by',
	]);
	static DEFAULT_TABLE_FIELDS = ['sys_id', 'label'];
	static DEFAULT_SORT_FIELD = 'label';
	static DEFAULT_SEARCH_TYPES = ['type', 'category', 'label'];
	static APP_INFO_TABLE = 'sys_app_info';

	/**
	 * Fetches files for a given type/table
	 * @returns {Array} Files
	 */
	static getMetadataFilesForTaxonomyType({
		table,
		taxonomyType,
		appSysId,
		fields,
		sortField,
		sortOrder,
		searchTerm,
		searchFields,
		startIndex,
		endIndex,
		shouldApplySearchFilter,
	}) {
		const files = [];
		let restrictedFileCount = 0;

		const gr = global.UDCGlobal.getGlideRecordForTable(table, appSysId, false);

		const displayColumn = taxonomyType.displayColumn || gr.getDisplayName();
		if (taxonomyType.conditionQuery) gr.addEncodedQuery(taxonomyType.conditionQuery);

		if (searchTerm && shouldApplySearchFilter && searchFields.has('label'))
			gr.addEncodedQuery(`${displayColumn}LIKE${searchTerm}`);

		// Sort by displayColumn if sortField is 'label'
		const sortColumn =
			sortField === 'label' ? taxonomyType.displayColumn || gr.getDisplayName() : sortField;
		if (sortOrder === 'asc') gr.orderBy(sortColumn);
		else gr.orderByDesc(sortColumn);

		gr.chooseWindow(startIndex, endIndex);
		gr.query();

		while (gr._next()) {
			if (!gr.canRead()) {
				restrictedFileCount += 1;
				continue;
			}

			files.push(
				FileTaxonomy.getFileSpecificDetails({
					fileRecord: gr,
					taxonomyType,
					fields,
				})
			);
		}

		return {
			files,
			lastOffset: endIndex,
			count: gr.getRowCount(),
			hasRestrictedFiles: restrictedFileCount > 0,
		};
	}

	constructor(params) {
		this.appSysId = params?.appSysId;
		this.typeId = params?.typeId || '';

		this.fields = params?.fields
			? params.fields.split(',')
			: AppDetailsService.DEFAULT_TABLE_FIELDS;
		this.additionalTypeFieldsMap = new Map();
		if (params?.additionalTypeFields) {
			for (const [typeId, fields] of Object.entries(params.additionalTypeFields)) {
				if (typeId && fields) this.additionalTypeFieldsMap.set(typeId, fields.split(','));
			}
		}

		this.limit =
			parseInt(params?.limit, 10) || parseInt(AppDetailsService.DEFAULT_CHUNK_SIZE, 10);
		this.offset = parseInt(params?.offset, 10) || 0;

		this.typeIdsSet = new Set(
			params?.fileTypeIds?.split(',') ?? (this.typeId ? [this.typeId] : [])
		);

		this.sortOrder = params?.sortOrder || UDCConstants.sortOrder.ASC;
		this.sortField = params?.sortField || AppDetailsService.DEFAULT_SORT_FIELD;

		this.searchTerm = (params?.searchTerm || '').toLowerCase();
		this.searchFields = new Set(
			params?.searchFields
				? params.searchFields.split(',')
				: AppDetailsService.DEFAULT_SEARCH_TYPES
		);

		this.#sanitizeRequestedFields();

		this.searchTermMatchedCategoryTypes = [];
		if (this.searchTerm && this.searchFields.has('category')) {
			// Get all taxonomy types grouped by table name
			const { categories } = FileTaxonomy.cacheAndGetTaxonomyStructure();
			categories.forEach(category => {
				if (category?.label?.toLowerCase().includes(this.searchTerm))
					this.searchTermMatchedCategoryTypes.push(...(category.types || []));
			});
		}

		var taxonomyTypesArray = FileTaxonomy.getTaxonomyTypesDetails();
		this.taxonomyTypesBySysId = UDCUtil.groupBy(taxonomyTypesArray, 'sysId');
		this.taxonomyTypesOfTable = UDCUtil.groupBy(taxonomyTypesArray, 'table');
	}

	/**
	 * Sets the app size based on the number of files and updated limit if its smallApp
	 * @returns {void}
	 */
	#setAppSizeAndLimit() {
		this.filesCount = this.#getAppFileCount(this.appSysId);
		this.isLargeApplication = this.filesCount > this.#getSmallAppFileSizeThreshold();

		if (!this.searchTerm && !this.isLargeApplication) this.limit = this.filesCount;
	}

	#sanitizeRequestedFields() {
		const invalidFields = this.fields.filter(
			field => !AppDetailsService.WHITELISTED_TABLE_FIELDS.has(field)
		);
		if (invalidFields.length > 0)
			throw new Error(`Unsupported fields requested: ${invalidFields.join(', ')}`);
	}

	#getSmallAppFileSizeThreshold() {
		if (AppDetailsService.IS_UDC_ADMIN)
			return AppDetailsService.SMALLER_APP_FILE_COUNT_THRESHOLD * 2;

		return AppDetailsService.SMALLER_APP_FILE_COUNT_THRESHOLD;
	}

	#getAppFileCount() {
		const metadataAgg = new GlideAggregate(UDCConstants.SYS_METADATA);
		metadataAgg.addQuery('sys_scope', this.appSysId);
		metadataAgg.addAggregate('COUNT');
		metadataAgg.addEncodedQuery('sys_class_name!=sys_metadata_delete');
		metadataAgg.query();
		metadataAgg.next();

		return Number(metadataAgg.getAggregate('COUNT'));
	}

	/**
	 * Checks if user has read access to a given table in given app scope
	 * @param {String} table - Table name
	 * @returns {Boolean} - True if user has read access
	 */
	#hasReadAccess(table) {
		const gr = global.UDCGlobal.getGlideRecordSecureForTable(table, this.appSysId);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	}

	/**
	 * Handles error and returns error message and status code
	 */
	#handleError(e) {
		let message;
		let code;
		const errorMsg = e.message || e;
		switch (errorMsg) {
			case UDCConstants.errors.APP_DOES_NOT_EXISTS:
				message = gs.getMessage(
					'Application not found: Check the App Sys ID for any errors.'
				);
				code = 404;
				break;
			case UDCConstants.errors.TYPE_DOES_NOT_EXISTS:
				message = gs.getMessage(
					'TypeId not found or invalid: Check the TypeID for any errors.'
				);
				code = 404;
				break;
			default:
				message = gs.getMessage('Unhandled exception: {0}', [e]);
				code = 500;
				break;
		}
		return {
			message,
			code,
		};
	}

	/**
	 * Checks if files should be fetched
	 * @param {String} typeId
	 * @returns {Boolean}
	 */
	#shouldFetchFiles(typeId) {
		if (typeId) return !this.isLargeApplication || this.typeIdsSet.has(typeId);

		return !this.isLargeApplication || this.searchTerm || this.typeIdsSet.size;
	}

	/**
	 * Fetch files for given categories if needed.
	 */
	#getFilesForCategories({ table, taxonomyTypesOfTable, categories }) {
		const taxonomyTypesById = UDCUtil.groupBy(taxonomyTypesOfTable, 'sysId');
		const typeIdsArray =
			Object.keys(taxonomyTypesById).length > 0 ? Object.keys(taxonomyTypesById) : [table];

		const categoriesWithFiles = {};
		typeIdsArray.forEach(typeId => {
			// Only call getSearchFilterAndPopulateFilesFlags if there is a search term
			let shouldPopulateFiles = true;
			let shouldApplySearchFilter = true;

			if (this.searchTerm) {
				({ shouldPopulateFiles, shouldApplySearchFilter } =
					this.#getSearchFilterAndPopulateFilesFlags({
						sysId: categories[typeId].typeId || categories[typeId].table,
						label: categories[typeId].label,
					}));
			}
			const shouldFetchFiles = this.searchTerm
				? shouldPopulateFiles
				: this.#shouldFetchFiles(typeId);

			categoriesWithFiles[typeId] = {};
			if (shouldFetchFiles) {
				const taxonomyType = taxonomyTypesById[typeId]?.[0] ?? {};

				const additionalFields = this.additionalTypeFieldsMap.get(typeId) || [];
				const fields = new Set([...this.fields, ...additionalFields]);

				const { files, hasRestrictedFiles, count } =
					AppDetailsService.getMetadataFilesForTaxonomyType({
						table: taxonomyType.table || typeId,
						taxonomyType,
						appSysId: this.appSysId,
						fields,
						sortField: this.sortField,
						sortOrder: this.sortOrder,
						searchTerm: this.searchTerm,
						searchFields: this.searchFields,
						startIndex: this.offset,
						endIndex: this.offset + this.limit,
						shouldApplySearchFilter,
					});

				// Only push category if files exist in case of search
				if (shouldApplySearchFilter && files.length === 0) categoriesWithFiles[typeId] = {};
				else {
					categoriesWithFiles[typeId] = {
						files,
						hasRestrictedFiles,
						count,
					};
				}
			} else {
				categoriesWithFiles[typeId] = {
					files: [],
					hasRestrictedFiles: false,
				};
			}
		});

		return categoriesWithFiles;
	}

	#getSearchFilterAndPopulateFilesFlags(taxonomyType) {
		// Check if search fields are present
		const isCategorySearch = this.searchFields.has('category');
		const isTypeSearch = this.searchFields.has('type');

		// Check if taxonomyType label matches the search term
		const isTypeMatched = taxonomyType.label?.toLowerCase().includes(this.searchTerm);
		const noSearchFilterFlags = {
			shouldApplySearchFilter: false,
			shouldPopulateFiles: !this.isLargeApplication,
		};

		if (
			isCategorySearch &&
			(this.searchTermMatchedCategoryTypes.includes(taxonomyType.sysId) || isTypeMatched)
		)
			return noSearchFilterFlags;

		if (isTypeSearch && isTypeMatched) return noSearchFilterFlags;

		return {
			shouldApplySearchFilter: true,
			shouldPopulateFiles: true,
		};
	}

	/**
	 * Fetches categories registered in taxonomy with file count
	 * @returns {Object} Categories with file count
	 */
	#getCategoryDetailsForRegisteredTaxonomyTypes({ table, taxonomyTypesOfTable, count, label }) {
		const categories = {};

		// If only one taxonomy type, assign directly
		if (taxonomyTypesOfTable.length === 1) {
			const taxonomyType = taxonomyTypesOfTable[0];

			if (!taxonomyType.label) taxonomyType.label = label;

			categories[taxonomyType.sysId] = {
				label: taxonomyType.label,
				table,
				typeId: taxonomyType.sysId,
				count,
			};
			return categories;
		}

		// Multiple taxonomy types: Perform GlideRecord query for each type
		taxonomyTypesOfTable.forEach(taxonomyType => {
			const typeId = taxonomyType.sysId;
			var gr = global.UDCGlobal.getGlideRecordForTable(table, this.appSysId, false);
			if (taxonomyType.conditionQuery) gr.addEncodedQuery(taxonomyType.conditionQuery);
			gr.query();

			categories[typeId] = {
				label: taxonomyType.label,
				table,
				typeId,
				count: gr.getRowCount(),
			};
		});

		return categories;
	}

	/**
	 * Fetches categories with file count
	 * @returns {Object} Categories with file count
	 */
	#getCategoryDetailsForUnRegisteredTaxonomyTypes({ table, label, count }) {
		const category = {};
		category[table] = {
			label,
			table,
			typeId: table,
			count,
		};
		return category;
	}

	/**
	 * Sorts categories based on label
	 * @param {Object} categories - Categories to be sorted
	 * @returns {Array} Sorted categories
	 */
	#getSortedCategories(categories) {
		return Object.values(categories).sort((a, b) => {
			const aLabel = a.label;
			const bLabel = b.label;

			if (this.sortOrder === 'asc') return aLabel.localeCompare(bLabel);

			return bLabel.localeCompare(aLabel);
		});
	}

	/**
	 * Fetches categories with file count and if needed first chunk of files from each category.
	 * @returns {Object} Categories with file count and/or files.
	 */
	getFileCategoriesByApp() {
		try {
			if (!UDCUtil.isValidRecord('sys_scope', this.appSysId))
				throw UDCConstants.errors.APP_DOES_NOT_EXISTS;

			let categories = {};
			this.#setAppSizeAndLimit();

			var metadataAgg = new GlideAggregate(UDCConstants.SYS_METADATA);
			metadataAgg.addAggregate('COUNT', 'sys_class_name');
			metadataAgg.addQuery('sys_scope', this.appSysId);
			metadataAgg.addEncodedQuery('sys_class_name!=sys_metadata_delete');
			if (this.sortOrder === 'asc') metadataAgg.orderBy('sys_class_name');
			else metadataAgg.orderByDesc('sys_class_name');

			metadataAgg.query();

			while (metadataAgg.next()) {
				const count = metadataAgg.getAggregate('COUNT', 'sys_class_name');
				const table = metadataAgg.getValue('sys_class_name');
				const label = metadataAgg.getDisplayValue('sys_class_name');

				if (!this.#hasReadAccess(table)) continue;

				const taxonomyTypesOfTable = this.#getTaxonomyTypeDetails(table);
				// Fetch categories and count.
				const categoryDetails = taxonomyTypesOfTable.length
					? this.#getCategoryDetailsForRegisteredTaxonomyTypes({
							table,
							taxonomyTypesOfTable,
							label,
							count,
					  })
					: this.#getCategoryDetailsForUnRegisteredTaxonomyTypes({
							table,
							label,
							count,
					  });

				categories = {
					...categories,
					...categoryDetails,
				};

				if (this.#shouldFetchFiles()) {
					// Fetch files if needed from each category
					const categoriesWithFiles = this.#getFilesForCategories({
						table,
						taxonomyTypesOfTable,
						categories,
					});

					Object.keys(categoriesWithFiles).forEach(typeId => {
						if (!categoriesWithFiles[typeId].files) {
							delete categories[typeId];
							return;
						}
						categories[typeId] = {
							...categories[typeId],
							...categoriesWithFiles[typeId],
						};
					});
				}
			}
			const sortedCategories = this.#getSortedCategories(categories);
			const result = {
				categories: sortedCategories,
				isLargeApplication: this.isLargeApplication,
				count: this.filesCount,
			};
			return result;
		} catch (e) {
			return {
				appSysId: this.appSysId,
				error: this.#handleError(e),
			};
		}
	}

	#getTaxonomyTypeDetails(typeIdOrTableName) {
		return (
			this.taxonomyTypesBySysId[typeIdOrTableName] ||
			this.taxonomyTypesOfTable[typeIdOrTableName] ||
			[]
		);
	}

	/**
	 * Fetches files for a given typeIds
	 * @returns {Object} Files with last offset
	 */
	getFilesByTaxonomyTypes() {
		try {
			if (!UDCUtil.isValidRecord('sys_scope', this.appSysId))
				throw UDCConstants.errors.APP_DOES_NOT_EXISTS;

			const result = [];
			const typeIds = this.typeIdsSet.size > 0 ? [...this.typeIdsSet] : [];
			const { types } = FileTaxonomy.cacheAndGetTaxonomyStructure();
			const taxonomyTypesById = UDCUtil.groupBy(types, 'id');

			for (const typeId of typeIds) {
				const taxonomyType = taxonomyTypesById[typeId][0] || {};
				const { table } = taxonomyType;

				if (!UDCUtil.isValidTable(table)) {
					throw new Error(
						`Invalid typeId: ${typeId}. ${UDCConstants.errors.TYPE_DOES_NOT_EXISTS}`
					);
				}

				const { files, count, lastOffset, hasRestrictedFiles } =
					AppDetailsService.getMetadataFilesForTaxonomyType({
						table,
						taxonomyType,
						appSysId: this.appSysId,
						fields: this.fields,
						sortField: this.sortField,
						sortOrder: this.sortOrder,
						searchTerm: this.searchTerm,
						searchFields: this.searchFields,
						startIndex: this.offset,
						endIndex: this.offset + this.limit,
						shouldApplySearchFilter: true,
					});

				result.push({
					typeId,
					table,
					label: taxonomyType.label,
					count,
					files,
					lastOffset,
					hasRestrictedFiles,
				});
			}
			return {
				categories: result,
			};
		} catch (e) {
			return {
				appSysId: this.appSysId,
				error: this.#handleError(e),
			};
		}
	}
	/**
	 * Returns a mapping of application sys_ids to a boolean indicating if the app was generated using AI.
	 *
	 * @param {Array<String>} appEntrySysIds - An array of application sys_ids (scopes) to check.
	 * @returns {Object} A map where the keys are app sys_ids and the values are booleans indicating if the app was generated using AI.
	 *
	 * Example return value:
	 * {
	 *   "xxxxxxxxxxxxxxx": true,
	 *   "yyyyyyyyyyyyyyy": false
	 * }
	 */
	static getAIGeneratedAppMap(appEntrySysIds) {
		const aiGeneratedAppMap = {};
		if (!appEntrySysIds || appEntrySysIds.length === 0) return aiGeneratedAppMap;

		const sysAppInfoGr = new GlideRecord(AppDetailsService.APP_INFO_TABLE);
		sysAppInfoGr.addQuery('sys_scope', 'IN', appEntrySysIds);
		sysAppInfoGr.query();

		while (sysAppInfoGr.next()) {
			const scopeId = sysAppInfoGr.getValue('sys_scope');
			const properties = sysAppInfoGr.getValue('properties');
			let generatedUsingAI = false;
			if (properties) {
				try {
					generatedUsingAI = JSON.parse(properties).generated_using_ai;
				} catch (e) {
					generatedUsingAI = false;
				}
			}
			aiGeneratedAppMap[scopeId] = generatedUsingAI;
		}

		return aiGeneratedAppMap;
	}
}
