// eslint-disable-next-line import/no-unresolved
import {GlideRecordSecure, gs} from '@servicenow/glide';
//eslint-disable-next-line import/no-unresolved
import * as sn_ws_err from '@servicenow/glide/sn_ws_err';
import {
	DuplicateNameException,
	ExceedsMaxLengthException,
	RecordCreateException,
	RecordDeleteException,
	RecordNotFoundException,
	RecordPermissionException,
	RecordUpdateException,
} from './exceptions/index.js';

import {STRING_FIELD_MAX_LENGTH} from './constants/index.js';

import {
	M2M_SEARCH_FACET,
	SYS_CB_METADATA,
	SYS_UIB_TOOLBOX_COMPONENT,
	SYS_UX_MACROPONENT,
} from './constants/models/index.js';

/**
 * Abstract base class for the component builder script includes
 *
 * @abstract
 * @class AbstractBaseClass
 * @exports AbstractBaseClass
 */
export class AbstractBaseClass {
	/**
	 * @param {RESTAPIResponse} response
	 * @throws {Error}
	 */
	constructor(response) {
		if (this.constructor === AbstractBaseClass) {
			throw new Error('Abstract class cannot be instantiated');
		}

		this._response = response;
		this._errors = [];
	}

	/** @returns {Array} errors */
	get errors() {
		return this._errors;
	}

	/** @returns {RESTAPIResponse} response */
	get response() {
		return this._response;
	}

	/**
	 * Adds an error to the errors array
	 *
	 * @param{{Error}|string} error
	 */
	addError(error) {
		const message = error?.message ?? error ?? 'Unknown Error';
		this.errors.push(message);

		gs.error(message);
	}

	/**
	 * Gets a sys_cb_metadata record by sys_id
	 *
	 * @param {string} sysId
	 * @throws {RecordNotFoundException}
	 * @returns {GlideRecordSecure}
	 */
	getMetadataRecordById(sysId) {
		return this._getRecordById(SYS_CB_METADATA.TABLE_NAME, sysId);
	}

	/**
	 * Gets a sys_uib_toolbox_component record by sys_id
	 *
	 * @param {string} sysId
	 * @throws {RecordNotFoundException}
	 * @returns {GlideRecordSecure}
	 */
	getToolboxRecordById(sysId) {
		return this._getRecordById(SYS_UIB_TOOLBOX_COMPONENT.TABLE_NAME, sysId);
	}

	/**
	 * Gets a sys_ux_macroponent record by sys_id
	 *
	 * @param {string} sysId
	 * @throws {RecordNotFoundException}
	 * @returns {GlideRecordSecure}
	 */
	getMacroponentRecordById(sysId) {
		return this._getRecordById(SYS_UX_MACROPONENT.TABLE_NAME, sysId);
	}

	/**
	 * Gets all of the search facets asscociated with a toolbox component record
	 *
	 * @param {string} componentId
	 * @returns {{id: string, label: string}[]}
	 */
	getSearchFacetsByComponentId(componentId) {
		const facetItems = [];
		const searchFacet = new GlideRecordSecure(M2M_SEARCH_FACET.TABLE_NAME);
		searchFacet.addQuery(M2M_SEARCH_FACET.FIELD_TARGET_ID, componentId);
		searchFacet.query();

		while (searchFacet.next()) {
			facetItems.push({
				id: searchFacet.search_facet_item.toString(),
				label: searchFacet.search_facet_item.getDisplayValue(),
			});
		}

		return facetItems;
	}

	/**
	 * Updates a sys_ux_macroponent record
	 *
	 * @param {string} sysId
	 * @param {Object} data
	 * @throws {RecordUpdateException}
	 * @returns {void}
	 */
	updateMacroponentRecord(sysId, data) {
		const payload = this._getSanitizedInput(
			data,
			SYS_UX_MACROPONENT.FIELDS_TO_UPDATE
		);

		if (Object.keys(payload).length === 0) {
			throw new RecordUpdateException('No fields to update');
		}

		return this._updateRecord(SYS_UX_MACROPONENT.TABLE_NAME, sysId, payload);
	}

