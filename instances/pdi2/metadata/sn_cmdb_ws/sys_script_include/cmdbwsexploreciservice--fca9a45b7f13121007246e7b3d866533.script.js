const CMDBWsExploreCIService = Class.create();
CMDBWsExploreCIService.prototype = {
    initialize: function() {
        this.configUtils = new CmdbWsConfigUtils();
        this.wsUtil = new CMDBWorkspaceUtil();
        this.ireService = new CMDBWsIREService(this.EXPLORE_CI_ERROR_SOURCE);
        this.ireUtil = new CMDBWsIREUtil(this.EXPLORE_CI_ERROR_SOURCE);
    },

    SYS_CLASS_NAME: "sys_class_name",
    SYS_ID: "sys_id",
    SYS_UI_FORM: {
        TABLE: "sys_ui_form",
        VIEW: "view",
        NAME: "name",
    },

    SYS_UI_FORM_SECTION: {
        TABLE: "sys_ui_form_section",
        SYS_UI_FORM: "sys_ui_form",
        VIEW: "view",
        POSITION: "position",
        SYS_UI_SECTION: "sys_ui_section"
    },

    SYS_UI_SECTION: {
        TABLE: "sys_ui_section",
        CAPTION: "caption",
        NAME: "name",
        VIEW: "view"
    },

    SYS_UI_ELEMENT: {
        TABLE: "sys_ui_element",
        SYS_UI_SECTION: "sys_ui_section",
        POSITION: "position",
        ELEMENT: 'element',
        TYPE: 'type',
        TYPE_OPTIONS: {
            ELEMENT: "element", // mostly null
            ANNOTATION: "annotation",
            BEGIN_SPLIT: ".begin_split",
            SPLIT: ".split",
            END_SPLIT: ".end_split",
            FORMATTER: "formatter",
            CHART: "chart",
            EMBEDDED_LIST: "list",
        }
    },

    SYS_UI_VIEW: {
        TABLE: "sys_ui_view",
        NAME: "name",
        SYS_ID: "sys_id",
        TITLE: "title",
    },

    SYS_DICTIONARY: {
        TABLE: 'sys_dictionary',
        NAME: 'name',
        ELEMENT: 'element',
        TYPE: 'internal_type',
        LABEL: 'column_label',
        MANDATORY: 'mandatory',
        MAX_LENGTH: 'max_length',
        DEFAULT_VALUE: 'default_value',
        DYNAMIC_DEFAULT_VALUE: 'dynamic_default_value',
        DISPLAY: 'display',
        CHOICE: 'choice',
        REFERENCE: 'reference',
        REFERENCE_QUALIFIER: 'reference_qual',
        COLUMN_TYPE: {
            REFERENCE: 'reference'
        }
    },

    SERVICE_CLASSIFICATION_OPTIONS: {
        BUSINESS_SERVICE: 'Business Service',
        TECHNICAL_SERVICE: 'Technical Service',
        APPLICATION_SERVICE: 'Application Service'
    },

    SERVICE_OFFERING: {
        TABLE: 'service_offering',
        SERVICE_CLASSIFICATION: 'service_classification',
        PARENT: 'parent',
    },

    CMDB_CI_SERVICE: {
        TABLE: 'cmdb_ci_service',
        SERVICE_CLASSIFICATION: 'service_classification',
    },

    SERVICE_INSTANCE: {
        TABLE: 'cmdb_ci_service_auto',
        SERVICE_CLASSIFICATION: 'service_classification',
    },

    TECHNOLOGY_MGMT_SERVICE: {
        TABLE: 'cmdb_ci_service_technical',
    },

    BUSINESS_SERVICE: {
        TABLE: 'cmdb_ci_service_business',
    },

    DYNAMIC_CI_GROUP: {
        TABLE: 'cmdb_ci_query_based_service',
        PARENT: 'parent',
    },

    CMDB_REL_CI: {
        TABLE: 'cmdb_rel_ci',
        CHILD: 'child',
        PARENT: 'parent',
        TYPE: 'type',
        // dot-walked fields
        CHILD_CLASS_NAME: 'child.sys_class_name',
        PARENT_CLASS_NAME: 'parent.sys_class_name',
        TYPE_NAME: 'type.name',
        CHILD_SVC_CLASSIFICATION: 'child.ref_cmdb_ci_service.service_classification',
        PARENT_SVC_CLASSIFICATION: 'parent.ref_cmdb_ci_service.service_classification',
    },

    SVC_CI_ASSOC: {
        TABLE: 'svc_ci_assoc',
        CI_ID: 'ci_id',
        SERVICE_ID: 'service_id',
        // dot-walked fields
        SERVICE_CLASS_NAME: 'service_id.sys_class_name',
        SERVICE_CLASSIFICATION: 'service_id.service_classification'
    },

    CACHE: {
        TABLE_HIERARCHY: {},
        VIEW_HIERARCHY: {},
        FIELD_METADATA: {},
        RESOLVED_VIEW: {}
    },

    ERROR_CODES: {
        INVALID_RECORD: "INVALID_RECORD",
        MISSING_TABLE_OR_SYSID: "MISSING_TABLE_OR_SYSID",
        INSERT_OP_FAILED: "INSERT_OP_FAILED",
        UPDATE_OP_FAILED: "UPDATE_OP_FAILED",
        DELETE_OP_FAILED: "DELETE_OP_FAILED",
        MISSING_DEPENDENT_RELATIONSHIP: "MISSING_DEPENDENT_RELATIONSHIP",
        MISSING_HOSTING_OR_CONTAINMENT_RULES: "MISSING_HOSTING_OR_CONTAINMENT_RULES",
        FAILED_IDENTIFY_CI: "FAILED_IDENTIFY_CI",
        FAILED_UPDATE_CI: "FAILED_UPDATE_CI"
    },

    ACTIONS: {
        GET_FORM_LAYOUT_AND_DATA: "GET_FORM_LAYOUT_AND_DATA",
		CREATE_TAG: "CREATE_TAG",
		UPDATE_TAG: "UPDATE_TAG",
		DELETE_TAG: "DELETE_TAG",
        GET_SERVICE_AND_OFFERING: "GET_SERVICE_AND_OFFERING",
        UPDATE_CI: "UPDATE_CI",
    },

    EXPLORE_CI_ERROR_SOURCE: "sn_cmdb_ws_explore_ci",

    DEFAULT_VIEW: "Default view",
    DEFAULT_CONFIG_ID: "6e9975119f9c121052b37962aa0a1c37",
    EMPTY_VALUE : '--',
    CONFIG_PROPERTIES: {
        EXPLORE_CI_VIEW: "explore.ci.view",
    },
    
    SECTIONS: {
        ALL_ATTRIBUTES: {
            CAPTION: 'All',
            CAPTION_DISPLAY: sn_i18n.Message.getMessage('sn_cmdb_ws', 'All'),
            ID: 'all_attributes'
        }
    },

	// cmdb_key_value table & field names
	CMDB_KEY_VALUE: {
		TABLE: 'cmdb_key_value',
		CONFIGURATION_ITEM: 'configuration_item',
		KEY: 'key',
		VALUE: 'value'
	},

	RELATED_ITEMS_CONFIG: {
		TABLE: 'sn_cmdb_ws_explore_ci_related_item_config',
		TABLE_FIELD: 'table',
		CONDITIONS:'conditions',
		GROUP_BY_FIELD: 'group_by_field',
		REFERENCE_FIELD:'reference_field',
		LIST_VIEW:'view',
		CONFIG_IDENTIFIER: 'config_identifier_id',
		NAME: 'name',
		FIELDS: 'fields',
		ORDER: 'order',
		LINK_DESTINATION: 'link_destination'
	},

    UNSUPPORTED_ATTR_TYPES: ['file_attachment', 'journal', 'journal_input', 'journal_list'],//these field types cannot be selected as primary or secondary attributes as we can't render them in card or in list

    UPDATE_CI_RESPONSE: {
        UPDATE_SUCCESS: {
            status: 'SUCCESS',
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Successfully updated CI")
        },
        ERROR: {
            status: 'ERROR',
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to update CI")
        },
        PARTIAL_UPDATE: {
            status: 'WARNING',
            type: 'RECONCILIATION_RULE_PREVENTING_UPDATE',
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Some attributes aren't updated due to the application of class reconciliation rules")
        },
        DUPLICATE_FOUND: {
            status: 'ERROR',
            type: 'DUPLICATE_FOUND',
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Duplicate CI found")
        },
        MISSING_CRITERION_ATTRIBUTES: {
            status: 'ERROR',
            type: 'MISSING_CRITERION_ATTRIBUTES',
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Missing criterion attributes")
        },
        MISSING_HOSTING_OR_CONTAINMENT_RULES: {
            status: 'ERROR',
            type: 'MISSING_HOSTING_OR_CONTAINMENT_RULES',
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "No hosting or containment rules defined for this class")
        },
        MISSING_DEPENDENT_RELATIONSHIP: {
            status: 'ERROR',
            type: 'MISSING_DEPENDENT_RELATIONSHIP',
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The dependent CI is missing a relationship to its dependent-upon CI")
        }
    },

    /**
     * Get view record by name or sysId
     * @param {*} viewNameOrSysId 
     * @returns view record
     */
    _getViewGr: function (viewNameOrSysId) {
        // try to resolve view record with name first
        let viewGr = CMDBWsGlideUtils.getGrByFieldValues(this.SYS_UI_VIEW.TABLE, {
            [this.SYS_UI_VIEW.NAME]: viewNameOrSysId
        });
        if (viewGr && viewGr.next()) {
            return viewGr;
        }
        // try to resolve view record with sysId
        viewGr = CMDBWsGlideUtils.getGrBySysId(this.SYS_UI_VIEW.TABLE, viewNameOrSysId);
        if (viewGr) {
            return viewGr;
        }
        return null;
    },

    /**
     * Get table hierarchy for the provided table. Fetches the hierarchy from cache if available.
     * @param {*} table 
     * @returns array of table names in the hierarchy
     */
    _getTableHierarchy: function (table) {
        if (this.CACHE.TABLE_HIERARCHY[table]) {
            return this.CACHE.TABLE_HIERARCHY[table];
        }
        const hierarchy = CMDBWsGlideUtils.getTableHierarchy(table);
        this.CACHE.TABLE_HIERARCHY[table] = hierarchy;
        return hierarchy;
    },

    /**
     * Get view hierarchy for the provided appId.
     * - If view is configured for the provided appId, it will be first in the hierarchy.
     * - If view is not configured for the provided appId, default view configured by CMDB WS will be next.
     * - If CMDBWS default view is not configured for some reason, "Default view" will be next.
     * @param {*} appId 
     * @param {*} configId
     * @returns array of view sysIds in the hierarchy
     */
    _getViewHierarchy: function(appId, configId) {
        if (this.CACHE.VIEW_HIERARCHY[appId]) {
            return this.CACHE.VIEW_HIERARCHY[appId];
        }
        const hierarchy = [];

        let viewForAppId = null;
        if (!global.JSUtil.nil(appId)) {
            const viewConfigPropForAppId = this.configUtils.getApplicationConfigProp({
                [this.configUtils.PARAM_PROPERTIES]: [this.CONFIG_PROPERTIES.EXPLORE_CI_VIEW],
                [this.configUtils.PARAM_APP_ID]: appId,
                [this.configUtils.PARAM_CONFIG_ID]: configId
            });

            viewForAppId = viewConfigPropForAppId[this.CONFIG_PROPERTIES.EXPLORE_CI_VIEW];
            if (viewForAppId) {
                // resolve view sysId for provided view name
                const viewGr = this._getViewGr(viewForAppId);
                if (viewGr) {
                    hierarchy.push({
                        sysId: viewGr.getUniqueValue(),
                        name: viewGr.getValue(this.SYS_UI_VIEW.NAME),
                        title: viewGr.getValue(this.SYS_UI_VIEW.TITLE),
                    });
                }
            }
        }

        // get view for default config identifier that we ship OOB
        const defaultWsViewConfigProp = this.configUtils.getApplicationConfigProp({
            [this.configUtils.PARAM_PROPERTIES]: [this.CONFIG_PROPERTIES.EXPLORE_CI_VIEW]
        });

        const defaultWsView = defaultWsViewConfigProp[this.CONFIG_PROPERTIES.EXPLORE_CI_VIEW];
        if (defaultWsView && viewForAppId != defaultWsView) {
            const defaultViewGr = this._getViewGr(defaultWsView);
            if (defaultViewGr) {
                hierarchy.push({
                    sysId: defaultViewGr.getUniqueValue(),
                    name: defaultViewGr.getValue(this.SYS_UI_VIEW.NAME),
                    title: defaultViewGr.getValue(this.SYS_UI_VIEW.TITLE),
                });
            }
        }

        // add "Default view" in case the configuration is completely missing
        const defaultViewGr = this._getViewGr(this.DEFAULT_VIEW);
        if (defaultViewGr) {
            hierarchy.push({
                sysId: defaultViewGr.getUniqueValue(),
                name: defaultViewGr.getValue(this.SYS_UI_VIEW.NAME),
                title: defaultViewGr.getValue(this.SYS_UI_VIEW.TITLE),
            });
        }
        this.CACHE.VIEW_HIERARCHY[appId] = hierarchy;
        return hierarchy;
    },

    _getViewCacheKey: function (table, appId, configId, type) {
        return `${table}_${appId}_${configId ? configId + '_': ''}${type}`;
    },

    /**
     * Get form record for the provided table and viewId
     * @param {*} table 
     * @param {*} appId 
     * @returns form record
     */
    _getFormRecord: function (table, viewId) {
        return CMDBWsGlideUtils.getGrByFieldValues(this.SYS_UI_FORM.TABLE, {
            [this.SYS_UI_FORM.NAME]: table,
            [this.SYS_UI_FORM.VIEW]: viewId
        });
    },

    /**
     * For the given formId, fetches the sections in the form
     * @param {*} formId 
     * @returns array of sections in the form
     */
    _getSysUiSectionByFormId: function (formId) {
        const sectionGr = new GlideRecord(this.SYS_UI_FORM_SECTION.TABLE);
        sectionGr.addQuery(this.SYS_UI_FORM_SECTION.SYS_UI_FORM, formId);
        sectionGr.orderBy(this.SYS_UI_FORM_SECTION.POSITION);
        sectionGr.query();
        const result = [];
        while (sectionGr.next()) {
            const sysId = sectionGr.getValue(this.SYS_UI_FORM_SECTION.SYS_UI_SECTION);
            const sysUISectionGr = sectionGr.sys_ui_section.getRefRecord();
            const caption = sysUISectionGr.getValue(this.SYS_UI_SECTION.CAPTION);
            const captionDisplay = sysUISectionGr.getDisplayValue(this.SYS_UI_SECTION.CAPTION);
            const position = sectionGr.getValue(this.SYS_UI_FORM_SECTION.POSITION);
            result.push({
                sysId,
                caption,
                captionDisplay,
                position
            });
        }
        return result;
    },

    /**
     * For the given table and viewId, fetches the sections. Sometimes the sections are not associated with the form section.
     * @param {*} formId 
     * @returns array of sections in the form
     */
    _getSysUiSectionByViewId: function (table, viewId) {
        const sectionGr = new GlideRecord(this.SYS_UI_SECTION.TABLE);
        sectionGr.addQuery(this.SYS_UI_SECTION.NAME, table);
        sectionGr.addQuery(this.SYS_UI_SECTION.VIEW, viewId);
        sectionGr.query();
        const result = [];
        let position = 0;
        while (sectionGr.next()) {
            const sysId = sectionGr.getUniqueValue();
            const caption = sectionGr.getValue(this.SYS_UI_SECTION.CAPTION);
            const captionDisplay = sectionGr.getDisplayValue(this.SYS_UI_SECTION.CAPTION);
            result.push({
                sysId,
                caption,
                captionDisplay,
                position: position++
            });
        }
        return result;
    },

    _getElementsForSection: function (sectionId) {
        const elementGr = new GlideRecord(this.SYS_UI_ELEMENT.TABLE);
        elementGr.addQuery(this.SYS_UI_ELEMENT.SYS_UI_SECTION, sectionId);
        elementGr.orderBy(this.SYS_UI_ELEMENT.POSITION);
        elementGr.query();
        const result = [];
        while (elementGr.next()) {
            const sysId = elementGr.getValue(this.SYS_UI_ELEMENT.SYS_ID);
            const type = elementGr.getValue(this.SYS_UI_ELEMENT.TYPE);
            const position = elementGr.getValue(this.SYS_UI_ELEMENT.POSITION);
            const element = elementGr.getValue(this.SYS_UI_ELEMENT.ELEMENT);
            result.push({
                sysId: sysId,
                type: type == null ? this.SYS_UI_ELEMENT.TYPE_OPTIONS.ELEMENT : type,
                position: position,
                element,
            });
        }
        return result;
    },

    /**
     * Remove unsupported elements from the elements list
     * @param {*} elements 
     * @returns list of supported elements
     */
    _removeUnsupportedElements: function (elements) {
        const result = [];
        const INCLUDED_ELEMENT_TYPES = [
            this.SYS_UI_ELEMENT.TYPE_OPTIONS.BEGIN_SPLIT,
            this.SYS_UI_ELEMENT.TYPE_OPTIONS.SPLIT,
            this.SYS_UI_ELEMENT.TYPE_OPTIONS.END_SPLIT,
            this.SYS_UI_ELEMENT.TYPE_OPTIONS.ELEMENT
        ];
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (INCLUDED_ELEMENT_TYPES.includes(element.type)) {
                result.push(element);
            }
        }
        return result;
    },


    /**
     * This formats the elements into a row & columns layout similar to the output of Form Controller.
     * @param {*} elements 
     * @returns layout for elements in a given section
     */
    _getElementLayout: function (elements) {
        let columns = [];
        let rows = [];
        let fields = [];
        let column = {
            fields: fields
        };
        let sectionStart = true;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i].element;
            const type = elements[i].type;

            switch (type) {
                case this.SYS_UI_ELEMENT.TYPE_OPTIONS.BEGIN_SPLIT:
                    if (!sectionStart) {
                        columns.push(column);
                        rows.push(columns);
                        fields = [];
                        column = {
                            fields: fields
                        };
                        columns = [];
                    }
                    break;

                case this.SYS_UI_ELEMENT.TYPE_OPTIONS.SPLIT:
                    columns.push(column);
                    fields = [];
                    column = {
                        fields: fields
                    };
                    break;

                case this.SYS_UI_ELEMENT.TYPE_OPTIONS.END_SPLIT:
                    columns.push(column);
                    rows.push(columns);
                    fields = [];
                    column = {
                        fields: fields
                    };
                    columns = [];
                    break;

                default:
                    if (column) {
                        column.fields.push(element);
                    } else {
                        fields.push(element);
                    }
                    break;
            }
            sectionStart = false;
        }

        if (columns != null) {
            columns.push(column);
            rows.push(columns);
        }

        return {
            rows
        };
    },

    _getFormSections: function(table, sysId, appId, configId) {
        const RESOLVED_VIEW_KEY = this._getViewCacheKey(table, appId, configId, "form");
        
        const recordGr = CMDBWsGlideUtils.getGrBySysId(table, sysId);
        const recordTable = recordGr.getRecordClassName();

        const tableHierarchy = this._getTableHierarchy(recordTable);
        const viewHierarchy = this._getViewHierarchy(appId, configId);
        let sections = [];
        outerLoop:
            for (let j = 0; j < viewHierarchy.length; j++) {
                const view = viewHierarchy[j];
                for (let i = 0; i < tableHierarchy.length; i++) {
                    const _table = tableHierarchy[i];
                    const formGr = this._getFormRecord(_table, view.sysId);
                    if (formGr && formGr.next()) {
                        sections = this._getSysUiSectionByFormId(formGr.getUniqueValue());
                    } else { // sometimes the sections are not associated with the form and only associated with the view
                        sections = this._getSysUiSectionByViewId(_table, view.sysId);
                    }
                    if (sections.length > 0) {
                        this.CACHE.RESOLVED_VIEW[RESOLVED_VIEW_KEY] = {
                            sysId: view.sysId,
                            name: view.name,
                            title: view.title,
                            table: _table
                        };
                        break outerLoop;
                    }
                }
            }

        const result = [];
        sections.forEach(function(section) {
            const elements = this._getElementsForSection(section.sysId);
            const _supportedElements = this._removeUnsupportedElements(elements);
            result.push({
                ...section,
                ...this._getElementLayout(_supportedElements)
            });
        }.bind(this));
        return result;
    },

	/**
	 * Splits the fields into as many columns as needed
	 * @param {Array} fields Array of field names
	 * @param {Integer} numOfColumns number of columns to evenly split fields into
	 * @returns {Array} Array of objects containing fields in each column
	 */
	_splitFieldsIntoColumns: function (fields = [], numOfColumns = 2) {
		if(numOfColumns<0)
			numOfColumns = 2;

		return Array.from({ length: numOfColumns }, (_, columnIndex) => {
			const columnFields = fields.filter((_, i) => i % numOfColumns === columnIndex);
			return {
				fields: columnFields
			};
		});
	},

	/**
	 * Splits the given list of attributes evenly into columns
	 * @param {String} caption Section caption
	 * @param {String} captionDisplay Display value of Section caption
	 * @param {String} sectionId Section ID
	 * @param {Array} attributes array of attribute names
	 * @param {Integer} numOfColumns number of columns to evenly split attributes into
	 * @returns {Object} section layout object
	 */
	_buildSectionLayout: function (caption, captionDisplay, sectionId, attributes = [], numOfColumns) {
		const formLayout = {
			sysId: sectionId,
			caption,
			captionDisplay,
			rows: []
		};

		if(!attributes.length)
			return formLayout;

		const rows = this._splitFieldsIntoColumns(attributes, numOfColumns);
		formLayout.rows = [rows];

		return formLayout;
	},

	_getAllAttributes: function (table) {
		const gr = new GlideRecord(table);
		const elements = gr.getElements();
		const fieldNames = elements
		.filter(element => !this.UNSUPPORTED_ATTR_TYPES.includes(element.getED().getInternalType()))
		.map(element => {
			return {
				label: element.getLabel(),
				name: element.getName()
			};
		})
		.sort((a, b) => a.label.localeCompare(b.label))
		.map(field => field.name);

		return fieldNames;
	},

    /**
     * Given the table, sysId and appId returns the form layout and field data
     * - For the given appId it will find the view hierarchy and for the given table it will find the table hierarchy.
     * - It will then loop through the view hierarchy and table hierarchy to find the form layout.
     * @param {*} table Table name
     * @param {*} sysId sys_id of the record
     * @param {*} appId app_id of the workspace that is being used. If not provided, default view will be used.
     * @param {*} configId config_id of the workspace that is being used.
     * @returns form layout and field data
     */
    getFormLayoutAndData: function (table, sysId, appId, configId) {
        if (!table || !sysId) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.MISSING_TABLE_OR_SYSID,
                action: this.ACTIONS.GET_FORM_LAYOUT_AND_DATA,
                source: this.EXPLORE_CI_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table or sysId is missing"),
                details: "Table and sysId are required to fetch form layout and data",
                logError: true
            });
        }
        const recordGr = CMDBWsGlideUtils.getGrBySysId(table, sysId);
        const recordTable = recordGr.getRecordClassName();
        if (!recordGr) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.INVALID_RECORD,
                action: this.ACTIONS.GET_FORM_LAYOUT_AND_DATA,
                source: this.EXPLORE_CI_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Record not found"),
                details: "Record with provided table and sysId not found",
                logError: true
            });
        }
        const sections = this._getFormSections(recordTable, sysId, appId, configId);
        if (!sections) {
            return null;
        }
        const allAttributes = this._getAllAttributes(recordTable);
        const allAttributesSection = this._buildSectionLayout(
            this.SECTIONS.ALL_ATTRIBUTES.CAPTION,
            this.SECTIONS.ALL_ATTRIBUTES.CAPTION_DISPLAY,
            this.SECTIONS.ALL_ATTRIBUTES.ID,
            allAttributes,
            2
        );

        sections.push(allAttributesSection);

        const _sectionFields = sections
            .flatMap(section => section.rows
                .flatMap(row => row.flatMap(column => column.fields)));
        const fieldValues = CMDBWsGlideUtils.getFieldValues(recordTable, sysId, _sectionFields, true);
        const fieldMetadata = CMDBWsGlideUtils.getFieldMetadata(recordTable, sysId, _sectionFields);
        const fields = {};
        _sectionFields.forEach(field => {
            if(global.JSUtil.notNil(fieldMetadata[field]) && fieldMetadata[field]['internalType'] === 'boolean')
                fieldValues[field]['value'] = global.JSUtil.toBoolean(fieldValues[field]['displayValue']);
				
            fields[field] = {
                ...fieldMetadata[field],
                ...fieldValues[field]
            };
        });
        const result = {
            sections,
            fields,
            view: this.CACHE.RESOLVED_VIEW[this._getViewCacheKey(table, appId, configId, "form")]
        }
        return result;
    },

    /**
     * Get service and offering for the given CI
     * @param {*} table
     * @param {*} sysId
     * @returns array of services and offerings
     */
    getServiceAndOffering: function(table, sysId) {
        if (!table || !sysId) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.MISSING_TABLE_OR_SYSID,
                action: this.ACTIONS.GET_SERVICE_AND_OFFERING,
                source: this.EXPLORE_CI_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table or sysId is missing"),
                details: "Table and sysId are required to fetch services and offerings",
                logError: true
            });
        }
        if (!CMDBWsGlideUtils.isValidRecord(table, sysId)) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.INVALID_RECORD,
                action: this.ACTIONS.GET_FORM_LAYOUT_AND_DATA,
                source: this.EXPLORE_CI_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Record not found"),
                details: "Record with provided table and sysId not found",
                logError: true
            });
        }
        const SERVICE_INSTANCE = {
            id: 'service_instances',
            label: sn_i18n.Message.getMessage('sn_cmdb_ws', 'Service Instances'),
            table: this.SERVICE_INSTANCE.TABLE
        };

        const BUSINESS_SERVICE_OFFERING = {
            id: 'business_service_offering',
            label: sn_i18n.Message.getMessage('sn_cmdb_ws', 'Business Service Offering'),
            table: this.SERVICE_OFFERING.TABLE
        };

        const TECHNOLOGY_MGMT_SERVICE = {
            id: 'technology_mgmt_service',
            label: sn_i18n.Message.getMessage('sn_cmdb_ws', 'Technology Management Service'),
            table: this.TECHNOLOGY_MGMT_SERVICE.TABLE
        };

        const TECHNOLOGY_MGMT_SERVICE_OFFERING = {
            id: 'technology_mgmt_service_offering',
            label: sn_i18n.Message.getMessage('sn_cmdb_ws', 'Technology Management Offering'),
            table: this.SERVICE_OFFERING.TABLE
        };

        const associatedServiceIds = Object.keys(CMDBWsGlideUtils.queryTable(this.SVC_CI_ASSOC.TABLE, [
            [this.SVC_CI_ASSOC.CI_ID, sysId]
        ], this.SVC_CI_ASSOC.SERVICE_ID, []));

        const serviceInstances = this._getServiceInstances(sysId, associatedServiceIds);

        const serviceOfferingsForSvcInstances = this._getServiceOfferingForServiceInstance(serviceInstances);
        const businessServiceOffering = Object.keys(serviceOfferingsForSvcInstances)
            .filter(sysId => serviceOfferingsForSvcInstances[sysId][this.SERVICE_OFFERING.SERVICE_CLASSIFICATION] === this.SERVICE_CLASSIFICATION_OPTIONS.BUSINESS_SERVICE);

        const techMgmtOfferingForSvcInstances = Object.keys(serviceOfferingsForSvcInstances)
            .filter(sysId => serviceOfferingsForSvcInstances[sysId][this.SERVICE_OFFERING.SERVICE_CLASSIFICATION] === this.SERVICE_CLASSIFICATION_OPTIONS.TECHNICAL_SERVICE);
        const techMgmtOfferingForDynamicCIGrp = this._getTechMgmtOfferingForDynamicCiGrp(sysId, associatedServiceIds);

        const _mergedTechMgmtOffering = new Set();
        if (techMgmtOfferingForSvcInstances && techMgmtOfferingForSvcInstances.length > 0) {
            techMgmtOfferingForSvcInstances.forEach(tmo => _mergedTechMgmtOffering.add(tmo));
        }
        if (techMgmtOfferingForDynamicCIGrp && techMgmtOfferingForDynamicCIGrp.length > 0) {
            techMgmtOfferingForDynamicCIGrp.forEach(tmo => _mergedTechMgmtOffering.add(tmo));
        }

        const technologyMgmtServiceOffering = Array.from(_mergedTechMgmtOffering);

        const technologyMgmtService = this._getTechnologyMgmtServices(sysId, technologyMgmtServiceOffering);

        return [
            {
                ...SERVICE_INSTANCE,
                filter: "sys_idIN" + serviceInstances,
                count: serviceInstances.length
            },
            {
                ...BUSINESS_SERVICE_OFFERING,
                filter: "sys_idIN" + businessServiceOffering,
                count: businessServiceOffering.length
            },
            {
                ...TECHNOLOGY_MGMT_SERVICE,
                filter: "sys_idIN" + technologyMgmtService,
                count: technologyMgmtService.length
            },
            {
                ...TECHNOLOGY_MGMT_SERVICE_OFFERING,
                filter: "sys_idIN" + technologyMgmtServiceOffering,
                count: technologyMgmtServiceOffering.length
            }
        ]
    },

    /**
     * Get Service Instances associated with given CI
     * @param {*} ciSysId
     * @param {*} associatedServiceIds
     * @returns service instances - [sys_id]
     * */
    _getServiceInstances: function(ciSysId, associatedServiceIds) {
        const services = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.SERVICE_INSTANCE.TABLE, 
            [[this.SERVICE_INSTANCE.SERVICE_CLASSIFICATION, this.SERVICE_CLASSIFICATION_OPTIONS.APPLICATION_SERVICE]],
            this.SYS_ID, 
            associatedServiceIds, 
            this.SYS_ID, 
            []
        );

        if (services[ciSysId]) {
            delete services[ciSysId];
        }

        return Object.keys(services);
    },

    /**
     * Get Technology Management Service associated with given Technology Management Offering
     * @param {*} ciSysId
     * @param {*} technologyMgmtOfferingIds
     * @returns technology management service - [sys_id]
     * */
    _getTechnologyMgmtServices: function(ciSysId, technologyMgmtOfferingIds) {
        const _serviceIds = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.SERVICE_OFFERING.TABLE,
            [],
            this.SYS_ID,
            technologyMgmtOfferingIds,
            this.SERVICE_OFFERING.PARENT,
            []
        );

        if (_serviceIds[ciSysId]) {
            delete _serviceIds[ciSysId];
        }

        return Object.keys(_serviceIds);
    },

    /**
     * Get technology management offering associated with given dynamic ci group
     * @param {*} ciSysId
     * @param {*} associatedServiceIds
     * @returns technology management offering - [sys_id]
     * */
    _getTechMgmtOfferingForDynamicCiGrp: function(ciSysId, associatedServiceIds) {
        const dynamicCiGroupIds = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.DYNAMIC_CI_GROUP.TABLE, 
            [], 
            this.SYS_ID, 
            associatedServiceIds, 
            this.SYS_ID, 
            []
        );

        const _parent = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.CMDB_REL_CI.TABLE, 
            [], 
            this.CMDB_REL_CI.CHILD, 
            Object.keys(dynamicCiGroupIds), 
            this.CMDB_REL_CI.PARENT, 
            []
        );

        const _child = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.CMDB_REL_CI.TABLE, 
            [], 
            this.CMDB_REL_CI.PARENT, 
            Object.keys(dynamicCiGroupIds), 
            this.CMDB_REL_CI.CHILD, 
            []
        );

        const _serviceOfferingIds = Object.keys(this.wsUtil.mergeObjects(_parent || {}, _child || {}));
        const  techMgmtOfferingForDynamicCIGrp = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.SERVICE_OFFERING.TABLE, 
            [
                [this.SERVICE_OFFERING.SERVICE_CLASSIFICATION, this.SERVICE_CLASSIFICATION_OPTIONS.TECHNICAL_SERVICE]
            ], 
            this.SYS_ID, 
            _serviceOfferingIds, 
            this.SYS_ID, 
            []
        );

        if (techMgmtOfferingForDynamicCIGrp[ciSysId]) {
            delete techMgmtOfferingForDynamicCIGrp[ciSysId];
        }
        return Object.keys(techMgmtOfferingForDynamicCIGrp);
    },

    /**
     * Get service offering associated with given service instances
     * @param {*} serviceInstanceIds
     * @returns service offering - [{sys_id: { service_classification: <value> }}]
     */
    _getServiceOfferingForServiceInstance: function(serviceInstanceIds) {
        const _child = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.CMDB_REL_CI.TABLE, 
            [], 
            this.CMDB_REL_CI.PARENT, 
            serviceInstanceIds, 
            this.CMDB_REL_CI.CHILD, 
            []
        );
        const _parent = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.CMDB_REL_CI.TABLE, 
            [], 
            this.CMDB_REL_CI.CHILD, 
            serviceInstanceIds, 
            this.CMDB_REL_CI.PARENT, 
            []
        );

        const _sysIds = Object.keys(this.wsUtil.mergeObjects(_parent || {}, _child || {}));
        const serviceOffering = CMDBWsGlideUtils.queryTableWithBatchedInClause(
            this.SERVICE_OFFERING.TABLE, 
            [], 
            this.SYS_ID, 
            _sysIds, 
            this.SYS_ID, 
            [this.SERVICE_OFFERING.SERVICE_CLASSIFICATION]
        );

        return serviceOffering;
    },

	/**
	 * Creates a record in the cmdb_key_value table with the given fields
	 * @param {object} args - object where keys are column names and values are the corresponding values
	 * @param {string} args.configuration_item - sys_id of CI record
	 * @param {string} args.table - table of CI record
	 * @param {string} args.key - key to insert
	 * @param {string} args.value - value to insert
	 * @return {string} sys_id of newly created tag record
	 *
	 * @example
	 * createTag({
	 *    configuration_item: "CI_sys_id",
	 *    table: "CI_table_name"
	 *    key: "Test Key",
	 *    value: "Test Value"
	 * })
	 */
	createTag: function(args) {
		const requiredFields = [this.CMDB_KEY_VALUE.CONFIGURATION_ITEM, this.CMDB_KEY_VALUE.KEY];
		CMDBWsGlideUtils.checkRequiredFields(args, requiredFields, this.ACTIONS.CREATE_TAG);
		
		let userCanRead = false;
		const grCI = CMDBWsGlideUtils.getGrBySysId(args.table, args.configuration_item, true);
		if (grCI) {
			userCanRead = grCI.canRead();
		}
		if (!userCanRead) {
			throw new CMDBWsError({
				code: this.ERROR_CODES.INSERT_OP_FAILED,
				action: this.ACTIONS.CREATE_TAG,
				source: this.EXPLORE_CI_ERROR_SOURCE,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to create CI tag."),
				details: "Failed to create tag as the user does not have permission to access CI record",
				logError: true
			});
		}

		const gr = new GlideRecordSecure(this.CMDB_KEY_VALUE.TABLE);
		for (let field in args) {
			gr.setValue(field, args[field]);
		}
		const sysId = gr.insert();
		if (!sysId) {
			const lastErrorMessage = gr.getLastErrorMessage();
			throw new CMDBWsError({
				code: this.ERROR_CODES.INSERT_OP_FAILED,
				action: this.ACTIONS.CREATE_TAG,
				source: this.EXPLORE_CI_ERROR_SOURCE,
				message: lastErrorMessage || sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to create CI tag."),
				details: lastErrorMessage ? "Failed to create CI tag. " + lastErrorMessage : "Failed to create CI tag.",
				logError: true
			});
		}
		return sysId;
	},

	/**
	 * Updates tag for given tagId with arguments
	 * @param {string} tagId - sys_id of record in cmdb_key_value table
	 * @param {object} args - object where keys are column names and values are the corresponding values to update
	 * @param {string} args.key - key to update
	 * @param {string} args.value - value to update
	 * @param {boolean} true if update succeeds throws error otherwise
	 *
	 * @example
	 * updateTag('tagId', {
	 *    key: "Test Key",
	 *    value: "Test Value"
	 * })
	 */
	updateTag: function(tagId, args) {
		CMDBWsGlideUtils.assertValidRecord(this.CMDB_KEY_VALUE.TABLE, tagId, this.ACTIONS.UPDATE_TAG);
		const tagGr = CMDBWsGlideUtils.getGrBySysId(this.CMDB_KEY_VALUE.TABLE, tagId, true);
		for (let field in args) {
			tagGr.setValue(field, args[field]);
		}
		const recordUpdated = tagGr.update();
		if (!recordUpdated) {
			const lastErrorMessage = tagGr.getLastErrorMessage();
			throw new CMDBWsError({
				code: this.ERROR_CODES.UPDATE_OP_FAILED,
				action: this.ACTIONS.UPDATE_TAG,
				source: this.EXPLORE_CI_ERROR_SOURCE,
				message: lastErrorMessage || sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to update CI tag."),
				details: lastErrorMessage ? "Failed to update CI tag. " + lastErrorMessage : "Failed to update CI tag.",
				logError: true
			});
		}
		return recordUpdated;
	},

	/**
	 * @param {string} tagId - sys_id of record in cmdb_key_value table
	 * @return {boolean} true if update succeeds throws error otherwise
	 */
	deleteTag: function(tagId) {
		CMDBWsGlideUtils.assertValidRecord(this.CMDB_KEY_VALUE.TABLE, tagId, this.ACTIONS.DELETE_TAG);
		const tagGr = CMDBWsGlideUtils.getGrBySysId(this.CMDB_KEY_VALUE.TABLE, tagId, true);
		const recordDeleted = tagGr.deleteRecord();
		if (!recordDeleted) {
			const lastErrorMessage = tagGr.getLastErrorMessage();
			throw new CMDBWsError({
				code: this.ERROR_CODES.DELETE_OP_FAILED,
				action: this.ACTIONS.DELETE_TAG,
				source: this.EXPLORE_CI_ERROR_SOURCE,
				message: lastErrorMessage || sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to delete CI tag."),
				details: lastErrorMessage ? "Failed to delete CI tag. " + lastErrorMessage : "Failed to delete CI tag.",
				logError: true
			});
		}
		return recordDeleted;
	},

	getRelatedItems: function(sysId) {
		const RELATED_ITEMS = [];
		const CONFIG = this.RELATED_ITEMS_CONFIG;
		const relItemConfigGr = new GlideRecord(CONFIG.TABLE);
		relItemConfigGr.addQuery(CONFIG.CONFIG_IDENTIFIER, this.DEFAULT_CONFIG_ID);
		relItemConfigGr.addActiveQuery();
		relItemConfigGr.orderBy(CONFIG.ORDER);
		relItemConfigGr.query();
		while(relItemConfigGr.next()) {
			const tableName = relItemConfigGr.getValue(CONFIG.TABLE_FIELD);
			const conditions = relItemConfigGr.getValue(CONFIG.CONDITIONS);
			const groupByField = relItemConfigGr.getValue(CONFIG.GROUP_BY_FIELD);
			const cmdbCIReferenceField = relItemConfigGr.getValue(CONFIG.REFERENCE_FIELD);
			const relItemGA = new GlideAggregate(tableName);
			if (!gs.nil(conditions))
				relItemGA.addEncodedQuery(conditions, true);
			relItemGA.addQuery(cmdbCIReferenceField, sysId);
			var encodedQuery = relItemGA.getEncodedQuery();
			relItemGA.addAggregate('COUNT', groupByField);
			relItemGA.query();
			const relItemDTO = this._getRelItemDTO(relItemConfigGr, tableName, encodedQuery, groupByField);
			while(relItemGA.next()) {
				var groupByName = relItemGA.getDisplayValue(groupByField);
				var query = encodedQuery +'^'+groupByField+'='+relItemGA.getValue(groupByField);
				relItemDTO.data.push({label: groupByName || sn_i18n.Message.getMessage('sn_cmdb_ws', '(empty)'), value: relItemGA.getAggregate('COUNT', groupByField), query: query, name: relItemGA.getValue(groupByField) });
			}
			RELATED_ITEMS.push(relItemDTO);
		}

		return RELATED_ITEMS;
	},

	_getRelItemDTO : function(relItemConfigGr, tableName, encodedQuery, groupByField) {
		const tableGr = new GlideRecord(tableName);
		const tableLabel = tableGr.getLabel();
		const fieldElement = tableGr.getElement(groupByField);
		const CONFIG = this.RELATED_ITEMS_CONFIG;
		return {
			sysId: relItemConfigGr.getUniqueValue(),
			name: relItemConfigGr.getDisplayValue(CONFIG.NAME),
			tableName: tableName,
			tableLabel: tableLabel,
			groupByField: groupByField,
			groupByFieldLabel: fieldElement.getLabel(),
			groupByFieldType: fieldElement.getED().getInternalType(),
			fields: relItemConfigGr.getValue(CONFIG.FIELDS),
			view: relItemConfigGr.getValue(CONFIG.LIST_VIEW),
			url: relItemConfigGr.getValue(CONFIG.LINK_DESTINATION),
			data: [],
			encodedQuery: encodedQuery
		};

	},

    /**
     * Update CI record with the given fields
     * @param {string} table - table name
     * @param {string} sysId - sys_id of the record
     * @param {object} fields - object where keys are column names and values are the corresponding values to update
     * @param {array} dependencies - array containing dependent relationship objects for a given class. Passing in as argument because the platform exposes a REST API (/api/now/identifyDebugUI/hostAndContainRules/{{ciClassName}}) that fetches hosting & containment rules for a given class. 
     * @param {boolean} bypassIRE - true if IRE should be bypassed
     * @returns {object} response - object containing the response of the update operation
     * @throws {CMDBWsError} - if the update operation fails
     * */
    updateCI: function(table, sysId, fields, dependencies, bypassIRE = false) {
        const IRE_CONSTANTS = new CMDBWsIREConstants();
        CMDBWsGlideUtils.assertValidRecord(table, sysId, this.ACTIONS.UPDATE_CI);
        const recordGr = CMDBWsGlideUtils.getGrBySysId(table, sysId);
        const recordTable = recordGr.getRecordClassName();
        if (bypassIRE) {
            gs.info("Bypassing IRE for update operation");
            return this._updateCIWithoutIRE(recordTable, sysId, fields);
        }
        const identificationRules = this.getIdentificationRules(recordTable);
        if (global.JSUtil.nil(identificationRules)) {
            gs.info("No IRE identification rules found for table: " + recordTable);
            return this._updateCIWithoutIRE(recordTable, sysId, fields);
        } else {
            const criterionAttributes = this._getCriterionAttributes(identificationRules);
            const criterionAttributesValues = this._getCriterionAttributesValues(recordTable, sysId, criterionAttributes);
            // merge existing criterion attribute values with the edited fields before passing to IRE
            const editedAndCriterionFields = Object.assign({}, criterionAttributesValues, fields);
            const identifyPayload = this._buildIrePayload(recordTable, editedAndCriterionFields, identificationRules);
            identifyPayload.items[0].lookup = this._buildLookupPayload(sysId, identificationRules);

            // Add dependent relationships if class is dependent
            if (!identificationRules.independent) {
                try {
                    const relationsInfo = this._getRelationsInfo(sysId, dependencies);
                    if (global.JSUtil.nil(relationsInfo)) {
                        throw new CMDBWsError({
                            code: this.ERROR_CODES.MISSING_DEPENDENT_RELATIONSHIP,
                            action: this.ACTIONS.UPDATE_CI,
                            source: this.EXPLORE_CI_ERROR_SOURCE,
                            message: this.UPDATE_CI_RESPONSE.MISSING_DEPENDENT_RELATIONSHIP.message,
                            details: "Dependent CI Classes require a valid dependent relationship before you can edit this record.",
                            logError: true
                        });
                    }
                    identifyPayload.relations.push(relationsInfo.relations);
                    identifyPayload.items.push(relationsInfo.relatedItem);
                } catch (e) {
                    if (e instanceof CMDBWsError) {
                        let response = {};
                        if (e.CODE == this.ERROR_CODES.MISSING_DEPENDENT_RELATIONSHIP) {
                            response = this.UPDATE_CI_RESPONSE.MISSING_DEPENDENT_RELATIONSHIP;
                        } else if (e.CODE == this.ERROR_CODES.MISSING_HOSTING_OR_CONTAINMENT_RULES) {
                            response = this.UPDATE_CI_RESPONSE.MISSING_HOSTING_OR_CONTAINMENT_RULES;
                        }
                        response.details = e.DETAILS;
                        response.dependentClass = table;
                        return response;
                    } else {
                        throw e;
                    }
                }
            }
            const updatePayload = JSON.parse(JSON.stringify(identifyPayload));
            updatePayload.items[0].values.sys_id = sysId;
            let updateResponse = null;
            let response = this.UPDATE_CI_RESPONSE.UPDATE_SUCCESS;

            // if criterion attribute didn't change, skip identification and update the CI
            if (!this._hasCriterionAttributeChanged(criterionAttributes, fields)) {
                gs.info("Criterion attribute didn't change, skipping identification");
                response = this._updateCIAndParseResponse(IRE_CONSTANTS.DISCOVERY_SOURCE.MANUAL_VIA_IRE, updatePayload);
            } else {
                gs.info("Criterion attribute changed, running identification");
                let identifyResponse;
                try {
                    identifyResponse = this.ireService.identifyCI(IRE_CONSTANTS.DISCOVERY_SOURCE.MANUAL_VIA_IRE, identifyPayload, {});
                } catch (e) {
                    if (e instanceof CMDBWsError) {
                        if(e.CODE == this.ERROR_CODES.FAILED_IDENTIFY_CI) {
                            response = this.UPDATE_CI_RESPONSE.ERROR;
                            response.type = this.ERROR_CODES.FAILED_IDENTIFY_CI;
                            response.details = e.DETAILS;
                            return response;
                        } else {
                            throw e;
                        }
                    }
                }
                const identifyOperation = identifyResponse && identifyResponse[0] ? identifyResponse[0].operation : null;
                const identifiedSysId = identifyResponse && identifyResponse[0] ? identifyResponse[0].sysId : null;
                
                // if identifyCI either says INSERT or UPDATE the same record as the current record, then update the CI
                if ((identifyResponse && identifyOperation == IRE_CONSTANTS.IRE_OPERATION.INSERT) || (identifiedSysId == sysId)) {
                    gs.info("Identified CI same as the current record, updating CI");
                    response = this._updateCIAndParseResponse(IRE_CONSTANTS.DISCOVERY_SOURCE.MANUAL_VIA_IRE, updatePayload);
                } else if (identifiedSysId  && identifiedSysId != sysId) {
                    gs.info("Identified CI different than the current record, skipping update");
                    response = this.UPDATE_CI_RESPONSE.DUPLICATE_FOUND;
                    response.duplicateSysId = identifiedSysId;
                } else {
                    let error = "Error: " + JSON.stringify(identifyResponse);
                    gs.error(error);
                    throw new CMDBWsError({
                        code: this.ERROR_CODES.UPDATE_OP_FAILED,
                        action: this.ACTIONS.UPDATE_TAG,
                        source: this.EXPLORE_CI_ERROR_SOURCE,
                        message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Update operation failed."),
                        details: "Update operation failed due to unknown reasons. " + error,
                        logError: true
                    });
                }
            }

           return response;
        }
    },

	getIdentificationRules: function(recordTable) {
		return this.ireService.getIdentificationRules(recordTable);
	},

	/**
	 * @param {string} table - table name of the CI.
	 * @param {string} sysId - The sys_id of the CI.
	 * @param {Array} dependencies - An array of dependencies to check.
	 * @returns {Object} An object indicating whether the CI is independent and if there are missing dependent relationships.
	 */
	getDependentRelationships: function(table, sysId, dependencies) {
		if (gs.nil(table) || gs.nil(sysId)) {
			throw new CMDBWsError({
				code: this.ERROR_CODES.MISSING_TABLE_OR_SYSID,
				action: this.ACTIONS.GET_DEPENDENT_RELATIONSHIPS,
				source: this.EXPLORE_CI_ERROR_SOURCE,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "table or sysId is missing"),
				details: "table and sysId are required to fetch dependent relationships",
				logError: true
			});
		}
		CMDBWsGlideUtils.assertValidRecord(table, sysId, this.ACTIONS.GET_DEPENDENT_RELATIONSHIPS);
		const recordGr = CMDBWsGlideUtils.getGrBySysId(table, sysId);
		const recordTable = recordGr.getRecordClassName();

		const output = {
			independent: true
		};
		const identificationRules = this.getIdentificationRules(recordTable);
		if(global.JSUtil.nil(identificationRules))
			return output;

		if(!identificationRules.independent) {
			output.independent = false;
			const relationsInfo = this._getRelationsInfo(sysId, dependencies);
			output.missingDependentRelationship = global.JSUtil.nil(relationsInfo);
		}

		return output;
	},

	_updateCIAndParseResponse: function(discoverySource, updatePayload) {
		let response = this.UPDATE_CI_RESPONSE.UPDATE_SUCCESS;
		try {
			const updateResponse = this.ireService.updateCI(discoverySource, updatePayload, {}).summary;
			if (global.JSUtil.notNil(updateResponse) && updateResponse.length>0 && global.JSUtil.notNil(updateResponse[0].maskedAttributes)) {
				response = this.UPDATE_CI_RESPONSE.PARTIAL_UPDATE;
				response.maskedAttributes = updateResponse[0].maskedAttributes;
			}
		} catch (e) {
			if (e instanceof CMDBWsError) {
				if(e.CODE == this.ERROR_CODES.FAILED_UPDATE_CI) {
					response = this.UPDATE_CI_RESPONSE.ERROR;
					response.type = this.ERROR_CODES.FAILED_UPDATE_CI;
					response.details = e.DETAILS;
				} else {
					throw e;
				}
			}
		}
		return response;
	},

    /**
     * Get all the attributes from the identification rules
     * @param {object} identificationRules - identification rules object
     * @returns {array} - array of attributes
     * */
    _getCriterionAttributes: function(identificationRules) {
        const tableFields = {};
        for (const rule of identificationRules.rules) {
            const extractedFields = this.ireUtil.extractFieldsFromRule(identificationRules.table, rule);
            for (const [tableName, fields] of Object.entries(extractedFields)) {
                if (!tableFields[tableName]) {
                    tableFields[tableName] = new Set();
                }
                fields.ruleFields.forEach(field => {
                    tableFields[tableName].add(field);
                });
            }
        }
        return Array.from(tableFields[identificationRules.table]);
    },

    /**
     * Get the values of the criterion attributes for the given table and sysId
     * @param {string} table - table name
     * @param {string} sysId - sys_id of the record
     * @param {array} criterionAttributes - array of attributes
     * @return {object} - object containing the values of the attributes
     * */
    _getCriterionAttributesValues: function (table, sysId, criterionAttributes) {
        const fieldValues = CMDBWsGlideUtils.getFieldValues(table, sysId, criterionAttributes, true);
        const result = {};
        for (const field in fieldValues) {
            const value = fieldValues[field].value;
            if (global.JSUtil.notNil(value)) {
                result[field] = value;
            }
        }
        return result;
    },

    /**
     * Check if the criterion attributes have changed
     * @param {array} criterionAttributes - array of attributes
     * @param {object} fields - object containing the fields to be updated
     * @return {boolean} - true if the criterion attributes have changed, false otherwise
     * */
    _hasCriterionAttributeChanged: function(criterionAttributes, fields) {
        if (!criterionAttributes) {
            return false;
        }
        for (const field of criterionAttributes) {
            if (Object.hasOwn(fields, field)) {
                return true;
            }
        }
        return false;
    },

    /**
     * Build the IRE payload for the given table and fields
     * @param {string} table - table name
     * @param {object} fields - object containing the fields to be updated
     * @param {object} identificationRules - identification rules object
     * @return {object} - object containing the IRE payload
     * */
    _buildIrePayload: function(table, fields, identificationRules) {
        const irePayload = {
            items: [{
                className: table,
                values: fields
            }], // main table item will be at index 0
            relations: []
        };
        // adding lookup data to payload is being handled in _buildLookupPayload
        return irePayload;
    },


    /**
     * Fetches lookup data and builds the lookup payload for the given sysId and identification rules
     * @param {string} sysId - sys_id of the record
     * @param {object} identificationRules - identification rules object
     * @return {object} - object containing the lookup metadata for the given set of rules, if there were any lookup or hybrid rules defined
     * */
    _buildLookupPayload: function(sysId, identificationRules) {
		const lookupMetadata = this._getLookupMetadata(identificationRules);
		var lookUpPayload = [];

		if(global.JSUtil.notNil(lookupMetadata)) {
			for (const [tableName, metadata] of Object.entries(lookupMetadata)) {
				if (gs.tableExists(tableName)) { //always do gs.tableExists before querying with any variable table names
					var gr = new GlideRecordSecure(tableName);
					if(global.JSUtil.notNil(metadata.encodedQuery)) {
						gr.addEncodedQuery(metadata.encodedQuery, false); //bypass ACL check as the encodedQuery is not a user input query, it's coming from IRE
					}
					gr.addQuery(metadata.referenceField, sysId); //referenceField cannot be empty for lookup rules, must be populated
					gr.query();

					if(gr.hasNext()) {
						while(gr.next()) {
							var payload = {
								"className" : tableName,
								"values" : {

								}
							};
							var fieldValues = {};
							for (const field of metadata.fields) {
								fieldValues[field] = gr.getValue(field);
							}
							payload["values"] = fieldValues;
							lookUpPayload.push(payload);
						}
					}	
				}
			}
		}
		return lookUpPayload;
	},

    /**
     * Builds the lookup metadata for the given identification rules
     * @param {object} identificationRules - identification rules object
     * @return {object} - object containing the lookup metadata for the given set of rules, if there were any lookup or hybrid rules defined
     * */
    _getLookupMetadata: function(identificationRules) {
        var lookUpFields = {};
        var tableFields = {};
        for (const rule of identificationRules.rules) {
            var isLookup = this.ireUtil.isLookupRule(rule);
            var isHybrid = this.ireUtil.isHybridRule(rule);
            if (isLookup || isHybrid) {
                const lookupMetadata = this.ireUtil.extractLookUpMetadataFromRule(rule);
                if(global.JSUtil.notNil(lookupMetadata)) {
                    for (const [tableName, obj] of Object.entries(lookupMetadata)) {
                        if(!lookUpFields[tableName]) {
                            lookUpFields[tableName] = new Set();
                        }
                        obj.ruleFields.forEach(field => {
                            lookUpFields[tableName].add(field);
                        });

                        if(!tableFields[tableName]) {
                            tableFields[tableName] = {
                                'referenceField' : obj.referenceField,
                                'encodedQuery' : obj.encodedQuery,
                            };
                        }
                        tableFields[tableName].fields = Array.from(lookUpFields[tableName]);

                    }
                }
            }
        }
        return tableFields;
    },

    /**
     * Update CI record without using IRE
     * @param {string} table - table name
     * @param {string} sysId - sys_id of the record
     * @param {object} fields - object containing the fields to be updated
     * @return {object} - object containing the response of the update operation
     * */
    _updateCIWithoutIRE: function(table, sysId, fields) {
		CMDBWsGlideUtils.assertValidRecord(table, sysId, this.ACTIONS.UPDATE_TAG);
		const ciGr = CMDBWsGlideUtils.getGrBySysId(table, sysId, true);
		for (let field in fields) {
			ciGr.setValue(field, fields[field]);
		}
		const recordUpdated = ciGr.update();
		let response = this.UPDATE_CI_RESPONSE.UPDATE_SUCCESS;
		if (!recordUpdated) {
			const lastErrorMessage = ciGr.getLastErrorMessage();
			response = Object.assign({}, this.UPDATE_CI_RESPONSE.ERROR, {
				type: this.ERROR_CODES.FAILED_UPDATE_CI,
				message: lastErrorMessage || sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to update CI."),
				details: lastErrorMessage ? `Failed to update CI. ${lastErrorMessage}` : "Failed to update CI."
			});
		}
		return response;
    },

    /**
     * Get dependent CI relationship information for identifyCI relations payload
     * @param {string} ciSysId - Dependent CI sys_id
     * @param {array} dependencies - Array containing clas dependency objects for CI Class related to the given ciSysId
     * @return {object} Output containing two objects - relations and relatedItem to be used in identifyCI payload
     */
    _getRelationsInfo: function(ciSysId, dependencies) {
        if (!dependencies.length) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.MISSING_HOSTING_OR_CONTAINMENT_RULES,
                action: this.ACTIONS.UPDATE_CI,
                source: this.EXPLORE_CI_ERROR_SOURCE,
                message: this.UPDATE_CI_RESPONSE.MISSING_HOSTING_OR_CONTAINMENT_RULES.message,
                details: "A hosting or containment rule must be defined for this dependent class.",
                logError: true
            });
        }
        for (let dependency of dependencies) {
            const isReverse = dependency.is_reverse;
            const isParent = dependency.role === 'parent';
            const dependentCiIsParent = (isParent && !isReverse) || (!isParent && isReverse);
            const relGr = new GlideRecord(this.CMDB_REL_CI.TABLE);
            relGr.addQuery(this.CMDB_REL_CI.TYPE_NAME, dependency.relationship);
			
            if (dependentCiIsParent) {
				relGr.addQuery(this.CMDB_REL_CI.PARENT, ciSysId);
                relGr.addQuery(this.CMDB_REL_CI.CHILD_CLASS_NAME, dependency.name);
            } else {
                relGr.addQuery(this.CMDB_REL_CI.CHILD, ciSysId);
                relGr.addQuery(this.CMDB_REL_CI.PARENT_CLASS_NAME, dependency.name);
            }
            relGr.setLimit(1);
            relGr.query();

            // return first matching relationship info
            if (relGr.next()) {
                // fetch relations payload and related object to add to items payload
                let relatedItemSysId, parentIndex, childIndex;
                if (dependentCiIsParent) {
                    relatedItemSysId = relGr.getValue(this.CMDB_REL_CI.CHILD);
                    parentIndex = 0;
                    childIndex = 1;
                } else {
                    relatedItemSysId = relGr.getValue(this.CMDB_REL_CI.PARENT);
                    parentIndex = 1;
                    childIndex = 0;
                }
                let output = {
                    relations: {
                        parent: parentIndex,
                        child: childIndex,
                        type: relGr.getDisplayValue(this.CMDB_REL_CI.TYPE)
                    },
                    relatedItem: {
                        className: dependency.name,
                        values: {
                            sys_id: relatedItemSysId
                        }
                    }
                };
                return output;
            }
        }
    },
    type: "CMDBWsExploreCIService",
};
