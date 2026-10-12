/* eslint-disable no-undef, @typescript-eslint/no-unused-vars */
/* global gs, sn_ide, sn_ws_err, GlideRecordSecure, request, response */

const utils = new global.GliderCustomizationUtil();
const GLOBAL_SCOPE = 'global';

/**
 * Returns string | undefined
 */
function isInvalidScope(/*string*/ scopeId) {
	if (!scopeId) {
		return gs.getMessage('Please provide a target scope');
	}

	if (scopeId.toLowerCase() === GLOBAL_SCOPE) {
		return gs.getMessage('Cannot move metadata in the global scope.');
	}
}

/**
 * Checks if the move application helper api is available in the instance
 * Returns boolean
 */
function isMoveApplicationHelperAvailableInInstance() {
	let isAvailable = false;
	try {
		isAvailable = !!new sn_ide.IDECustomizationHelpers();
	} catch (e) {
		gs.info('[IDE][Move-Application] IDECustomizationHelpers is not available in this instance');
	}
	return isAvailable;
}

/**
 * Returns string | undefined
 */
function validate(/*GlideRecordSecure<sys_app>*/ appGr, /*GlideRecordSecure<sys_metadata>[]*/ records) {
	if (appGr.scope.toString().toLowerCase() !== GLOBAL_SCOPE) {
		return gs.getMessage(`Global metadata must be moved in a global application`);
	}

	const hasNonGlobal = records.some(r => r.sys_scope.scope.toString().toLowerCase() !== GLOBAL_SCOPE);

	if (hasNonGlobal) {
		return gs.getMessage(`Cannot move non-global metadata in a global application`);
	}
}

/**
 * Returns Record<string, GlideRecordSecure<sys_metadata>[]>
 */
function byTable(/*GlideRecordSecure<sys_metadata>[]*/ records) {
	return records.reduce((hash, gr) => {
		const table = gr.getRecordClassName();

		if (hash[table]) {
			hash[table].push(gr);
		} else {
			const tableGr = new GlideRecordSecure(table);

			if (!tableGr.canWrite()) {
				return hash;
			}

			hash[table] = [gr];
		}

		return hash;
	}, {});
}

function moveTableForApplication(/*string*/ scopeId, /*string*/ table, /*GlideRecord<sys_metadata>[]*/ grs) {
	if (!isMoveApplicationHelperAvailableInInstance()) {
		throw new Error(gs.getMessage('Customization helper is not available in this instance'));
	}

	if (!grs) {
		throw new Error(gs.getMessage('Cannot move undefined records'));
	}

	const sysIds = grs.map(gr => gr.getUniqueValue());
	const customizations = new sn_ide.IDECustomizationHelpers();
	return customizations.customizeGlobalFiles(scopeId, table, sysIds);
}

/**
 * Returns { table: string, sysId: string }[];
 */
function moveToApplication(/*string*/ scopeId, /*GlideRecordSecure<sys_metada>[]*/ records) {
	const grouped = byTable(records);

	Object.entries(grouped).reduce((running, group) => {
		const table = group[0];
		const groupGrs = group[1];
		const movedCount = moveTableForApplication(scopeId, table, groupGrs);

		return running + movedCount;
	}, 0);

	return records.map(gr => ({
		table: gr.getRecordClassName(),
		sysId: gr.getUniqueValue()
	}));
}

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const { scopeId } = request.pathParams;
	const sysIds = request.body.data;

	try {
		// Preliminaary validation to validate data shapes and scopeId
		let validationError = isInvalidScope(scopeId) || utils.isInvalidPayload(sysIds);

		if (validationError) {
			return response.setBody(new sn_ws_err.BadRequestError(validationError));
		}

		const appGr = utils.getAppRecord(scopeId);
		const grs = utils.getRecords(sysIds);

		// Secondary validation to validate we can can find the records they're telling us about
		if (!appGr) {
			validationError = gs.getMessage('No application with sys_id {0} exists', scopeId);
		}

		if (grs.length === 0) {
			validationError = gs.getMessage('No provided sys_ids corresponed to metadata records');
		}

		if (validationError) {
			return response.setBody(new sn_ws_err.BadRequestError(validationError));
		}

		// Validate the specifics of global customization
		validationError = validate(appGr, grs);

		if (validationError) {
			return response.setBody(new sn_ws_err.BadRequestError(validationError));
		}

		response.setBody(moveToApplication(scopeId, grs));
		response.setStatus(200);
	} catch (e) {
		response.setStatus(500);
		response.setError(e);
	}
})(request, response);