	/**
	 * Updates a sys_uib_toolbox_component record
	 *
	 * @param {string} sysId
	 * @param {Object} data
	 * @throws {RecordNotFoundException}
	 * @throws {RecordUpdateException}
	 * @returns {void}
	 */
	updateToolboxRecord(sysId, data) {
		const payload = this._getSanitizedInput(
			data,
			SYS_UIB_TOOLBOX_COMPONENT.FIELDS_TO_UPDATE,
			SYS_UIB_TOOLBOX_COMPONENT.FIELDS_TRANSFORMER
		);

		if (Object.keys(payload).length === 0) {
			throw new RecordUpdateException('No fields to update');
		}

		return this._updateRecord(
			SYS_UIB_TOOLBOX_COMPONENT.TABLE_NAME,
			sysId,
			payload
		);
	}

	/**
	 * Updates a sys_cb_metadata record
	 *
	 * @param {string} sysId
	 * @param {Object} data
	 * @throws {RecordUpdateException}
	 * @returns {void}
	 */
	updateMetadataRecord(sysId, data) {
		const payload = this._getSanitizedInput(
			data,
			SYS_CB_METADATA.FIELDS_TO_UPDATE
		);

		if (Object.keys(payload).length === 0) {
			throw new RecordUpdateException('No fields to update');
		}

		return this._updateRecord(SYS_CB_METADATA.TABLE_NAME, sysId, payload);
	}

	/**
	 * Updates the associated search facets for a toolbox component
	 *
	 * @param {string} componentId
	 * @param {{id: string, label: string}[]} searchFacets
	 */
	updateSearchFacetM2Ms(componentId, searchFacets = []) {
		const searchFacetIds = searchFacets.map((searchFacet) => searchFacet.id);
		const existingSearchFacets = this.getSearchFacetsByComponentId(componentId);
		const existingSearchFacetIds = existingSearchFacets.map(
			(searchFacet) => searchFacet.id
		);

		const searchFacetsToAdd = searchFacetIds.filter(
			(id) => !existingSearchFacetIds.includes(id)
		);
		const searchFacetsToRemove = existingSearchFacetIds.filter(
			(id) => !searchFacetIds.includes(id)
		);

		if (searchFacetsToAdd.length > 0) {
			this.createSearchFacetM2Ms(componentId, searchFacetsToAdd);
		}

		if (searchFacetsToRemove.length > 0) {
			this.deleteSearchFacetM2MRecords(
				componentId,
				searchFacetsToRemove.join(',')
			);
		}
	}

	/**
	 * Creates a sys_ux_macroponent record
	 *
	 * @param {Object} fields
	 * @throws {RecordCreateException}
	 *
	 * @returns {string}
	 */
	createMacroponentRecord(fields) {
		this._validateFieldValues(SYS_UX_MACROPONENT.TABLE_NAME, fields);

		return this._createRecord(SYS_UX_MACROPONENT.TABLE_NAME, fields);
	}

	/**
	 * Creates a sys_uib_toolbox_component record
	 *
	 * @param {Object} fields
	 * @throws {RecordCreateException}
	 *
	 * @returns {string}
	 */
	createToolboxRecord(fields) {
		this._validateFieldValues(SYS_UIB_TOOLBOX_COMPONENT.TABLE_NAME, fields);

		return this._createRecord(SYS_UIB_TOOLBOX_COMPONENT.TABLE_NAME, fields);
	}

	/**
	 * Creates a sys_cb_metadata record
	 *
	 * @param {Object} fields
	 * @throws {RecordCreateException}
	 *
	 * @returns {string}
	 */
	createMetadataRecord(fields) {
		return this._createRecord(SYS_CB_METADATA.TABLE_NAME, fields);
	}

	/**
	 * Creates all needed M2M search facet relationships
	 *
	 * @param {string} componentId
	 * @param {string} searchFacets
	 */
	createSearchFacetM2Ms(componentId, searchFacets) {
		const searchFacetIds =
			typeof searchFacets === 'string' ? searchFacets.split(',') : searchFacets;
		for (const searchFacetId of searchFacetIds) {
			const searchFacetFields = {
				[M2M_SEARCH_FACET.FIELD_ELEMENT_TABLE]:
					SYS_UIB_TOOLBOX_COMPONENT.TABLE_NAME,
				[M2M_SEARCH_FACET.FIELD_TARGET_ID]: componentId,
				[M2M_SEARCH_FACET.FIELD_SEARCH_FACET_ITEM]: searchFacetId,
			};

			this.createSearchFacetM2MRelationship(searchFacetFields);
		}
	}

