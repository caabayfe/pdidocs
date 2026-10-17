class ApplicationService {
	static type = 'ApplicationService';
	static APPS_TABLE = 'sys_scope';
	static CUSTOM_APPS_TABLE = 'sys_app';
	static DEFAULT_MODE = 'custom_app';
	static STORE_APP_TABLE = 'sys_store_app';
	static DEFAULT_LIMIT = 50;
	static IS_APP_CUSTOMIZATION_ENABLED =
		sn_app_customization.AppCustomizationAPI.isAppCustomizationFeatureEnabled();
	static DEFAULT_QUERY = 'private=false^ORprivateISEMPTY^active=true';
	static FILTER_ACTIVE_QUERY = 'active=true';
	static APP_MODE_ERROR_MESSAGE =
		'Invalid app mode sent. Please send valid app modes (all | store_app | custom_app).';
	static IS_MAINT_USER = gs.hasRole('maint');
	static APP_MODE = {
		all: 'all',
		store_app: 'store_app',
		custom_app: 'custom_app',
	};
	static MODE_TABLE = {
		[ApplicationService.APP_MODE.all]: 'sys_scope',
		[ApplicationService.APP_MODE.store_app]: 'sys_store_app',
		[ApplicationService.APP_MODE.custom_app]: 'sys_app',
	};
	/**
	 * Returns validated query params
	 * @param {Object} params
	 * @returns {Object}
	 */
	static validateQueryParams(params) {
		const validatedQueryParams = {};
		validatedQueryParams.fields =
			params.fields && params.fields !== '' ? params.fields.split(',') : [];
		validatedQueryParams.mode =
			params.mode && params.mode !== '' ? params.mode : ApplicationService.DEFAULT_MODE;
		validatedQueryParams.filterQuery = params.filter_query || '';
		validatedQueryParams.includeDisplayValue = params.display_value || false;
		const limit = parseInt(params.limit, 10);
		validatedQueryParams.limit = !isNaN(limit) ? limit : ApplicationService.DEFAULT_LIMIT;
		const offset = parseInt(params.offset, 10);
		validatedQueryParams.offset = !isNaN(offset) && offset > -1 ? offset : 0;
		return validatedQueryParams;
	}
	/**
	 * Returns true if the app is custom app or the app is customizable
	 * @param {sysId}
	 * @returns {boolean}
	 */
	static canCustomizeApp(sysId) {
		return sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(sysId);
	}
	/**
	 * Returns application object
	 * @param {Array<string>} fields
	 * @param {GlideRecordUtil} glideRecordUtil
	 * @param {GlideRecord} gr
	 * @returns {Object} application object.
	 */
	static glideRecordToJSON({ fields, glideRecordUtil, gr, includeDisplayValue }) {
		const jsonObject = {};
		if (fields.length === 0) fields = glideRecordUtil.getFields(gr);
		fields.forEach(field => {
			if (includeDisplayValue) {
				jsonObject[field] = {
					display_value: gr.getDisplayValue(field),
					value: gr.getValue(field),
				};
			} else jsonObject[field] = gr.getValue(field);
		});
		return jsonObject;
	}

	/**
	 * Returns application list and records count
	 * @param {string} mode
	 * @param {string} filterQuery
	 * @param {Array<string>} fields
	 * @param {number} offset
	 * @param {number} limit
	 * @returns {Object}
	 */
	static getApplicationList({ mode, filterQuery, fields, offset, limit, includeDisplayValue }) {
		if (!ApplicationService.MODE_TABLE[mode]) throw ApplicationService.APP_MODE_ERROR_MESSAGE;

		let tableName = ApplicationService.MODE_TABLE[mode];
		const encodedQuery = ApplicationService.IS_MAINT_USER
			? ApplicationService.FILTER_ACTIVE_QUERY
			: ApplicationService.DEFAULT_QUERY;

		if (!ApplicationService.IS_MAINT_USER && !ApplicationService.IS_APP_CUSTOMIZATION_ENABLED) {
			if (mode === ApplicationService.APP_MODE.all)
				tableName = ApplicationService.CUSTOM_APPS_TABLE;
			else if (mode === ApplicationService.APP_MODE.store_app) return [];
		}

		const appsList = [];
		const appGR = new GlideRecord(tableName);
		appGR.addEncodedQuery(encodedQuery);
		if (filterQuery !== '') appGR.addEncodedQuery(filterQuery);
		appGR.chooseWindow(offset, offset + limit);
		appGR.query();
		const glideRecordUtil = new global.GlideRecordUtil();
		let includeApp;
		while (appGR.next()) {
			includeApp = true;
			if (appGR.canRead()) {
				if (!ApplicationService.IS_MAINT_USER) {
					switch (mode) {
						case ApplicationService.APP_MODE.all:
							if (
								appGR.getValue('sys_class_name') !==
								ApplicationService.CUSTOM_APPS_TABLE
							) {
								includeApp = ApplicationService.canCustomizeApp(
									appGR.getUniqueValue()
								);
							}
							break;
						case ApplicationService.APP_MODE.store_app:
							includeApp = ApplicationService.canCustomizeApp(appGR.getUniqueValue());
							break;
						case ApplicationService.APP_MODE.custom_app:
						default:
							includeApp = true;
					}
				}

				if (includeApp) {
					appsList.push(
						ApplicationService.glideRecordToJSON({
							fields,
							glideRecordUtil,
							gr: appGR,
							includeDisplayValue,
						})
					);
				}
			}
		}
		return {
			numApps: appGR.getRowCount(),
			appsList,
			isAppCustomizationEnabled: ApplicationService.IS_APP_CUSTOMIZATION_ENABLED,
		};
	}
}
