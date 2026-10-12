/**
 * Service for transforming Form Builder metadata into a specific Simple Mobile Component metadata.
 * This class is part of a strategy pattern implementation for transforming a web component from a web source
 * into a mobile component
 */
class SourceFormBuilderService {
    constructor() {
        this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
        this.simpleTransformerRecordScreenService = new SimpleTransformerRecordScreenService();
        // this.simpleTransformerInputFormScreenService = new SimpleTransformerInputFormScreenService();
    }

    /**
     * Transforms Form Builder metadata into Simple Mobile Component based on component type.
     *
     * @param {Object} formMetadata - The form metadata to transform.
     * @param {Object} options - Options for transformation.
     * @param {string} options.componentType - The type of component to transform.
     * @param {Object} options.viewConfig - The sysId of an existing view configuration.
     * @returns {Object} Transformed simple mobile metadata.
     * @throws {MABError} Throws an error if the component type is not provided or invalid.
     */
    transformToSimpleMobileMetadata(formMetadata, options) {
        const {componentType, viewConfigMode, viewConfig} = options;
        if (!componentType) {
            this.customErrorHandler.throwBadRequestError(
                'MISSING_COMPONENT_TYPE',
                `The 'componentType' field is required. Please provide a valid component type.`,
            );
        }

        const { RECORD_SCREEN } = WebToMobileUtils.SupportedMobileComponentTypes;
        switch (componentType.toUpperCase()) {
            case RECORD_SCREEN:
                return this.simpleTransformerRecordScreenService.transform({formMetadata, viewConfigMode, viewConfig});
            // #TODO: Placeholder for future support
            // case INPUT_FORM_SCREEN:
            //     return this.simpleTransformerInputFormScreenService.transform(formMetadata);
            default:
                const VALID_COMPONENT_TYPES = [RECORD_SCREEN];
                this.customErrorHandler.throwBadRequestError(
                    'INVALID_COMPONENT_TYPE',
                    `The component type '${componentType}' is not valid. Valid types are: ${VALID_COMPONENT_TYPES.join(', ')}`
                );
        }
    }

    /**
     * Retrieves component metadata based on table and view.
     *
     * @param {Object} options - Parameters for retrieving component.
     * @param {string} options.table - The table to retrieve from.
     * @param {string} options.view - The view to retrieve.
     * @returns {Object} Component metadata.
     * @throws {MABError} Throws an error if the table or view is not provided.
     */
    getComponent (options) {
        const {table, view} = options;

        if (!table) {
            this.customErrorHandler.throwBadRequestError(
                'MISSING_TABLE',
                `The 'table' field is required. Please specify the table to retrieve.`,
            );
        }

        if (!view) {
            this.customErrorHandler.throwBadRequestError(
                'MISSING_VIEW',
                `The 'view' field is required. Please specify the view to retrieve.`,
            );
        }

        try {
            const w2mDAO = new sn_glide_ms_api.WebToMobileDAO();
            const result = w2mDAO.getFormBuilderMetadata(table, view);
            const parsedResult = JSON.parse(result);
            return JSON.parse(parsedResult.result);
        } catch(error) {
            this.customErrorHandler.throwInternalError(
                'GET_FORM_METADATA_FAILED',
                'Failed to retrieve form builder metadata from the Form Builder API. Please verify the API response and ensure the API is operational.',
                error.stack
            );
        }
    }
}

/**
 * Service for transforming Form Builder metadata into a Simple Mobile Record Screen metadata.
 */
class SimpleTransformerRecordScreenService {
    constructor() {
        this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
    }

    /**
     * Transforms form metadata into a simple mobile record screen metadata.
     *
     * @param {Object} options - Parameters including form metadata and view configuration.
     * @param {Object} options.formMetadata - The form metadata to transform.
     * @param {Object} options.viewConfig - The sysId of an existing view configuration.
     * @returns {Object} Transformed simple mobile record screen metadata.
     */
    transform(options) {
        const {formMetadata, viewConfigMode, viewConfig} = options;
        const {fields, sections, view, tableHierarchy} = formMetadata;
        const fieldsMap = new Map(fields.map(field => [field.name, field]));
        const pickRequiredProperties = (field) => {
            const {
                label, prefix, name, value, type, active, scalarType,
                displayValue, tableLabel, display, display_type,
                display_type_label, is_function_field
            } = field;
            return {
                label, prefix, name, value, type, active, scalarType,
                displayValue, tableLabel, display, display_type,
                display_type_label, is_function_field
            };
        };

        const flattenedFields = sections
            .flatMap(section => section.columns)
            .flatMap(column => {
                // The format of field names can vary depending on the Glide Version
                if (column.fieldsJSONResponse) {
                    return JSON.parse(column.fieldsJSONResponse); // Glide Version <= X
                } else if (Array.isArray(column.fieldNames)) {
                    return column.fieldNames.map(name => ({ name })); // Glide Version <= X
                } else if (Array.isArray(column.fields)) {
                    return column.fields.map(field => ({ name: field.name })); // Glide Version > X
                } 
                this.customErrorHandler.throwInternalError(
                    'UNABLE_TO_PARSE_FIELDS_FROM_FORM_DAO',
                    `Unable to parse fields from Form Builder DAO. Please verify the structure of the response. ${JSON.stringify(column)}`,
                );
            })
            .map(field => fieldsMap.get(field.name))
            .filter(Boolean)
            .map(pickRequiredProperties);

        return {
            componentType: WebToMobileUtils.SupportedMobileComponentTypes.RECORD_SCREEN,
            viewValue: view.view,
            table: tableHierarchy[0],
            fields: flattenedFields,
            viewConfigMode,
            references: {
                viewConfig
            }
        };
    }
}


module.exports = SourceFormBuilderService;