	/**
	 * Creates a sys_uib_search_facet_m2m recors
	 *
	 * @param {Object} fields
	 * @throws {RecordCreateException}
	 *
	 * @returns {string}
	 */
	createSearchFacetM2MRelationship(fields) {
		return this._createRecord(M2M_SEARCH_FACET.TABLE_NAME, fields);
	}

	/**
	 * Deletes a sys_ux_macroponent record
	 *
	 * @param {string} sysId
	 * @throws {RecordDeleteException}
	 * @returns {boolean}
	 */
	deleteMacroponentRecord(sysId) {
		return this._deleteRecord(SYS_UX_MACROPONENT.TABLE_NAME, sysId);
	}

	/**
	 * Deletes a sys_uib_toolbox_component record
	 *
	 * @param {string} sysId
	 * @throws {RecordDeleteException}
	 * @returns {boolean}
	 */
	deleteToolboxRecord(sysId) {
		return this._deleteRecord(SYS_UIB_TOOLBOX_COMPONENT.TABLE_NAME, sysId);
	}

	/**
	 * Deletes a sys_cb_metadata record
	 *
	 * @param {string} sysId
	 * @throws {RecordDeleteException}
	 * @returns {boolean}
	 */
	deleteMetadataRecord(sysId) {
		return this._deleteRecord(SYS_CB_METADATA.TABLE_NAME, sysId);
	}

	/**
	 * Deletes all sys_uib_search_facet_item_m2m_element records
	 *
	 * @param {string} sysId the sys_id of the toolbox component record
	 * @param {string | null} searchFacetIds
	 * @throws {RecordDeleteException}
	 * @returns {boolean}
	 */
	deleteSearchFacetM2MRecords(sysId, searchFacetIds = null) {
		const searchFacetM2M = new GlideRecordSecure(M2M_SEARCH_FACET.TABLE_NAME);
		searchFacetM2M.addQuery(M2M_SEARCH_FACET.FIELD_TARGET_ID, sysId);
		if (searchFacetIds) {
			searchFacetM2M.addQuery('search_facet_item.sys_id', 'IN', searchFacetIds);
		}
		searchFacetM2M.query();
		searchFacetM2M.deleteMultiple();
	}

	/**
	 * Returns a valid API success response
	 *
	 * @param {*} payload
	 * @param {number} status
	 * @returns {RESTAPIResponse}
	 */
	getSuccessResponse(payload, status = 200) {
		if (payload) {
			this.response.setBody(payload);
		}

		this.response.setContentType('application/json');
		this.response.setStatus(status);

		return this.response;
	}

	/**
	 * Returns a valid API error response
	 *
	 * @param {*} payload
	 * @param {number} status
	 * @returns {RESTAPIResponse}
	 */
	getErrorResponse(payload, status = 400) {
		this.response.setError(
			new sn_ws_err.ServiceError()
				.setMessage(payload)
				.setDetail('An error occurred')
				.setStatus(status)
		);

		return this.response;
	}

	/**
	 * Gets a record by sys_id
	 *
	 * @param {string} table
	 * @param {string} sysId
	 * @throws {RecordNotFoundException}
	 * @returns {GlideRecordSecure}
	 */
	_getRecordById(table, sysId) {
		const record = new GlideRecordSecure(table);
		const exists = record.get(sysId);

		if (!record.isValid() || !exists) {
			throw new RecordNotFoundException(
				`Record not found: ${table} - ${sysId}`
			);
		}

		return record;
	}

	/**
	 * Creates a glide record
	 *
	 * @param {string} table
	 * @param {Object} fields
	 * @throws {RecordCreateException}
	 * @returns {string}
	 */
	_createRecord(table, fields) {
		try {
			const record = this._getRecordReference(table, fields);

			if (!record.canCreate()) {
				throw new RecordPermissionException();
			}

			return record.insert();
		} catch (e) {
			if (
				e instanceof ExceedsMaxLengthException ||
				e instanceof DuplicateNameException
			)
				this.addError(e);

			throw new RecordCreateException(`Failed to create record: ${table}`);
		}
	}

