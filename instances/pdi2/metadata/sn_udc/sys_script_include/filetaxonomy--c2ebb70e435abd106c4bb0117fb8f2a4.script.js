class FileTaxonomy {
	static type = 'FileTaxonomy';
	static TABLE = 'sn_udc_file_taxonomy_type';
	static SYS_DB_OBJECT = 'sys_db_object';
	static SYS_METADATA = 'sys_metadata';
	static UPDATE_SET_TABLE = 'sys_update_set';
	static TAXONOMY_TYPES_SCOPED_CACHE_NAME = 'Taxonomy Types';
	static TAXONOMY_STRUCTURE_SCOPED_CACHE_NAME = 'File Taxonomy Structure';
	static TAXONOMY_STRUCTURE_SCOPED_CACHE_KEY = 'file_taxonomy_structure';
	static DEFAULT_BUILDER_RECORD_SCOPED_CACHE_NAME = 'Default Builder';
	static DEFAULT_BUILDER_RECORD_SCOPED_CACHE_KEY = 'default_builder';
	static APP_TYPES = [
		{
			sys_scope: 'GLOBAL_APP',
		},
		{
			sys_app: 'CUSTOM_APP',
		},
		{
			sys_store_app: 'OTHER_APP',
		},
	];
	static Column = {
		Label: 'label',
		Icon: 'icon',
	};

	static findTaxonomyType(table, conditionQuery) {
		var gr = new GlideRecord(FileTaxonomy.TABLE);
		gr.addQuery('table', table);
		gr.addQuery('condition_query', conditionQuery);
		gr.setLimit(1);
		gr.query();
		return gr;
	}

	static getTypeLabel(table) {
		const gr = new GlideRecord(FileTaxonomy.TABLE);
		gr.addQuery('table', table);
		gr.query();
		const rowCount = gr.getRowCount();
		if (rowCount == 1) {
			gr.next();
			return gr.getDisplayValue('label') || FileTaxonomy.getTableLabel(table);
		}
		if (rowCount < 1) return FileTaxonomy.getTableLabel(table);

		// Table has more than one type so we can't find the type with out file sys_id
		return '';
	}

	static getFileDetails({
		fileTable,
		fileSysId,
		fileBuilder,
		fileScopeSysId,
		additionalParams,
		studioPlatform,
	}) {
		// Find File Taxonomy Builder record either with builderSysId (or) builderName
		const builderGr = FileTaxonomyBuilder.getRecordForSysIdORName(fileBuilder);
		const fileBuilderSysId = builderGr ? builderGr.getUniqueValue() : '';

		try {
			// Metadata file (or) Application
			const fileObject = FileTaxonomy.getArtifactWithPermissionCheck(fileTable, fileSysId);
			const taxonomy = new FileTaxonomy(fileTable, fileSysId);
			const builder = new FileTaxonomyBuilder(
				taxonomy.getFileTaxonomySysId(),
				fileObject,
				fileBuilderSysId,
				studioPlatform,
				taxonomy.fileDetailsFromScript
			);
			const scopeDetails = FileTaxonomy.getArtifactScopeDetails(
				fileTable,
				fileObject,
				fileScopeSysId
			);
			const type = taxonomy.getType();
			const { url: artifactUrl, builderUrlPathParams } =
				builder.getEditUrlForMetadata(additionalParams);
			if (artifactUrl.includes('${'))
				throw UDCConstants.errors.ARTIFACT_URL_GENERATION_FAILED;
			const { url: previewUrl, builderUrlPathParams: previewBuilderUrlPathParams } =
				builder.getPreviewUrlForMetadata(additionalParams);
			if (previewUrl.includes('${')) throw UDCConstants.errors.ARTIFACT_URL_GENERATION_FAILED;

			return {
				url:
					artifactUrl ||
					UDCUtil.createCanonicalizedUri(`/${fileTable}.do?sys_id=${fileSysId}`, {
						sysparm_transaction_scope: scopeDetails.sysId,
					}),
				previewUrl,
				builderUrlPathParams,
				icon: taxonomy.getIcon(),
				builder: {
					name: builder.getName(),
					label: builder.getLabel(),
					sysId: builder.getSysId(),
					properties: builder.getBuilderProperties(),
				},
				file: {
					type,
					typeSysId: taxonomy.getFileTaxonomySysId(),
					table: fileTable,
					sysId: fileSysId,
					label: UDCUtil.isNewAsset(fileSysId)
						? gs.getMessage('New {0}', [type])
						: taxonomy.getFileLabel() || gs.getMessage('(empty)'),
					name: taxonomy.getFileName(),
					scope: scopeDetails,
					isMetadataFile: FileTaxonomy.isMetadataFile(fileTable),
				},
				isRegistered: taxonomy.isExists(),
			};
		} catch (e) {
			let message;
			let code;
			let type;
			const errorMsg = e.message || e;
			let title;
			let shortDescription;
			let detail;
			const app = UDCUtil.isAppRecord(fileTable);

			switch (errorMsg) {
				case UDCConstants.errors.ARTIFACT_DOES_NOT_EXISTS:
					message = gs.getMessage(
						'Asset not found: Check the Sys ID, table name and tool name for any errors.'
					);
					title = gs.getMessage('Asset not found');
					detail = gs.getMessage(
						'Check the Sys ID, table name and tool name for any errors.'
					);
					code = UDCConstants.ERROR_CODES.NOT_FOUND;
					break;

				case UDCConstants.errors.FILE_DOES_NOT_EXISTS: {
					const typeLabel =
						FileTaxonomy.getTypeLabel(fileTable) || gs.getMessage('Asset');
					message = gs.getMessage(
						'{0} not found: Check the Sys ID and tool name for any errors.',
						typeLabel
					);
					title = gs.getMessage('{0} not found', typeLabel);
					detail = gs.getMessage('Check the Sys ID and tool name for any errors.');
					type = typeLabel;
					code = UDCConstants.ERROR_CODES.NOT_FOUND;
					break;
				}

				case UDCConstants.errors.USER_ACCESS_RESTRICTED: {
					const typeLabel = FileTaxonomy.getTypeLabel(fileTable) || gs.getMessage('File');
					const appErrorMessage = gs.getMessage('Unable to access these app details: ');
					const fileErrorMessage = gs.getMessage('Unable to access this file: ');
					const fullMessage = gs.getMessage(
						'Contact your admin and ask them to update your permissions.'
					);
					message = app
						? appErrorMessage.concat(fullMessage)
						: fileErrorMessage.concat(fullMessage);
					code = UDCConstants.ERROR_CODES.FORBIDDEN;
					title = gs.getMessage('Access restriction');
					shortDescription = app
						? gs.getMessage('Unable to access these app details')
						: gs.getMessage('Unable to access this file');
					detail = fullMessage;
					type = app ? gs.getMessage('App details') : typeLabel;
					break;
				}

				case UDCConstants.errors.NO_CROSS_SCOPE_ACCESS_PRIVILEGE: {
					title = gs.getMessage('Restricted access');
					shortDescription = gs.getMessage('Unable to open this item');
					message = gs.getMessage(
						'Unable to open this item: Cross-scope access restrictions prevent this item from being opened. Access this in platform or contact your admin.'
					);
					detail = gs.getMessage(
						'Cross-scope access restrictions prevent this item from being opened. Access this in platform or contact your admin.'
					);
					code = UDCConstants.ERROR_CODES.FORBIDDEN;
					break;
				}

				case UDCConstants.errors.ARTIFACT_PREVIEW_URL_GENERATION_FAILED: {
					type = FileTaxonomy.getTypeLabel(fileTable) || gs.getMessage('Asset');
					message = gs.getMessage(
						'Artifact Preview URL generation failed: Check the URL configured in the taxonomy.'
					);
					title = gs.getMessage('Preview Artifact URL generation failed');
					detail = gs.getMessage('Check the URL configured in the taxonomy.');
					code = UDCConstants.ERROR_CODES.SERVER_ERROR;
					break;
				}

				case UDCConstants.errors.ARTIFACT_URL_GENERATION_FAILED: {
					type = FileTaxonomy.getTypeLabel(fileTable) || gs.getMessage('Asset');
					message = gs.getMessage(
						'Artifact URL generation failed: Check the URL configured in the taxonomy.'
					);
					title = gs.getMessage('Artifact URL generation failed');
					detail = gs.getMessage('Check the URL configured in the taxonomy.');
					code = UDCConstants.ERROR_CODES.SERVER_ERROR;
					break;
				}

				default:
					message = gs.getMessage('Unhandled exception: {0}', [e]);
					code = UDCConstants.ERROR_CODES.SERVER_ERROR;
					title = gs.getMessage('Unhandled exception');
					detail = e.toString();
					break;
			}

			return {
				table: fileTable,
				sysId: fileSysId,
				builder: fileBuilder,
				scopeSysId: fileScopeSysId,
				type,
				title,
				error: {
					message,
					code,
					title: shortDescription || title,
					detail,
				},
			};
		}
	}
	/**
	 * Returns UI16 builder record
	 * @returns {Object} object represents artifact file details
	 */
	static cacheAndGetDefaultBuilderRecord() {
		const result = UDCCache.get(
			FileTaxonomy.DEFAULT_BUILDER_RECORD_SCOPED_CACHE_NAME,
			FileTaxonomy.DEFAULT_BUILDER_RECORD_SCOPED_CACHE_KEY
		);

		if (!result) {
			const value = FileTaxonomyBuilder.getRecordForSysId(
				FileTaxonomyBuilder.DEFAULT_BUILDER
			);
			UDCCache.put(
				FileTaxonomy.DEFAULT_BUILDER_RECORD_SCOPED_CACHE_NAME,
				FileTaxonomy.DEFAULT_BUILDER_RECORD_SCOPED_CACHE_KEY,
				value
			);
			return value;
		}

		return result;
	}

	/**
	 * Formats the details of a builder record into a specific structure.
	 * @param {Object} builder - The builder record to format.
	 * @returns {Object} Formatted builder details.
	 */
	static #formatBuilderDetailsFromRecord(builder) {
		if (!UDCUtil.isValidGlideRecord(builder)) return {};

		return {
			name: builder.getValue('name') || '',
			label: builder.getDisplayValue('label') || '',
			sysId: builder.getUniqueValue() || '',
			properties:
				FileTaxonomyBuilder.parseJSONString(builder.getValue('builder_properties')) || {},
		};
	}

	/**
	 * Returns metadata file record
	 * @param {String} typeSysId
	 * @param {String} sysId
	 * @param {String} fileBuilder
	 * @param {String} scopeSysId
	 * @param {String} additionalParams
	 * @param {String} studioPlatform - indicates current studio platform and can unlock additional builders
	 * @returns {Object} object represents artifact file details
	 */
	static getTypeDetailsForNewRecord({
		typeSysId,
		sysId,
		fileBuilder,
		scopeSysId,
		additionalParams,
		studioPlatform,
	}) {
		const builderGr = FileTaxonomyBuilder.getRecordForSysIdORName(fileBuilder);
		const fileBuilderSysId = builderGr ? builderGr.getUniqueValue() : '';
		const fileSysId = sysId;
		let fileTable;

		try {
			const typeGr = new GlideRecord(FileTaxonomy.TABLE);
			if (!typeGr.get(typeSysId)) throw UDCConstants.errors.TYPE_DOES_NOT_EXISTS;

			fileTable = typeGr.getValue('table');
			const configRecord = FileTaxonomyBuilderConfig.getRecordForTaxonomy(
				typeSysId,
				fileBuilderSysId,
				studioPlatform
			);
			const builder =
				configRecord?.builder?.getRefRecord() ||
				FileTaxonomy.cacheAndGetDefaultBuilderRecord();
			const type = typeGr.getDisplayValue('label') || FileTaxonomy.getTableLabel(fileTable);
			const { url: createPath, builderUrlPathParams } =
				FileTaxonomyBuilder.substituteDynamicParams(
					configRecord?.getValue('create_path'),
					additionalParams
				);
			if (createPath.includes('${')) throw UDCConstants.errors.ARTIFACT_URL_GENERATION_FAILED;

			return {
				url:
					UDCUtil.createCanonicalizedUri(createPath) ||
					UDCUtil.createCanonicalizedUri(`/${fileTable}.do?sys_id=${fileSysId}`),
				builderUrlPathParams,
				icon: typeGr.getDisplayValue('icon') || FileTaxonomy.getFallBackIcon(fileTable),
				builder: FileTaxonomy.#formatBuilderDetailsFromRecord(builder),
				file: {
					type,
					table: fileTable,
					sysId: fileSysId,
					label: gs.getMessage('New {0}', [type]),
					name: '',
					scope: FileTaxonomy.#getScopeDetailsFromSysIdOrSession(scopeSysId, fileTable),
					isMetadataFile: FileTaxonomy.isMetadataFile(fileTable),
				},
			};
		} catch (e) {
			let message;
			let code;
			let title;
			let type;
			let detail;

			switch (e) {
				case UDCConstants.errors.TYPE_DOES_NOT_EXISTS:
					message = gs.getMessage(
						'Asset not found: Check the Type Sys ID for any errors'
					);
					title = gs.getMessage('Asset not found');
					detail = gs.getMessage('Check the Type Sys ID for any errors.');
					code = 404;
					break;

				case UDCConstants.errors.ARTIFACT_URL_GENERATION_FAILED: {
					type = FileTaxonomy.getTypeLabel(fileTable) || gs.getMessage('Asset');
					message = gs.getMessage(
						'Artifact URL generation failed: Check the URL configured in the taxonomy.'
					);
					title = gs.getMessage('Artifact URL generation failed');
					detail = gs.getMessage('Check the URL configured in the taxonomy.');
					code = UDCConstants.ERROR_CODES.SERVER_ERROR;
					break;
				}

				default:
					message = gs.getMessage('Unhandled exception: {0}', [e]);
					code = 500;
					break;
			}

			return {
				typeSysId,
				sysId: fileSysId,
				title,
				builder: fileBuilder,
				scopeSysId,
				type,
				error: {
					message,
					code,
					title,
					detail,
				},
			};
		}
	}

	static #getScopeDetailsFromSysIdOrSession(fileScopeSysId, fileTable) {
		const scopeSysId = fileScopeSysId || '';
		if (!FileTaxonomy.isMetadataFile(fileTable)) {
			return {
				sysId: scopeSysId,
				label: '',
				name: '',
				showSessionScope: false,
			};
		}

		let scopeInfo = {
			sysId: scopeSysId,
			label: '',
			name: '',
			showSessionScope: true,
		};

		if (scopeSysId) {
			const gr = new GlideRecord('sys_scope');
			gr.get(scopeSysId);

			if (UDCUtil.isValidGlideRecord(gr)) {
				scopeInfo = {
					sysId: gr.getUniqueValue(),
					label: gr.getDisplayValue('name'),
					name: gr.scope?.toString(),
					showSessionScope: false,
				};
			}
		}

		return scopeInfo;
	}

	static getArtifactScopeDetails(fileTable, fileObject, fileScopeSysId) {
		// When metadata sysId is -1, consider it as new metadata creation
		if (gs.nil(fileObject))
			return FileTaxonomy.#getScopeDetailsFromSysIdOrSession(fileScopeSysId, fileTable);

		// Application scope
		if (UDCUtil.isAppRecord(fileTable)) {
			return {
				sysId: fileObject.getUniqueValue(),
				label: fileObject.getValue('name'),
				name: fileObject.scope?.toString(),
			};
		}

		// Update set file scope
		if (FileTaxonomy.isUpdateSetRecord(fileTable) && !gs.nil(fileObject.application)) {
			return {
				sysId: fileObject.getValue('application'),
				label: fileObject.getDisplayValue('application'),
				name: fileObject.application.scope?.toString(),
			};
		}

		// Metadata file scope
		if (!gs.nil(fileObject.sys_scope)) {
			return {
				sysId: fileObject.getValue('sys_scope'),
				label: fileObject.getDisplayValue('sys_scope'),
				name: fileObject.sys_scope.scope?.toString(),
				class: fileObject.sys_scope.sys_class_name?.toString(),
			};
		}

		return {};
	}

	/**
	 * Retrieves a GlideRecord object for the specified table and sys_id if the current user has read access.
	 *
	 * @description
	 * This method performs a read permission check (canRead) and should be used only for reading records.
	 * For write/delete operations, use appropriate permission checks (canWrite/canDelete) before performing those operations.
	 *
	 * @param {string} table - The table name to query
	 * @param {string} sysId - The sys_id of the record to retrieve
	 * @returns {GlideRecord|null} The GlideRecord object if found and readable by the current user, null otherwise
	 */
	static getFileObjectRecord(table, sysId) {
		const fileObject = global.UDCGlobal.getGlideRecordForTable(table);
		if (fileObject.get(sysId) && fileObject.canRead()) return fileObject;
		return null;
	}

	/**
	 * Returns metadata file record if exists else throw error
	 * @param {String} table
	 * @param {String} metadata record sysId
	 * @returns {GlideRecord} GlideRecord object represents metadata file
	 */
	static getArtifactWithPermissionCheck(table, sysId) {
		if (UDCUtil.isNewAsset(sysId)) return null;

		const fileObject = global.UDCGlobal.getGlideRecordForTable(table);

		if (!fileObject.isValid()) throw UDCConstants.errors.ARTIFACT_DOES_NOT_EXISTS;

		let metadataRecord = null;

		try {
			// Ideally get() should only return a boolean value but with restricted caller access enabled it throws exception for some artifacts
			metadataRecord = fileObject.get(sysId);
		} catch (e) {
			throw UDCConstants.errors.NO_CROSS_SCOPE_ACCESS_PRIVILEGE;
		}

		if (metadataRecord) {
			if (!fileObject.canRead()) throw UDCConstants.errors.USER_ACCESS_RESTRICTED;

			return fileObject;
		}
		throw UDCConstants.errors.FILE_DOES_NOT_EXISTS;
	}

	/**
	 * Returns FileTaxonomy record. If fileObjectRecord is null then return first matched taxonomy record table.
	 * @param {String} table
	 * @param {GlideRecord|null} fileObjectRecord
	 * @returns {GlideRecord|null} GlideRecord object represents FileTaxonomy record
	 */
	static getRecord(table, fileObjectRecord) {
		const taxonomyGr = new GlideRecord(FileTaxonomy.TABLE);
		taxonomyGr.addQuery('table', table);
		// When there is no fileObject record, then find out first matched taxonomy record with table name
		if (gs.nil(fileObjectRecord)) {
			taxonomyGr.setLimit(1);
			taxonomyGr.query();
			if (taxonomyGr.next()) return taxonomyGr;
			return null;
		}

		// When fileObject is valid
		taxonomyGr.orderByDesc('condition_query');
		taxonomyGr.query();

		while (taxonomyGr.next()) {
			const query = taxonomyGr.getValue('condition_query');
			if ((query && GlideFilter.checkRecord(fileObjectRecord, query)) || !query)
				return taxonomyGr;
		}
		return null;
	}

	/**
	 * Returns metadata file details from script
	 * @param {GlideRecord} taxonomyRecord
	 * @param {GlideRecord} fileObjectRecord
	 * @returns {Object} Object represets details of the metadata
	 */
	static getFileDetailsFromScript(taxonomyRecord, fileObjectRecord) {
		if (!taxonomyRecord || !fileObjectRecord) return {};

		const hasDetailsScript = JSON.parse(taxonomyRecord.use_details_script);
		if (!hasDetailsScript) return {};

		return UDCUtil.evaluateScript(taxonomyRecord, 'details_script', {
			fileObjectRecord,
			taxonomyRecord,
		});
	}

	/**
	 * Get Taxonomy type map
	 * @returns {Object} Object represets taxonomy type map
	 */
	static getTaxonomyTypeMap() {
		const taxonomyTypeMap = UDCUtil.groupBy(FileTaxonomy.getTaxonomyTypesDetails(), 'table');
		return taxonomyTypeMap;
	}

	/**
	 * Get icon of an application file
	 * @param {String} id, sys id of metadata record
	 * @param {String} class type of metadata record
	 * @param {Object} typeMap, file type map
	 * @returns {Image} icon of file
	 */
	static getIconByType(fileId, type, typeMap = []) {
		if (typeMap.length < 1 || !type) return null;

		if (typeMap.length === 1) return typeMap[0].icon;
		else if (typeMap.length > 1) {
			const fileGr = FileTaxonomy.getFileObjectRecord(type, fileId);
			const typeGr = FileTaxonomy.getRecord(type, fileGr);
			if (typeGr) return typeGr.getDisplayValue('icon') || UDCConstants.fallbackIcons.FILE;

			return UDCConstants.fallbackIcons.FILE;
		}
	}

	/**
	 * Returns table label
	 * @param {String} table
	 * @returns {String} label of the table
	 */
	static getTableLabel(table) {
		var tableGr = new GlideRecord('sys_db_object');
		if (!tableGr.get('name', table)) return '';

		return tableGr.getDisplayValue('label') || '';
	}
	/**
	 * Validate taxonomy type
	 * @param {String} typeSysId
	 * @returns {Objects} Object represent taxonomy type validation
	 */
	static validateType(typeSysId, fileBuilder) {
		const gr = new GlideRecord(FileTaxonomy.TABLE);
		try {
			if (!gr.get(typeSysId)) throw UDCConstants.errors.TYPE_DOES_NOT_EXISTS;

			const builderGr = FileTaxonomyBuilder.getRecordForSysIdORName(fileBuilder);
			const fileBuilderSysId = builderGr ? builderGr.getUniqueValue() : '';
			const configRecord = FileTaxonomyBuilderConfig.getRecordForTaxonomy(
				typeSysId,
				fileBuilderSysId
			);
			const builder = configRecord?.builder?.getRefRecord() || null;
			const tableGr = global.UDCGlobal.getGlideRecordForTable(gr.getValue('table'));

			const response = {
				sysId: typeSysId,
				canCreate: tableGr.canCreate(),
				canRead: tableGr.canRead(),
				label: gr.getDisplayValue('label') || '',
				description: gr.getDisplayValue('description') || '',
				icon:
					gr.getDisplayValue('icon') ||
					FileTaxonomy.getFallBackIcon(gr.getValue('table')),
				builder: FileTaxonomy.#formatBuilderDetailsFromRecord(builder),
			};
			return response;
		} catch (e) {
			let message;
			let code;
			switch (e) {
				case UDCConstants.errors.TYPE_DOES_NOT_EXISTS:
					message = gs.getMessage(
						'Asset not found: Check the Type Sys ID for any errors.'
					);
					code = 404;
					break;
				default:
					message = gs.getMessage('Unhandled exception: {0}', [e]);
					code = 500;
					break;
			}
			return {
				typeSysId,
				error: {
					message,
					code,
				},
			};
		}
	}
	/**
	 * Get Fallback Icon
	 * @param {String} table
	 * @returns {String} String represent icon name
	 */
	static getFallBackIcon(table) {
		const app = FileTaxonomy.APP_TYPES.find(appType => table in appType);
		if (app) {
			return UDCConstants.fallbackIcons[app[table]] || UDCConstants.fallbackIcons.OTHER_APP;
		}
		return UDCConstants.fallbackIcons.FILE;
	}

	/**
	 * Get tables display column
	 * @param {String} table
	 * @returns {String} String represents display column
	 */
	static getTableDisplayName(table) {
		var tableGr = global.UDCGlobal.getGlideRecordForTable(table);
		return tableGr.getDisplayName();
	}

	/**
	 * Returns Taxonomy Types
	 * @param {String} table
	 * @returns {Array} Array represents taxonomy records of tables
	 */
	static getTaxonomyTypes() {
		const records = new Map();
		const gr = new GlideRecord(FileTaxonomy.TABLE);
		gr.query();
		while (gr.next()) {
			const table = gr.getValue('table');

			const type = {
				sysId: gr.getUniqueValue(),
				description: gr.getDisplayValue('description'),
				icon: gr.getDisplayValue('icon') || UDCConstants.fallbackIcons.FILE,
				label: gr.getDisplayValue('label'),
				conditionQuery: gr.getDisplayValue('condition_query'),
				displayColumn:
					gr.getDisplayValue('file_label_field') ||
					FileTaxonomy.getTableDisplayName(table),
			};
			if (records.has(table)) records.get(table).push(type);
			else records.set(table, [type]);
		}
		return records;
	}

	/**
	 * Returns Taxonomy structure
	 * @returns {Object} Object represents types and categories
	 */
	static getTaxonomyStructure() {
		const types = [];
		const otherCategoryTypes = [];
		const taxonomyTypes = FileTaxonomy.getTaxonomyTypes();
		const taxonomyCategories = FileTaxonomyCategoryMap.getCatagoriesForType();
		const gr = new GlideRecord(FileTaxonomy.SYS_DB_OBJECT);
		gr.addEncodedQuery('super_class!=NULL');
		gr.query();
		while (gr.next()) {
			const table = gr.getValue('name');

			if (!FileTaxonomy.isMetadataFile(table)) continue;

			if (taxonomyTypes.has(table)) {
				const typeRecords = taxonomyTypes.get(table);
				for (let i = 0; i < typeRecords.length; i++) {
					const { sysId, label, description, icon, conditionQuery, displayColumn } =
						typeRecords[i];

					types.push({
						id: sysId,
						table,
						label: label || gr.getDisplayValue('label'),
						typeSysId: sysId,
						description: description || null,
						icon: icon || null,
						conditionQuery: conditionQuery || null,
						displayColumn: displayColumn || null,
					});

					if (!taxonomyCategories.has(sysId)) otherCategoryTypes.push(table);
				}
				continue;
			}
			types.push({
				id: table,
				table,
				label: gr.getDisplayValue('label'),
				typeSysId: null,
				description: null,
				icon: UDCConstants.fallbackIcons.FILE,
				displayColumn: FileTaxonomy.getTableDisplayName(table),
			});
			otherCategoryTypes.push(table);
		}
		types.sort((a, b) => (a.label > b.label ? 1 : -1));
		const categories = FileTaxonomyCategoryMap.getCategoriesForFileStructure();
		categories.push({
			id: 'other',
			label: gs.getMessage('Other'),
			icon: UDCConstants.fallbackIcons.CATEGORY,
			types: otherCategoryTypes,
		});
		return {
			types,
			categories,
		};
	}

	/**
	 * Returns Taxonomy structure types with permission
	 * @param {Array} taxonomyStructureTypes
	 * @returns {Object} Object represents types
	 */
	static filterTypesForTransactionScope(taxonomyStructureTypes) {
		const filteredFileTypes = [];
		for (let i = 0; i < taxonomyStructureTypes.length; i++) {
			const grFileTable = global.UDCGlobal.getGlideRecordForTable(
				taxonomyStructureTypes[i].table
			);
			if (
				global.UDCGlobal.hasCanCreatePermission(grFileTable) &&
				global.UDCGlobal.hasCanWritePermission(grFileTable)
			)
				filteredFileTypes.push(taxonomyStructureTypes[i]);
		}
		return filteredFileTypes;
	}

	/**
	 * Returns Taxonomy structure, get the data from cache entry if stored otherwise get data from getTaxonomyStructure method and store in cache
	 * @returns {Object} result or value(based on cache entry) represents types and categories
	 */
	static cacheAndGetTaxonomyStructure() {
		const result = UDCCache.get(
			FileTaxonomy.TAXONOMY_STRUCTURE_SCOPED_CACHE_NAME,
			FileTaxonomy.TAXONOMY_STRUCTURE_SCOPED_CACHE_KEY
		);

		if (!result) {
			const value = FileTaxonomy.getTaxonomyStructure();
			UDCCache.put(
				FileTaxonomy.TAXONOMY_STRUCTURE_SCOPED_CACHE_NAME,
				FileTaxonomy.TAXONOMY_STRUCTURE_SCOPED_CACHE_KEY,
				value
			);
			return value;
		}

		return result;
	}

	/*
        Retrieves the details of a file based on the taxonomyType if it exists
    */
	static buildFileDetails({ fileRecord, fileTable, taxonomyType = {} }) {
		return {
			...FileTaxonomy.getFileSpecificDetails({
				fileRecord,
				taxonomyType,
			}),
			type: taxonomyType.label || fileRecord?.getDisplayValue('sys_class_name'),
			typeSysId: taxonomyType.sysId || '',
			table: fileTable,
		};
	}

	/*
        Retrieves the details of a file specific based on the taxonomyType if it exists
    */
	static getFileSpecificDetails({
		fileRecord,
		taxonomyType = {},
		fields = ['sys_id', 'label', 'name'],
	}) {
		const file = {};

		for (const field of fields) {
			switch (field) {
				case 'sys_id':
					file.sysId = fileRecord.getUniqueValue();
					break;

				case 'label':
					file.label =
						fileRecord?.getDisplayValue(taxonomyType.displayColumn) ||
						fileRecord?.getDisplayValue() ||
						UDCConstants.EMPTY_LABEL;
					break;

				case 'name':
					file.name = fileRecord?.getValue(taxonomyType.fieldName) || '';
					break;

				case 'sys_updated_by':
				case 'sys_created_by':
					file[field] = global.UDCGlobal.getUserNameById(fileRecord?.getValue(field));
					break;

				default:
					file[field] = fileRecord.getDisplayValue(field);
			}
		}

		return file;
	}

	static getFileDetailsForRegisteredTaxonomyType(
		fileTableHandledTaxonomyTypes,
		fileSysId,
		fileTable
	) {
		// if there is single registered taxonomy type
		if (fileTableHandledTaxonomyTypes.length === 1) {
			const taxonomyType = fileTableHandledTaxonomyTypes[0];
			const fileObjectRecord = FileTaxonomy.getFileObjectRecord(fileTable, fileSysId);
			return {
				file: {
					...FileTaxonomy.buildFileDetails({
						fileRecord: fileObjectRecord,
						fileTable,
						taxonomyType,
					}),
					isMetadataFile: true,
				},
				icon: taxonomyType.icon,
			};
		}

		// Handle case with multiple taxonomy types
		const taxonomy = new FileTaxonomy(fileTable, fileSysId);
		return {
			file: {
				type: taxonomy.getType(),
				typeSysId: taxonomy.getFileTaxonomySysId(),
				table: fileTable,
				sysId: fileSysId,
				label: taxonomy.getFileLabel() || gs.getMessage('(empty)'),
				name: taxonomy.getFileName(),
			},
			icon: taxonomy.getIcon(),
		};
	}

	static getFileDetailsForUnRegisteredTaxonomyType(fileSysId, fileTable) {
		const fileObjectRecord = FileTaxonomy.getFileObjectRecord(fileTable, fileSysId);
		return {
			file: {
				...FileTaxonomy.buildFileDetails({
					fileRecord: fileObjectRecord,
					fileTable,
				}),
				isMetadataFile: true,
			},
			icon: UDCConstants.fallbackIcons.FILE,
		};
	}

	static getFilesCountInApp(appSysId) {
		const metadataRecords = new GlideAggregate(FileTaxonomy.SYS_METADATA);
		metadataRecords.addQuery('sys_scope', appSysId);
		metadataRecords.addAggregate('COUNT');
		metadataRecords.query();
		metadataRecords.next();
		return metadataRecords.getAggregate('COUNT');
	}

	static handleAppFilesLimit(appSysId) {
		const filesCountInApp = FileTaxonomy.getFilesCountInApp(appSysId);

		const softLimit = gs.getProperty('sn_udc.application_files_soft_limit') || 5000;
		const hardLimit = gs.getProperty('sn_udc.application_files_hard_limit') || 15000;

		const isSoftLimitThresholdNotMet =
			softLimit !== '' && !isNaN(softLimit) && filesCountInApp >= Number(softLimit);
		const isHardLimitThresholdNotMet =
			hardLimit !== '' && !isNaN(hardLimit) && filesCountInApp >= Number(hardLimit);

		if (isSoftLimitThresholdNotMet || isHardLimitThresholdNotMet) {
			return {
				appSysId,
				errorType: isHardLimitThresholdNotMet ? 'error' : 'warn',
				error: {
					message: gs.getMessage(
						'App files cannot be retrieved because the file count has exceeded the allowable threshold.'
					),
					code: 500,
				},
			};
		}
		return null;
	}

	static getFilesByApp(appSysId, enforceLimit) {
		try {
			if (!UDCUtil.isValidRecord('sys_scope', appSysId))
				throw UDCConstants.errors.APP_DOES_NOT_EXISTS;

			// Get all taxonomy types grouped by table name
			var taxonomyTypes = UDCUtil.groupBy(FileTaxonomy.getTaxonomyTypesDetails(), 'table');

			if (enforceLimit === 'true') {
				const limitError = FileTaxonomy.handleAppFilesLimit(appSysId);
				if (limitError) return limitError;
			}
			const files = [];

			const metadataRecords = new GlideRecord(FileTaxonomy.SYS_METADATA);
			metadataRecords.addQuery('sys_class_name', '!=', 'sys_metadata_delete'); // Exclude deleted application files
			metadataRecords.addQuery('sys_scope', appSysId);
			metadataRecords.orderBy('sys_name');
			metadataRecords.query();
			while (metadataRecords.next()) {
				if (!metadataRecords.canRead()) continue;

				const fileSysId = metadataRecords.getValue('sys_id');
				const fileTable = metadataRecords.getValue('sys_class_name');
				const fileTableHandledTaxonomyTypes = taxonomyTypes[fileTable];

				if (fileTableHandledTaxonomyTypes) {
					// metadata table has registered taxonomy types
					files.push(
						FileTaxonomy.getFileDetailsForRegisteredTaxonomyType(
							fileTableHandledTaxonomyTypes,
							fileSysId,
							fileTable
						)
					);
				} else {
					files.push(
						FileTaxonomy.getFileDetailsForUnRegisteredTaxonomyType(fileSysId, fileTable)
					);
				}
			}

			return files;
		} catch (e) {
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
				default:
					message = gs.getMessage('Unhandled exception: {0}', [e]);
					code = 500;
					break;
			}
			return {
				appSysId,
				error: {
					message,
					code,
				},
			};
		}
	}

	static isMetadataFile(fileTable) {
		const tableHierarchy = new GlideTableHierarchy(fileTable);
		return tableHierarchy.getTables().includes(FileTaxonomy.SYS_METADATA);
	}

	/**
	 * Returns whether record is update set record or not
	 * @param {String} fileTable
	 * @returns {boolean}
	 */
	static isUpdateSetRecord(fileTable) {
		if (!fileTable) return false;
		return fileTable === FileTaxonomy.UPDATE_SET_TABLE;
	}

	/**
	 * Get object of Type detail using type Gliderecord
	 * @param {GlideRecord} gr, GlideRecord object represent taxonomy type record
	 * @param {Map} typeToBuildersMap - Map containing taxonomy type sys_ids as keys and associated builders as values
	 * @returns {Object} object of type details
	 */
	static getTaxonomyDetailsByGr(gr, typeToBuildersMap) {
		const sysId = gr.getUniqueValue();

		var taxonomyDetails = {
			sysId,
			description: gr.getDisplayValue('description') || null,
			icon: gr.getDisplayValue('icon') || UDCConstants.fallbackIcons.FILE,
			label: gr.getDisplayValue('label') || null,
			conditionQuery: gr.getDisplayValue('condition_query') || null,
			displayColumn: gr.getDisplayValue('file_label_field') || null,
			fieldName: gr.getDisplayValue('file_name_field') || null,
			table: gr.getValue('table'),
		};
		if (typeToBuildersMap.has(sysId)) taxonomyDetails.builders = typeToBuildersMap.get(sysId);

		return taxonomyDetails;
	}

	/**
	 * Get type to builders map
	 * @returns {Map} typeToBuildersMap - map of type with builders detail from builders table
	 */
	static getTypeToBuildersMap() {
		const builders = FileTaxonomyBuilder.getBuilders({
			include_metadata_tables: 'true',
			include_categories: 'true',
		});
		const typeToBuildersMap = new Map();
		for (let i = 0; i < builders.length; i++) {
			const types = builders[i].metadataTables;
			for (let j = 0; j < types.length; j++) {
				const { typeSysId } = types[j];
				const { order } = types[j];
				if (typeToBuildersMap.has(typeSysId)) {
					const oldValue = typeToBuildersMap.get(typeSysId);
					if (
						!oldValue.find(
							item =>
								item.label === builders[i].label && item.name === builders[i].name
						)
					) {
						oldValue.push({
							label: builders[i].label,
							name: builders[i].name,
							order,
						});
					}
				} else {
					typeToBuildersMap.set(typeSysId, [
						{
							label: builders[i].label,
							name: builders[i].name,
							order,
						},
					]);
				}
			}
		}
		return typeToBuildersMap;
	}

	/**
	 * Update builders detail to type in type cache array
	 * @param {Array} result - File taxonomy types array
	 * @param {Map} typeToBuildersMap - Map containing taxonomy type sys_ids as keys and associated builders as values
	 * @returns {Array} result - updated taxonomy type array
	 */
	static updateBuildersToTypeArray(result, typeToBuildersMap) {
		for (let i = 0; i < result.length; i++) {
			if (!typeToBuildersMap.has(result[i].sysId)) continue;
			result[i].builders = typeToBuildersMap.get(result[i].sysId);
		}
		return result;
	}

	/**
	 * Get array of Type details for taxonomy types
	 * @param {Object} options
	 * @returns {Array} array of taxonomy type details
	 */
	static getTaxonomyTypesDetails(options = {}) {
		const gr = new GlideRecord(FileTaxonomy.TABLE);
		const types = [];
		const { taxonomyTypeSysIds = '' } = options;

		const typeToBuildersMap = FileTaxonomy.getTypeToBuildersMap();

		// Get data from cache first
		const cacheEntryKeyName = FileTaxonomy.#getCacheEntryKeyName(taxonomyTypeSysIds);
		const result = UDCCache.get(
			FileTaxonomy.TAXONOMY_TYPES_SCOPED_CACHE_NAME,
			cacheEntryKeyName
		);
		if (result) return FileTaxonomy.updateBuildersToTypeArray(result, typeToBuildersMap);

		// Cache not found
		if (taxonomyTypeSysIds) {
			gr.addEncodedQuery(`sys_idIN${taxonomyTypeSysIds}`);
			gr.query();
			while (gr.next())
				types.push(FileTaxonomy.getTaxonomyDetailsByGr(gr, typeToBuildersMap));
		} else {
			gr.query();
			while (gr.next())
				types.push(FileTaxonomy.getTaxonomyDetailsByGr(gr, typeToBuildersMap));
		}
		UDCCache.put(FileTaxonomy.TAXONOMY_TYPES_SCOPED_CACHE_NAME, cacheEntryKeyName, types);
		return types;
	}

	constructor(table, sysId) {
		// Find disambiguate taxonomy type with table and sysId
		this.table = table;
		this.sysId = sysId;
		this.fileObjectRecord = null;
		this.taxonomyRecord = null;
		this.fileDetailsFromScript = {};

		// validate params
		if (!table || !sysId) throw UDCConstants.errors.ARTIFACT_DOES_NOT_EXISTS;

		// validate table
		const tableGr = new GlideRecord('sys_db_object');
		if (!tableGr.get('name', this.table)) throw UDCConstants.errors.ARTIFACT_DOES_NOT_EXISTS;

		// If sysId is -1, consider it as a new metadata file
		if (!UDCUtil.isNewAsset(sysId)) {
			// validate file record.
			this.fileObjectRecord = FileTaxonomy.getFileObjectRecord(this.table, sysId);

			if (this.fileObjectRecord?.isValidField('sys_class_name'))
				this.table = this.fileObjectRecord.getValue('sys_class_name');

			if (gs.nil(this.fileObjectRecord) || !this.fileObjectRecord.isValid()) {
				const typeLabel = FileTaxonomy.getTypeLabel(this.table);
				if (typeLabel) {
					const err = new Error(UDCConstants.errors.FILE_DOES_NOT_EXISTS);
					err.typeLabel = typeLabel;
					throw err;
				} else throw UDCConstants.errors.ARTIFACT_DOES_NOT_EXISTS;
			}
		}

		// Find taxonomy record from table & fileObjectRecord
		this.taxonomyRecord = FileTaxonomy.getRecord(this.table, this.fileObjectRecord);

		this.fileDetailsFromScript = FileTaxonomy.getFileDetailsFromScript(
			this.taxonomyRecord,
			this.fileObjectRecord
		);
	}

	/**
	 * Returns whether taxonomy exists for the file table or not
	 * @returns {boolean}
	 */
	isExists() {
		return !gs.nil(this.taxonomyRecord);
	}

	/**
	 * Returns taxonomy type. If label specified, return it. Otherwise return the table label
	 * @returns {String}
	 */
	getType() {
		if (!this.taxonomyRecord) return FileTaxonomy.getTableLabel(this.table);

		return (
			this.taxonomyRecord.getDisplayValue('label') ||
			FileTaxonomy.getTableLabel(this.taxonomyRecord.getValue('table'))
		);
	}

	/**
	 * Returns description of taxonomy type
	 * @returns {String}
	 */
	getDescription() {
		if (!this.taxonomyRecord) return '';

		return this.taxonomyRecord.getDisplayValue('description');
	}

	/**
	 * Returns taxonomy icon in the format of .iix
	 * @returns {String}
	 */
	getIcon() {
		const app = FileTaxonomy.APP_TYPES.find(appType => this.table in appType);
		if (app) {
			const appGr = new GlideRecord(this.table);
			if (appGr.get(this.sysId)) {
				return (
					UDCUtil.getImageUrl(appGr, 'logo') ||
					UDCConstants.fallbackIcons[app[this.table]] ||
					UDCConstants.fallbackIcons.OTHER_APP
				);
			}
		}
		if (!this.taxonomyRecord) return UDCConstants.fallbackIcons.FILE;

		return (
			this.taxonomyRecord.getDisplayValue('icon') || FileTaxonomy.getFallBackIcon(this.table)
		);
	}

	/**
	 * Returns metadata file label
	 * @returns {String}
	 */
	getFileLabel() {
		if (!this.taxonomyRecord)
			return this.fileObjectRecord ? this.fileObjectRecord.getDisplayValue() : '';

		if (this.fileDetailsFromScript.label) return this.fileDetailsFromScript.label;

		if (!this.fileObjectRecord) return '';

		const labelFieldName = this.taxonomyRecord.getValue('file_label_field');
		return !gs.nil(labelFieldName)
			? this.fileObjectRecord.getDisplayValue(labelFieldName)
			: this.fileObjectRecord.getDisplayValue();
	}

	/**
	 * Returns metadata file name
	 * @returns {String}
	 */
	getFileName() {
		if (!this.taxonomyRecord || !this.fileObjectRecord) return '';

		if (this.fileDetailsFromScript.name) return this.fileDetailsFromScript.name;

		const nameFieldName = this.taxonomyRecord.getValue('file_name_field');
		return this.fileObjectRecord.getValue(nameFieldName);
	}

	/**
	 * Returns taxonomy record sysId
	 * @returns {String}
	 */
	getFileTaxonomySysId() {
		if (!this.taxonomyRecord) return '';

		return this.taxonomyRecord.getUniqueValue();
	}

	/**
	 * Returns metadata file object
	 * @returns {GlideRecord}
	 */
	getFileObjectRecord() {
		return this.fileObjectRecord;
	}

	/**
	 * Returns the cache entry key name based on the specified parameters.
	 *
	 * @param {boolean} isIncludeCategory - Indicates whether to include the category in the key name.
	 * @param {boolean} isIncludeMetadataTables - Indicates whether to include the metadata tables in the key name.
	 * @returns {string} The cache entry key name.
	 */
	static #getCacheEntryKeyName(taxonomyTypesList) {
		if (taxonomyTypesList) return 'taxonomy_types_by_sys_ids';
		return 'taxonomy_types'; // taxonomyTypesList is empty or undefined
	}
}
