class DeveloperHistory {
	static type = 'DeveloperHistory';
	static TABLE = 'sn_udc_developer_history';
	static COLUMNS = {
		APP: 'app',
		CONTEXT: 'context',
		TAXONOMY_BUILDER: 'taxonomy_builder',
		FILE_TABLE: 'file_table',
		FILE: 'file',
		LABEL: 'label',
		LAST_ACCESSED: 'last_accessed',
		SYS_ID: 'sys_id',
		URL: 'url',
		USER: 'user',
	};
	static HISTORY_DEFAULT_LIMIT = 20;
	static ENTRY_TYPE = {
		FILE: 'file',
		APP: 'app',
		TOOL: 'tool',
	};

	static #isEntryTypeFile(type) {
		return type === DeveloperHistory.ENTRY_TYPE.FILE;
	}

	static #isEntryTypeApp(type) {
		return type === DeveloperHistory.ENTRY_TYPE.APP;
	}

	static #isEntryTypeTool(type) {
		return type === DeveloperHistory.ENTRY_TYPE.TOOL;
	}

	static #isFileEntryNeeded(types) {
		return types.length === 0 || types.includes(DeveloperHistory.ENTRY_TYPE.FILE);
	}

	static #isAppEntryNeeded(types) {
		return types.length === 0 || types.includes(DeveloperHistory.ENTRY_TYPE.APP);
	}

	static #isToolEntryNeeded(types) {
		return types.length === 0 || types.includes(DeveloperHistory.ENTRY_TYPE.TOOL);
	}

	static #getCommonDetailsFromEntry(gr) {
		return {
			context: gr.getValue(DeveloperHistory.COLUMNS.CONTEXT),
			lastAccessed: {
				value: gr.getValue(DeveloperHistory.COLUMNS.LAST_ACCESSED),
				displayValue: gr.getDisplayValue(DeveloperHistory.COLUMNS.LAST_ACCESSED),
			},
		};
	}

	static #getEntryDetails({ gr, types, taxonomyTypes }) {
		let entryDetails = null;
		const fileTable = gr.getValue(DeveloperHistory.COLUMNS.FILE_TABLE);
		const isAppRecord = UDCUtil.isAppRecord(fileTable);
		const fileObj = gr.getValue(DeveloperHistory.COLUMNS.FILE);

		if (isAppRecord) {
			entryDetails = DeveloperHistory.#getAppEntryDetails(gr);
			if (entryDetails) entryDetails.type = DeveloperHistory.ENTRY_TYPE.APP;
		} else if (fileObj && DeveloperHistory.#isFileEntryNeeded(types)) {
			entryDetails = DeveloperHistory.#getFileEntryDetails(gr, taxonomyTypes);
			if (entryDetails) entryDetails.type = DeveloperHistory.ENTRY_TYPE.FILE;
		} else if (!fileObj) {
			entryDetails = DeveloperHistory.#getToolEntryDetails(gr);
			if (entryDetails) entryDetails.type = DeveloperHistory.ENTRY_TYPE.TOOL;
		}

		return entryDetails;
	}

	static #logErrorMessage(gr, e, fallbackMessage, type) {
		const errorMessage = `${type} - ${gr.getValue(DeveloperHistory.COLUMNS.SYS_ID)} - ${
			e?.message || e?.detail || fallbackMessage
		}`;
		gs.error(errorMessage);
	}

	static #getFileEntryDetails(gr, taxonomyTypes) {
		try {
			const fileSysId = gr.getValue(DeveloperHistory.COLUMNS.FILE);
			const fileTable = gr.getValue(DeveloperHistory.COLUMNS.FILE_TABLE);
			const fileObject = FileTaxonomy.getFileObjectRecord(fileTable, fileSysId);

			if (!UDCUtil.isValidGlideRecord(fileObject)) {
				const fileTableHandledTaxonomyTypes = taxonomyTypes[fileTable];
				let typeSysId;
				let type;
				if (fileTableHandledTaxonomyTypes) {
					typeSysId = fileTableHandledTaxonomyTypes[0]?.sysId || '';
					type = fileTableHandledTaxonomyTypes[0]?.label;
				}

				return {
					icon: FileTaxonomy.getFallBackIcon(fileTable),
					builder: DeveloperHistory.#getToolDetailsFromFile(gr),
					file: {
						label: gr.getValue(DeveloperHistory.COLUMNS.LABEL),
						name: '',
						table: fileTable,
						sysId: fileSysId,
						type: type || FileTaxonomy.getTableLabel(fileTable),
						typeSysId,
					},
				};
			}

			let fileDetails = null;
			const fileTableHandledTaxonomyTypes = taxonomyTypes[fileTable];
			if (fileTableHandledTaxonomyTypes) {
				// metadata table has registered taxonomy types
				fileDetails = FileTaxonomy.getFileDetailsForRegisteredTaxonomyType(
					fileTableHandledTaxonomyTypes,
					fileSysId,
					fileTable
				);
			} else if (FileTaxonomy.isMetadataFile(fileTable)) {
				fileDetails = FileTaxonomy.getFileDetailsForUnRegisteredTaxonomyType(
					fileSysId,
					fileTable
				);
			}

			if (!fileDetails) return null;

			const { file = {}, icon = '' } = fileDetails;

			// File scope details
			const artifactScope = fileObject.sys_scope.getRefRecord();
			file.scope = FileTaxonomy.getArtifactScopeDetails(fileTable, fileObject);
			if (file.scope && UDCUtil.isValidGlideRecord(artifactScope))
				file.scope.class = artifactScope.getValue('sys_class_name') || '';

			return {
				url: gr.getValue(DeveloperHistory.COLUMNS.URL),
				icon,
				builder: DeveloperHistory.#getToolDetailsFromFile(gr),
				file: {
					...file,
					label: file.label || gr.getValue(DeveloperHistory.COLUMNS.LABEL),
				},
			};
		} catch (e) {
			DeveloperHistory.#logErrorMessage(gr, e, 'File entry details fetch failed', 'File');
		}
	}

	static #getAppDetailsFromFile(gr) {
		try {
			const fileSysId = gr.getValue(DeveloperHistory.COLUMNS.FILE);
			const fileTable = gr.getValue(DeveloperHistory.COLUMNS.FILE_TABLE);
			const fileObjectRecord = FileTaxonomy.getFileObjectRecord(fileTable, fileSysId);

			if (!UDCUtil.isValidGlideRecord(fileObjectRecord)) return null;

			const artifactScope = fileObjectRecord.sys_scope.getRefRecord();

			if (!UDCUtil.isValidGlideRecord(artifactScope)) return null;

			const appSysId = artifactScope.getUniqueValue();

			if (appSysId === 'global') return null;

			const appTable = artifactScope.getValue('sys_class_name');

			const { url } = FileTaxonomy.getFileDetails({
				fileTable: 'sys_scope',
				fileSysId: appSysId,
			});
			return {
				url,
				file: {
					table: appTable,
					sysId: appSysId,
					label: artifactScope.getDisplayValue(),
					name: artifactScope.getValue('scope'),
					generated_using_ai: false, // Will be set subsequently for all the apps in one go
				},
			};
		} catch (e) {
			DeveloperHistory.#logErrorMessage(
				gr,
				e,
				'App details from file entry failed',
				'App from file'
			);
		}
	}

	static #getToolDetailsFromFile(gr, isToolUrlRequired) {
		try {
			const taxonomyBuilder = gr.getValue(DeveloperHistory.COLUMNS.TAXONOMY_BUILDER);

			if (!taxonomyBuilder) return undefined;

			const builder = FileTaxonomyBuilder.getBuilderFromCache(taxonomyBuilder);

			if (!builder.url && isToolUrlRequired) return null;

			return builder;
		} catch (e) {
			DeveloperHistory.#logErrorMessage(
				gr,
				e,
				'Tool details from file entry failed',
				'Tool from file'
			);
		}
	}

	static #getSysIdFromUrl(url) {
		if (!url.includes('sysId')) return '';

		const queryParams = UDCUtil.getQueryParamsFromUrl(url) || {};
		return queryParams.sysId || '';
	}

	static #getAppEntryDetails(gr) {
		try {
			const appObject = gr.app.getRefRecord();
			const appSysId = gr.getValue(DeveloperHistory.COLUMNS.APP);
			let appTable = gr.getValue(DeveloperHistory.COLUMNS.FILE_TABLE);
			if (!UDCUtil.isValidGlideRecord(appObject)) {
				return {
					icon: FileTaxonomy.getFallBackIcon(appTable),
					builder: DeveloperHistory.#getToolDetailsFromFile(gr),
					file: {
						table: appTable,
						sysId:
							appSysId ||
							DeveloperHistory.#getSysIdFromUrl(
								gr.getValue(DeveloperHistory.COLUMNS.URL)
							), // appSysId is coming blank for deleted records
						label: gr.getValue(DeveloperHistory.COLUMNS.LABEL),
						name: '',
						type: FileTaxonomy.getTableLabel(appTable),
						generated_using_ai: false,
					},
				};
			}
			appTable = appObject.getValue('sys_class_name');

			const { app } = gr;

			const appLogo = app.logo.getDisplayValue();

			return {
				url: gr.getValue(DeveloperHistory.COLUMNS.URL),
				icon: gs.nil(appLogo) ? FileTaxonomy.getFallBackIcon(appTable) : `/${appLogo}.iix`,
				builder: DeveloperHistory.#getToolDetailsFromFile(gr),
				file: {
					table: appTable,
					sysId: appSysId,
					label: app.getDisplayValue() || gr.getValue(DeveloperHistory.COLUMNS.LABEL),
					name: app.scope?.toString(),
					type: UDCUtil.APP_TABLE_LABEL_MAP[app.sys_class_name],
					generated_using_ai: false,
				},
			};
		} catch (e) {
			DeveloperHistory.#logErrorMessage(gr, e, 'App entry details fetch failed', 'App');
		}
	}

	static #getToolEntryDetails(gr) {
		try {
			const taxonomyBuilder = gr.getValue(DeveloperHistory.COLUMNS.TAXONOMY_BUILDER);

			if (!taxonomyBuilder) return undefined;

			const builderDetails = FileTaxonomyBuilder.getBuilderFromCache(taxonomyBuilder);

			return {
				...builderDetails,
				url: gr.getValue(DeveloperHistory.COLUMNS.URL) || builderDetails.url,
				label: builderDetails.label || gr.getValue(DeveloperHistory.COLUMNS.LABEL),
			};
		} catch (e) {
			DeveloperHistory.#logErrorMessage(gr, e, 'Tool entry details fetch failed', 'Tool');
		}
	}

	static #checkAndDeriveAdditionalEntries({ gr, commonDetails, types }) {
		const additionalEntries = [];
		// Derive tool records from file entry
		if (
			gr.getValue(DeveloperHistory.COLUMNS.FILE) &&
			DeveloperHistory.#isToolEntryNeeded(types)
		) {
			// Tool entry from file
			const toolEntry = DeveloperHistory.#getToolDetailsFromFile(gr, true);
			if (toolEntry) {
				additionalEntries.push({
					...commonDetails,
					...toolEntry,
					type: DeveloperHistory.ENTRY_TYPE.TOOL,
				});
			}
		}

		return additionalEntries;
	}

	static #extractChangedEntryProperties(recent, entry, now) {
		// Initialize with required properties
		const updatedRecentItem = {
			lastAccessed: {
				value: now,
			},
			sysId: recent.sysId,
		};

		// Check and add changed properties
		if (recent.builder !== entry.builder) updatedRecentItem.builder = entry.builder;

		if (recent.builderSysId !== entry.builderSysId)
			updatedRecentItem.builderSysId = entry.builderSysId;

		if (recent.label !== entry.label) updatedRecentItem.label = entry.label;

		if (recent.url !== entry.url) updatedRecentItem.url = entry.url;

		if (recent.table !== entry.table) updatedRecentItem.table = entry.table;

		return updatedRecentItem;
	}

	static #shouldAddEntry(entry, uniqueToolUrls, uniqueFileSysIds) {
		// For tool entries, check URL uniqueness
		if (DeveloperHistory.#isEntryTypeTool(entry.type)) {
			if (!entry.url || uniqueToolUrls.has(entry.url)) return false;

			uniqueToolUrls.add(entry.url);
			return true;
		}

		// For entries without a file sysId
		if (!entry.file?.sysId) {
			if (!entry.file) entry.file = {};
			entry.file.sysId = gs.generateGUID();
			return true;
		}

		// For file/app entries, check file sysId uniqueness
		if (uniqueFileSysIds.has(entry.file.sysId)) return false;

		uniqueFileSysIds.add(entry.file.sysId);
		return true;
	}

	static #formatHistoryEntries(gr, type = '') {
		const types = type ? type.trim().split(',') : [];
		const entries = [];
		let totalCount = 0;
		// Get all taxonomy types grouped by table name
		const taxonomyTypes = UDCUtil.groupBy(FileTaxonomy.getTaxonomyTypesDetails(), 'table');

		// Create a Set to track unique values during processing
		const uniqueToolUrls = new Set();
		const uniqueFileSysIds = new Set();

		while (gr.next()) {
			// Create a simple entry object from GlideRecord for filtering
			const simpleEntry = {
				type: gr.getValue(DeveloperHistory.COLUMNS.TYPE),
				url: gr.getValue(DeveloperHistory.COLUMNS.URL),
				file: {
					sysId: gr.getValue(DeveloperHistory.COLUMNS.FILE),
				},
			};

			// Use the helper method for early filtering
			const shouldProcess = DeveloperHistory.#shouldAddEntry(
				simpleEntry,
				uniqueToolUrls,
				uniqueFileSysIds
			);

			// Only process entries that pass the early filtering
			if (shouldProcess) {
				const commonDetails = DeveloperHistory.#getCommonDetailsFromEntry(gr);
				const entryDetails = DeveloperHistory.#getEntryDetails({
					gr,
					types,
					taxonomyTypes,
				});

				if (entryDetails) {
					entries.push({
						...commonDetails,
						...entryDetails,
					});
					totalCount += 1;
				}

				// For additional entries, we still need to apply filtering
				const additionalEntries = DeveloperHistory.#checkAndDeriveAdditionalEntries({
					gr,
					commonDetails,
					types,
				});

				if (additionalEntries.length > 0) {
					for (const addEntry of additionalEntries) {
						// Use the helper method for filtering additional entries
						if (
							DeveloperHistory.#shouldAddEntry(
								addEntry,
								uniqueToolUrls,
								uniqueFileSysIds
							)
						) {
							entries.push(addEntry);
							totalCount += 1;
						}
					}
				}
			}
		}

		return {
			entries,
			totalCount: parseInt(totalCount, 10),
		};
	}

	static #generateFilterQuery(options) {
		const gr = new GlideRecord(DeveloperHistory.TABLE);
		gr.addQuery(DeveloperHistory.COLUMNS.USER, gs.getUserID());

		// TODO: Search filter need to be updated if product suggests any other columns
		if (options.searchText)
			gr.addQuery(DeveloperHistory.COLUMNS.LABEL, 'CONTAINS', options.searchText);

		if (options.context) gr.addQuery(DeveloperHistory.COLUMNS.CONTEXT, options.context);

		if (options.type) DeveloperHistory.#checkAndAddTypeQueries(options.type, gr);

		if (gr.isEncodedQueryValid(options.encodedQuery)) gr.addEncodedQuery(options.encodedQuery);

		return gr.getEncodedQuery();
	}

	static getHistoryEntries(options) {
		const encodedQuery = DeveloperHistory.#generateFilterQuery(options);
		const gr = new GlideRecord(DeveloperHistory.TABLE);
		gr.addEncodedQuery(encodedQuery);
		gr.orderByDesc(DeveloperHistory.COLUMNS.LAST_ACCESSED); // Sorting by last accessed
		gr.query();

		const { entries, totalCount } = DeveloperHistory.#formatHistoryEntries(gr, options.type);

		if (options.limit) {
			const limit = DeveloperHistory.#validateLimitParam(options.limit);
			const offset = DeveloperHistory.#validateOffsetParam(options.offset);
			return {
				entries: entries.slice(offset, offset + limit),
				totalCount,
			};
		}

		return {
			entries,
			totalCount: parseInt(totalCount, 10),
		};
	}

	static #validateLimitParam(limit) {
		return DeveloperHistory.isValidNumber(limit)
			? parseInt(limit, 10)
			: DeveloperHistory.HISTORY_DEFAULT_LIMIT;
	}

	static #validateOffsetParam(offset) {
		return DeveloperHistory.isValidNumber(offset) ? parseInt(offset, 10) : 0;
	}

	static #checkAndAddTypeQueries(type = '', gr) {
		const types = type ? type.trim().split(',') : [];
		let encodedQueryForType = '';
		for (const type of types) {
			switch (type) {
				case DeveloperHistory.ENTRY_TYPE.APP: {
					encodedQueryForType += encodedQueryForType.length ? '^OR' : '';
					encodedQueryForType += `${DeveloperHistory.COLUMNS.FILE_TABLE}IN${Object.keys(
						UDCConstants.APP_TABLES
					).join(',')}`;
					break;
				}
				case DeveloperHistory.ENTRY_TYPE.TOOL: {
					encodedQueryForType += encodedQueryForType.length ? '^OR' : '';
					encodedQueryForType += `${DeveloperHistory.COLUMNS.APP}ISEMPTY`;
					break;
				}
				default: {
					encodedQueryForType += encodedQueryForType.length ? '^OR' : '';
					encodedQueryForType += `${DeveloperHistory.COLUMNS.FILE}!=`;
					break;
				}
			}
		}

		if (gr.isEncodedQueryValid(encodedQueryForType)) gr.addEncodedQuery(encodedQueryForType);
	}

	static isValidNumber(value) {
		const parsedVal = parseInt(value, 10);
		if (isNaN(value) || isNaN(parsedVal)) return false;

		if (parsedVal < 0) return false;

		return true;
	}

	static #isHistoryEntryValid(entry) {
		const { builder, builderSysId, label, sysId, type, url } = entry;

		// Ensure file/app should contain sysId
		if (
			[DeveloperHistory.ENTRY_TYPE.FILE, DeveloperHistory.ENTRY_TYPE.APP].includes(type) &&
			!sysId
		)
			return false;

		// Ensure tool contain builder
		if (DeveloperHistory.#isEntryTypeTool(type) && !(builder || builderSysId)) return false;

		// url & label should be there irrespective of history type
		if (!url || !label) return false;

		return true;
	}

	static validatePayload(options) {
		if (!options || !options.payload) throw new Error('Invalid payload data.');

		const { context, entries } = options.payload;

		if (!context) throw new Error('Context not valid.');

		const validEntries = [];
		for (const entry of entries) {
			let valid = true;
			// Check and get url for asset if not present and is builder file changed flag is true
			// This is to track newly created assets where url will update on page reload
			if (!entry.url && entry.isBuilderFileChanged) {
				const { url } = FileTaxonomy.getFileDetails({
					fileTable: entry.table,
					fileSysId: entry.sysId,
				});
				entry.url = url;
			}
			if (!entry || !entry.type || !DeveloperHistory.#isHistoryEntryValid(entry))
				valid = false;

			if (valid) validEntries.push(entry);
		}

		if (!validEntries.length) throw new Error('Invalid history entry data.');

		return validEntries;
	}

	static addHistoryEntries(options) {
		const { context, entries = [], validEntries = [] } = options.payload;

		const { entriesToBeCreated, updatedEntryIds } = DeveloperHistory.#checkAndUpdateDuplicates(
			context,
			validEntries
		);

		const createdEntryIds = [];
		if (entriesToBeCreated && entriesToBeCreated.length) {
			// First, separate app entries from other entries
			const appEntries = [];
			const otherEntries = [];

			const now = new GlideDateTime();
			for (const entry of entriesToBeCreated) {
				if (!entry.table) entry.table = DeveloperHistory.#getTableName(entry.type);
				if (DeveloperHistory.#isEntryTypeApp(entry.type) && entry.sysId !== 'global')
					appEntries.push(entry);
				else if (entry.sysId !== 'global') otherEntries.push(entry);
			}

			// Handle app entries with a single query
			if (appEntries.length > 0) {
				const appSysIds = appEntries.map(entry => entry.sysId);
				const appEntriesMap = new Map(appEntries.map(entry => [entry.sysId, entry]));

				const gr = new GlideRecord(DeveloperHistory.TABLE);
				gr.addQuery(DeveloperHistory.COLUMNS.USER, gs.getUserID());
				gr.addQuery(DeveloperHistory.COLUMNS.APP, 'IN', appSysIds.join(','));
				gr.addQuery(DeveloperHistory.COLUMNS.CONTEXT, context);
				gr.query();

				// Process existing app entries
				const processedAppSysIds = new Set();
				while (gr.next()) {
					const appSysId = gr.getValue(DeveloperHistory.COLUMNS.APP);
					processedAppSysIds.add(appSysId);

					if (updatedEntryIds.includes(gr.getUniqueValue())) continue;

					const entry = appEntriesMap.get(appSysId);
					const appObject = gr.app.getRefRecord();
					if (!UDCUtil.isValidGlideRecord(appObject)) continue;

					const updatedEntryId =
						DeveloperHistory.#updateHistoryEntry({
							table: appObject.getValue('sys_class_name'),
							sysId: gr.getUniqueValue(),
							label: entry.label,
							url: entry.url,
							lastAccessed: {
								value: now,
							},
						})[0] || '';

					if (updatedEntryId) updatedEntryIds.push(updatedEntryId);
				}

				// Process new app entries that weren't found in the database
				for (const entry of appEntries) {
					if (!processedAppSysIds.has(entry.sysId)) {
						// Validate app record before creating
						const appObject = new GlideRecord(entry.table);
						appObject.get(entry.sysId);

						if (UDCUtil.isValidGlideRecord(appObject)) {
							createdEntryIds.push(
								...DeveloperHistory.#createHistoryEntry(context, entry)
							);
						}
					}
				}
			}

			for (const entry of otherEntries)
				createdEntryIds.push(...DeveloperHistory.#createHistoryEntry(context, entry));
		}

		const entryIds = [...createdEntryIds, ...updatedEntryIds];
		const formattedEntries = entryIds.length
			? DeveloperHistory.#generateEntriesFromSysIds(entryIds)
			: [];

		const { appEntries, appEntrySysIds } = formattedEntries.reduce(
			(acc, entry) => {
				if (entry.type === DeveloperHistory.ENTRY_TYPE.APP) {
					acc.appEntries.push(entry);
					if (entry.file && entry.file.sysId) acc.appEntrySysIds.push(entry.file.sysId);
				}
				return acc;
			},
			{
				appEntries: [],
				appEntrySysIds: [],
			}
		);

		const aiGeneratedAppMap = AppDetailsService.getAIGeneratedAppMap(appEntrySysIds);
		for (const entry of appEntries) {
			if (aiGeneratedAppMap[entry.file.sysId])
				entry.file.generated_using_ai = aiGeneratedAppMap[entry.file.sysId] || false;
		}
		if (validEntries.length !== entries.length) {
			return {
				message: `${validEntries.length} out of ${entries.length} history entries added/updated.`,
				entries: formattedEntries,
			};
		}
		return {
			entries: formattedEntries,
		};
	}

	static #getThresholdTimePropVal() {
		const thresholdTimePropVal = gs.getProperty('sn_udc.history_threshold_time', '15') || '';
		if (DeveloperHistory.isValidNumber(thresholdTimePropVal))
			return `00:${parseInt(thresholdTimePropVal, 10)}:00`;

		return '00:15:00';
	}

	static #checkAndUpdateDuplicates(context, entries) {
		const thresholdTime = new GlideTime();
		thresholdTime.setValue(DeveloperHistory.#getThresholdTimePropVal());
		const currentDateTime = new GlideDateTime();
		currentDateTime.subtract(thresholdTime);
		const thresholdTimeValue = currentDateTime.getValue();
		const thresholdTimeNumeric = currentDateTime.getNumericValue();

		const entriesWithinThreshold = DeveloperHistory.#getRecentHistoryEntries(
			context,
			thresholdTimeValue
		);

		// Create lookup maps for faster matching
		const fileEntryMap = new Map();
		const toolEntryMap = new Map();

		// Pre-process recent entries for faster lookup
		entriesWithinThreshold.forEach(recent => {
			const lastAccessed = new GlideDateTime(recent.lastAccessed.value);
			// Only consider entries within threshold
			if (lastAccessed.getNumericValue() <= thresholdTimeNumeric) return;

			// Map by file sysId for file/app entries
			if (recent.file && recent.file.sysId) fileEntryMap.set(recent.file.sysId, recent);

			// Map by URL for tool entries
			if (recent.url) toolEntryMap.set(recent.url, recent);
		});

		const updatedEntryIds = [];
		const entriesToBeCreated = [];
		const now = new GlideDateTime();

		// Process entries with optimized lookups
		for (const entry of entries) {
			let recent = null;

			// Find matching recent entry using appropriate map
			if (
				[DeveloperHistory.ENTRY_TYPE.FILE, DeveloperHistory.ENTRY_TYPE.APP].includes(
					entry.type
				) &&
				entry.sysId
			)
				recent = fileEntryMap.get(entry.sysId);
			else if (DeveloperHistory.#isEntryTypeTool(entry.type) && entry.url)
				recent = toolEntryMap.get(entry.url);

			// Update if match found
			if (recent) {
				const updatedRecentItem = DeveloperHistory.#extractChangedEntryProperties(
					recent,
					entry,
					now
				);
				const updatedEntryId =
					DeveloperHistory.#updateHistoryEntry(updatedRecentItem)[0] || '';
				if (updatedEntryId) updatedEntryIds.push(updatedEntryId);

				// Handle file entry app association
				if (DeveloperHistory.#isEntryTypeFile(entry.type)) {
					const appEntryId =
						DeveloperHistory.#upsertAppHistoryEntryFromFile(context, recent.sysId)[0] ||
						'';
					if (appEntryId) updatedEntryIds.push(appEntryId);
				}
			} else {
				// No match found, create new entry
				entriesToBeCreated.push(entry);
			}
		}

		return {
			entriesToBeCreated,
			updatedEntryIds,
		};
	}

	static #shouldUpdateRecord(entry, recent) {
		// Comparing url values for tool entries and sysId values for other entries whether to update existing record or not
		return (
			([DeveloperHistory.ENTRY_TYPE.FILE, DeveloperHistory.ENTRY_TYPE.APP].includes(
				entry.type
			) &&
				entry.sysId === recent.file.sysId) ||
			(DeveloperHistory.#isEntryTypeTool(entry.type) && entry.url === recent.url)
		);
	}

	static #getRecentHistoryEntries(context, offsetTime) {
		const gr = new GlideRecord(DeveloperHistory.TABLE);
		gr.addQuery(DeveloperHistory.COLUMNS.USER, gs.getUserID());
		gr.addQuery(DeveloperHistory.COLUMNS.CONTEXT, context);
		gr.addEncodedQuery(`${DeveloperHistory.COLUMNS.LAST_ACCESSED}>${offsetTime}`);
		gr.query();
		const recentEntries = [];
		while (gr.next()) {
			recentEntries.push({
				file: {
					sysId:
						gr.getValue(DeveloperHistory.COLUMNS.FILE) ||
						gr.getValue(DeveloperHistory.COLUMNS.APP),
				},
				label: gr.getValue(DeveloperHistory.COLUMNS.LABEL),
				lastAccessed: {
					value: gr.getValue(DeveloperHistory.COLUMNS.LAST_ACCESSED),
				},
				sysId: gr.getValue(DeveloperHistory.COLUMNS.SYS_ID),
				url: gr.getValue(DeveloperHistory.COLUMNS.URL),
			});
		}

		return recentEntries;
	}

	static #getTableName(type) {
		if (DeveloperHistory.#isEntryTypeFile(type)) return 'sys_metadata';
		if (DeveloperHistory.#isEntryTypeApp(type)) return 'sys_scope';
		return '';
	}

	static #createHistoryEntry(context, entry) {
		const fileTable = entry.table || DeveloperHistory.#getTableName(entry.type);
		if (
			DeveloperHistory.#isEntryTypeFile(entry.type) &&
			!FileTaxonomy.isMetadataFile(fileTable)
		)
			return [];

		const gr = new GlideRecord(DeveloperHistory.TABLE);
		gr.initialize();
		gr.setValue(DeveloperHistory.COLUMNS.LABEL, entry.label);
		gr.setValue(DeveloperHistory.COLUMNS.URL, entry.url);
		gr.setValue(DeveloperHistory.COLUMNS.CONTEXT, context);
		gr.setValue(DeveloperHistory.COLUMNS.FILE_TABLE, fileTable);

		if (DeveloperHistory.#isEntryTypeFile(entry.type))
			gr.setValue(DeveloperHistory.COLUMNS.FILE, entry.sysId);
		if (DeveloperHistory.#isEntryTypeApp(entry.type))
			gr.setValue(DeveloperHistory.COLUMNS.APP, entry.sysId);

		gr.setValue(DeveloperHistory.COLUMNS.USER, gs.getUserID());
		gr.setValue(DeveloperHistory.COLUMNS.LAST_ACCESSED, new GlideDateTime());
		gr.setValue(
			DeveloperHistory.COLUMNS.TAXONOMY_BUILDER,
			FileTaxonomyBuilder.getBuilderSysId(entry.builder || entry.builderSysId) || ''
		);
		const entrySysId = gr.insert();

		// Upsert app entry for file entry
		if (!DeveloperHistory.#isEntryTypeFile(entry.type)) return [entrySysId];

		const appEntrySysId =
			DeveloperHistory.#upsertAppHistoryEntryFromFile(context, entrySysId)[0] || '';

		return appEntrySysId ? [entrySysId, appEntrySysId] : [entrySysId];
	}

	static #updateHistoryEntry(recent) {
		if (!recent || !recent.sysId) return [];

		const gr = new GlideRecord(DeveloperHistory.TABLE);
		if (!gr.get(DeveloperHistory.COLUMNS.SYS_ID, recent.sysId)) return [];

		// Define a mapping of input properties to database columns
		const fieldMappings = {
			table: DeveloperHistory.COLUMNS.FILE_TABLE,
			lastAccessed: {
				field: DeveloperHistory.COLUMNS.LAST_ACCESSED,
				transform: value => value.value, // Extract .value property if needed
			},
			url: DeveloperHistory.COLUMNS.URL,
			label: DeveloperHistory.COLUMNS.LABEL,
			builder: {
				field: DeveloperHistory.COLUMNS.TAXONOMY_BUILDER,
				transform: value => FileTaxonomyBuilder.getBuilderSysId(value) || '',
			},
			builderSysId: {
				field: DeveloperHistory.COLUMNS.TAXONOMY_BUILDER,
				transform: value => FileTaxonomyBuilder.getBuilderSysId(value) || '',
			},
		};

		// Only set values for fields that exist in the input
		Object.keys(recent).forEach(key => {
			if (fieldMappings[key]) {
				const mapping = fieldMappings[key];
				const field = typeof mapping === 'object' ? mapping.field : mapping;
				const value =
					typeof mapping === 'object' && mapping.transform
						? mapping.transform(recent[key])
						: recent[key];

				gr.setValue(field, value || '');
			}
		});

		gr.update();
		return [recent.sysId];
	}

	static #upsertAppHistoryEntryFromFile(context, entrySysId) {
		const historyGr = new GlideRecord(DeveloperHistory.TABLE);
		historyGr.get(entrySysId);
		if (historyGr) {
			const appDetails = DeveloperHistory.#getAppDetailsFromFile(historyGr);
			if (appDetails) {
				const appGr = new GlideRecord(DeveloperHistory.TABLE);
				appGr.addQuery(DeveloperHistory.COLUMNS.USER, gs.getUserID());
				appGr.addQuery(DeveloperHistory.COLUMNS.APP, appDetails.file.sysId);
				appGr.addQuery(DeveloperHistory.COLUMNS.CONTEXT, context);
				appGr.query();
				if (appGr.next()) {
					return DeveloperHistory.#updateHistoryEntry({
						table: appDetails.file.table,
						sysId: appGr.getUniqueValue(),
						label: appDetails.file.label,
						url: appDetails.url,
						lastAccessed: {
							value: new GlideDateTime(),
						},
					});
				}

				return DeveloperHistory.#createHistoryEntry(context, {
					sysId: appDetails.file.sysId,
					type: DeveloperHistory.ENTRY_TYPE.APP,
					url: appDetails.url,
					label: appDetails.file.label,
					table: appDetails.file.table,
				});
			}
		}
		return true;
	}

	static #generateEntriesFromSysIds(entrySysIds) {
		// Sample query: sys_id=4d918a61a308021018d4189b66fcdada^ORsys_id=cd918a61a308021018d4189b66fcdada
		const encodedQuery = entrySysIds
			.map(entrySysId => {
				return `sys_id=${entrySysId}`;
			})
			.join('^OR');
		const gr = new GlideRecord(DeveloperHistory.TABLE);
		gr.addEncodedQuery(encodedQuery);
		gr.query();

		const { entries } = DeveloperHistory.#formatHistoryEntries(gr, '');

		return entries;
	}

	static getRecentEntries(options) {
		// To improve flexibility send this in query params, default set to get last 30 days records
		if (!options.encodedQuery)
			options.encodedQuery = 'last_accessed>=javascript:gs.beginningOfLast30Days()';
		// Developer history method to get history entries
		const historyEntries = DeveloperHistory.getHistoryEntries(options);
		const entries = historyEntries?.entries;

		const recents = {};
		const totalCount = entries?.length || 0;

		if (!entries || !entries.length) {
			return {
				totalCount: parseInt(totalCount, 10),
				recents,
			};
		}

		const today = new GlideDateTime(gs.beginningOfToday());
		const yesterday = new GlideDateTime(gs.beginningOfYesterday());
		const last7Days = new GlideDateTime(gs.beginningOfLast7Days());
		const last30Days = new GlideDateTime(gs.beginningOfLast30Days());
		const endOfToday = new GlideDateTime(gs.endOfToday());

		const dateGroups = [
			{
				type: 'T', // today
				startTime: today,
				endTime: endOfToday,
			},
			{
				type: 'Y', // yesterday
				startTime: yesterday,
				endTime: today,
			},
			{
				type: 'L7', // last 7 days
				startTime: last7Days,
				endTime: yesterday,
			},
			{
				type: 'L30', // last 30 days
				startTime: last30Days,
				endTime: last7Days,
			},
		];
		let criteriaIndex = 0;
		let criteria = dateGroups[criteriaIndex];
		let entryIndex = 0;

		// Entries are coming in sorted order by last accessed time
		while (entryIndex < totalCount) {
			const entry = entries[entryIndex];
			entry.lastAccessed.category = criteria.type;

			if (!recents[entry.type]) recents[entry.type] = [];

			const lastAccessed = new GlideDateTime(entry.lastAccessed.value);
			if (criteriaIndex === dateGroups.length - 1) {
				// For last date group pushing directly without any check
				recents[entry.type].push(entry);
				entryIndex++;
			} else {
				// Check whether record is witnin criteria or not
				const isBetween =
					lastAccessed.getNumericValue() >= criteria.startTime.getNumericValue() &&
					lastAccessed.getNumericValue() < criteria.endTime.getNumericValue();
				if (isBetween) {
					entryIndex++;
					recents[entry.type].push(entry);
				} else {
					criteriaIndex++;
					criteria = dateGroups[criteriaIndex];
				}
			}
		}

		if (recents.app && recents.app.length > 0) {
			const appEntrySysIds = recents.app.map(entry => entry.file.sysId).filter(Boolean);
			const aiGeneratedAppMap = AppDetailsService.getAIGeneratedAppMap(appEntrySysIds);
			recents.app.forEach(appEntry => {
				appEntry.file.generated_using_ai = aiGeneratedAppMap[appEntry.file.sysId] || false;
			});
		}

		return {
			totalCount: parseInt(totalCount, 10),
			recents,
		};
	}
}
