// eslint-disable-next-line import/no-unresolved
import {GlideDateTime, gs} from '@servicenow/glide';
import {
	M2M_SEARCH_FACET,
	SYS_CB_METADATA,
	SYS_UIB_TOOLBOX_COMPONENT,
	SYS_UX_MACROPONENT,
} from './constants/models/index.js';
// eslint-disable-next-line import/namespace
import {AbstractBaseClass} from './AbstractBaseClass.js';

export class ComponentBuilder extends AbstractBaseClass {
	/**
	 * @param {RESTAPIResponse} response
	 */
	constructor(response) {
		super(response);
	}

	/**
	 * Gets all the records associated with a component
	 *
	 * @param {string} sysId
	 * @throws {RecordNotFoundException}
	 * @returns {Object}
	 */
	getComponent(sysId) {
		const metadataRecord = this.getMetadataRecordById(sysId);
		const toolboxRecord = metadataRecord.component.getRefRecord();
		const macroponentRecord = metadataRecord.macroponent.getRefRecord();

		const edited = new GlideDateTime();
		const created = new GlideDateTime();

		created.setValue(metadataRecord.sys_created_on);
		let editedBy = metadataRecord.sys_updated_by;

		if (
			metadataRecord.sys_updated_on > macroponentRecord.sys_updated_on &&
			metadataRecord.sys_updated_on > toolboxRecord.sys_updated_on
		) {
			edited.setValue(metadataRecord.sys_updated_on);
		} else if (
			macroponentRecord.sys_updated_on > toolboxRecord.sys_updated_on &&
			macroponentRecord.sys_updated_on > metadataRecord.sys_updated_on
		) {
			edited.setValue(macroponentRecord.sys_updated_on);
			editedBy = macroponentRecord.sys_updated_by;
		} else {
			edited.setValue(toolboxRecord.sys_updated_on);
			editedBy = toolboxRecord.sys_updated_by;
		}

		const result = {
			...this._getRecordFields(
				metadataRecord,
				SYS_CB_METADATA.FIELDS_TO_EXPOSE
			),
			component: {
				...this._getRecordFields(
					toolboxRecord,
					SYS_UIB_TOOLBOX_COMPONENT.FIELDS_TO_EXPOSE,
					{
						image_icon: (field) => {
							if (!field.getDisplayValue()) return '';

							const image = field.getRefRecord();

							return {
								sys_id: image.sys_id,
								name: image.name,
							};
						},
					}
				),
			},
			macroponent: this._getRecordFields(
				macroponentRecord,
				SYS_UX_MACROPONENT.FIELDS_TO_EXPOSE
			),
			search_facets: this.getSearchFacetsByComponentId(toolboxRecord.sys_id),
			sys_updated_on: edited.getDisplayValueLang('medium'),
			sys_created_on: created.getDisplayValueLang('medium'),
			sys_updated_by: editedBy,
		};
		result.component.sys_scope = {
			sys_id: metadataRecord.sys_scope.sys_id,
			scope: metadataRecord.sys_scope,
			name: metadataRecord.sys_scope.getDisplayValue(),
		};

		return result;
	}

	/**
	 *
	 * Updates all the records associated with a component
	 *
	 * @param {Object} data
	 * @throws {UpdateRecordException}
	 * @returns {void}
	 */
	updateComponent(data) {
		const {component, macroponent, search_facets, ...metadata} = data;

		if (metadata?.sys_id) this.updateMetadataRecord(metadata.sys_id, metadata);

		if (component?.sys_id) {
			this.updateToolboxRecord(component.sys_id, component);
			this.updateSearchFacetM2Ms(component.sys_id, search_facets);
		}

		if (macroponent?.sys_id)
			this.updateMacroponentRecord(macroponent.sys_id, macroponent);
	}

	/**
	 * Creates all the records assoictes with a component
	 *
	 * @param {Object} fields}
	 * @throws {CreateRecordException}
	 * @returns {Object}
	 */
	createComponent(fields) {
		const {
			name = '',
			description = '',
			icon = '',
			imageIcon = '',
			searchFacets = null,
			embeddable = {},
		} = fields;
		const {associatedType = SYS_UX_MACROPONENT.ASSOCIATED_TYPES_CORE} =
			embeddable;
		const macroponentId = this.createMacroponentRecord(
			this._hydrateMacroponentFields({description, name}, associatedType)
		);
		const toolboxId = this.createToolboxRecord({
			description,
			icon,
			image_icon: imageIcon,
			macroponent: macroponentId,
			label: name,
		});
		const metadataId = this.createMetadataRecord({
			component: toolboxId,
			macroponent: macroponentId,
		});

		if (searchFacets) {
			this.createSearchFacetM2Ms(toolboxId, searchFacets);
		}

		this._updateToolboxRecordExternalConfigSources(metadataId, toolboxId);

		gs.debug('Component create successful.');

		return this.getComponent(metadataId);
	}