	/**
	 * Deletes a glide record
	 *
	 * @param {String} table
	 * @param {String} sysId
	 * @throws {RecordDeleteException}
	 * @throws {RecordNotFoundException}
	 * @returns {boolean}
	 */
	_deleteRecord(table, sysId) {
		try {
			const record = this._getRecordById(table, sysId);

			return record.deleteRecord();
		} catch (e) {
			this.addError(e);

			throw new RecordDeleteException(
				`Failed to delete record: ${table} - ${sysId}`
			);
		}
	}

	/**
	 * Updates a glide record
	 *
	 * @param {String} table
	 * @param {String} sysId
	 * @param {Object} fields
	 * @throws {RecordNotFoundException}
	 * @throws {RecordUpdateException}
	 * @returns {void}
	 */
	_updateRecord(table, sysId, fields) {
		try {
			const record = this._getRecordById(table, sysId);

			for (const [field, value] of Object.entries(fields)) {
				record.setValue(field, value);
			}

			record.update();
		} catch (e) {
			this.addError(e);

			throw new RecordUpdateException(
				`Failed to update record: ${table} - ${sysId}`
			);
		}
	}

	/**
	 * Validates the fields against the table schema and business rules
	 *
	 * @param {string} table
	 * @param {Object} fields
	 * @throws {DuplicateNameException}
	 * @throws {ExceedsMaxLengthException}
	 * @returns {void}
	 */
	_validateFieldValues(table, fields) {
		for (const [field, value] of Object.entries(fields)) {
			if (!['name', 'label'].includes(field)) continue;

			this._validateValueLength(value);
			this._checkForDuplicates(table, {field, value});
		}
	}

	/**
	 * Ensures the field value does not exceed the maximum length
	 *
	 * @param {string} name
	 * @throws {ExceedsMaxLengthException}
	 * @returns {void}
	 */
	_validateValueLength(name) {
		if (name?.length > STRING_FIELD_MAX_LENGTH)
			throw new ExceedsMaxLengthException();
	}

	/**
	 * Ensures there are no records with the same field name and value
	 *
	 * @param {string} table
	 * @param {Object} fields
	 * @throws {DuplicateNameException}
	 */
	_checkForDuplicates(table, {field, value}) {
		const record = new GlideRecordSecure(table);
		record.addQuery(field, value);

		if (table === SYS_UX_MACROPONENT.TABLE_NAME) {
			record.addQuery(
				SYS_UX_MACROPONENT.FIELD_CATEGORY,
				SYS_UX_MACROPONENT.CATEGORY_PRIMATIVES
			);
		}
		record.query();

		if (record.getRowCount() > 0) throw new DuplicateNameException();
	}

	/**
	 * Creates a new GlideRecordSecure instance and applies the fields to the record
	 *
	 * @param {string} table
	 * @param {Object} fields
	 * @returns {GlideRecordSecure}
	 */
	_getRecordReference(table, fields) {
		const record = new GlideRecordSecure(table);
		record.initialize();

		this._transformFields(record, fields);

		return record;
	}

	/**
	 * Converts the field name to snake case and applies the value to the record
	 *
	 * @param {GlideRecordSecure} record
	 * @param {Object} fields
	 * @returns {GlideRecordSecure} record
	 */
	_transformFields(record, fields = {}) {
		for (const [field, value] of Object.entries(fields)) {
			const newField = this._toSnakeCase(field);
			record.setValue(newField, value);
		}

		return record;
	}

	/**
	 * Converts the field name to snake case
	 *
	 * @param {string} fieldName
	 * @returns {string}
	 */
	_toSnakeCase(fieldName) {
		return fieldName.replace(
			/[A-Z]/g,
			(namePart) => '_' + namePart.toLowerCase()
		);
	}

	/**
	 * Sanitize record using list of fields and transformer callbacks
	 *
	 * @callback fieldTransformer
	 * @param {Object} input Input object to sanitize
	 * @param {string[]} fieldsToUpdate List of fields to use in input
	 * @param {fieldTransformer} fieldTransformer Custom transform function for special fields
	 * @returns {Object}
	 */
	_getSanitizedInput(input, fieldsToUpdate, fieldTransformer = null) {
		return fieldsToUpdate.reduce((ret, field) => {
			if (!input.hasOwnProperty(field)) return ret;

			let value = input[field];

			if (fieldTransformer?.[field]) {
				value = fieldTransformer[field](value);
			}

			return {...ret, [field]: value};
		}, {});
	}
}