	/**
	 * Deletes all the records associated with a component
	 *
	 * @param {string} sysId
	 * @throws {RecordDeleteException}
	 * @throws {RecordNotFoundException}
	 * @returns {void}
	 */
	deleteComponent(sysId) {
		const metadataRecord = this.getMetadataRecordById(sysId);

		this.deleteMetadataRecord(sysId);
		this.deleteToolboxRecord(metadataRecord.component);
		this.deleteMacroponentRecord(metadataRecord.macroponent);
		this.deleteSearchFacetM2MRecords(metadataRecord.component);

		gs.debug('Componeted delete successful.');
	}

	/**
	 * Duplicates all the records associated with a component
	 *
	 * @param {string} sourceId
	 * @param {Object} fields
	 * @throws {DuplicateRecordException}
	 * @throws {RedcordNotFoundException}
	 * @returns {Object}
	 */
	duplicateComponent(sourceId, fields) {
		const {
			name = '',
			description = '',
			icon = '',
			image_icon,
			usage_guidelines,
		} = fields;

		const metadataRecord = this.getMetadataRecordById(sourceId);
		const toolboxRecord = metadataRecord.component.getRefRecord();
		const macroponentRecord = metadataRecord.macroponent.getRefRecord();

		const macroponentFields = {name, description};
		for (const field of SYS_UX_MACROPONENT.FIELDS_TO_DUPLICATE) {
			macroponentFields[field] = macroponentRecord.getValue(field);
		}

		const macroponentId = this.createMacroponentRecord(macroponentFields);

		const toolboxFields = {
			label: name,
			description,
			icon,
			image_icon: image_icon?.sys_id || image_icon || '',
			macroponent: macroponentId,
		};
		for (const field of SYS_UIB_TOOLBOX_COMPONENT.FIELDS_TO_DUPLICATE) {
			toolboxFields[field] = toolboxRecord.getValue(field);
		}

		const toolboxId = this.createToolboxRecord(toolboxFields);
		const metadataId = this.createMetadataRecord({
			component: toolboxId,
			macroponent: macroponentId,
			usage_guidelines,
		});
		this._updateToolboxRecordExternalConfigSources(metadataId, toolboxId);

		gs.debug('Duplicate successful.');

		return this.getComponent(metadataId);
	}

	/**
	 * Hydrates a component record with static values
	 *
	 * @param {Object} fields
	 * @returns {Object}
	 */
	_hydrateMacroponentFields(fields, associatedType) {
		return {
			...fields,
			associatedTypes: associatedType,
			category: SYS_UX_MACROPONENT.CATEGORY_PRIMATIVES,
			layout: JSON.stringify(
				SYS_UX_MACROPONENT.RESPONSIVE_DEFAULT_CONTAINER_LAYOUT
			),
			dispatched_events: SYS_UX_MACROPONENT.DISPATCHED_EVENTS,
			disableAutoReflow: true,
		};
	}

	/**
	 * Adds boilerplate external config sources to new sys_uib_toolbox_component records.
	 *
	 * @param {string} metadataId
	 * @param {string} toolboxId
	 * @throws {RecordNotFoundException}
	 * @throws {RecordUpdateException}
	 * @returns {void}
	 */
	_updateToolboxRecordExternalConfigSources(metadataId, toolboxId) {
		const externalConfigSources = [
			{
				label: 'Edit component',
				type: 'URL',
				configProperties: {
					url: `/now/builder/ui/component/${metadataId}`,
				},
			},
		];

		return this.updateToolboxRecord(toolboxId, {
			external_configuration_sources: JSON.stringify(externalConfigSources),
		});
	}

	/**
	 * Gets the record values based on a whiteliste of fields
	 *
	 * @callback fieldTransformer
	 * @param {GlideRecordSecure} record Glide record to convert
	 * @param {string[]} fieldsToExpose List of fields to expose
	 * @param {fieldTransformer} fieldTransformer Custom transform function for special fields
	 * @returns {Object}
	 */
	_getRecordFields(record, fieldsToExpose, fieldTransformer = null) {
		return record.getElements().reduce((ret, field) => {
			const name = field.getName();
			let value = field.toString();

			if (!fieldsToExpose.includes(name)) return ret;

			if (fieldTransformer?.[name]) {
				value = fieldTransformer[name](field);
			}

			return {...ret, [name]: value};
		}, {});
	}
}
