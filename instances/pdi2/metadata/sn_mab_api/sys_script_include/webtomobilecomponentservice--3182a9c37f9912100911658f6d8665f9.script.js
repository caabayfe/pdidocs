/**
 * Service for transforming web components to mobile components.
 *
 */
class WebToMobileComponentService {
    constructor() {
        this.sourceWebComponentService = new SourceWebComponentService();
        this.targetMobileComponentService = new TargetMobileComponentService();
        this.createMobileComponentService = new CreateMobileComponentService();
    }

    /**
     * Transforms a web component to mobile component metadata.
     *
     * @param {string} source - Source of the web component.
     * @param {Object} options - Options for transformation.
     * @returns {Object} An object containing full and preview mobile metadata.
     */
    transform(source, options) {
        const sourceMetadata = this.sourceWebComponentService.getWebComponent(source, options);
        const simpleMobileMetadata = this.sourceWebComponentService.transformToSimpleMobileMetadata(source, sourceMetadata, options);
        const fullMobileMetadata = this.targetMobileComponentService.transformToFullMobileMetadata(simpleMobileMetadata);
        const previewMetadata = this.createMobileComponentService.getComponentPreview(fullMobileMetadata);
        return {
            fullMobileMetadata,
            previewMetadata,
        };
    }

    /**
     * Regenerate a card using GEN AI and regenerate the mobile preview metadata.
     *
     * @param {Object} fullMobileMetadata - Full mobile metadata.
     * @returns {Object} An object containing full and preview mobile metadata.
     */
    regenerateCard(fullMobileMetadata) {
        const viewConfigComponent = fullMobileMetadata.components.find((component) => component.rootTable === 'sys_sg_view_config');
        const oldCardId = viewConfigComponent.rootSysId;
        const regeneratedCard = this.targetMobileComponentService.getCardRegeneration(fullMobileMetadata);
        const newCardId = regeneratedCard.rootSysId;
        const cardIndex = fullMobileMetadata.components.findIndex((component) => component.rootTable === 'sys_sg_view_config');
        fullMobileMetadata.components[cardIndex] = regeneratedCard;
        
        // Recursively replace oldCardId with newCardId
        function replaceCardId(obj, oldCardId, newCardId) {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replaceCardId(obj[key], oldCardId, newCardId);
                } else if (obj[key] === oldCardId) {
                    obj[key] = newCardId;
                }
            }
        }

        // Replace oldCardId with newCardId in the entire fullMobileMetadata object
        replaceCardId(fullMobileMetadata, oldCardId, newCardId);
        
        const previewMetadata = this.createMobileComponentService.getComponentPreview(fullMobileMetadata);
            
        return {
            fullMobileMetadata,
            previewMetadata,
        };
    }


    // /**
    //  * TODO: Placeholder for future support
    //  * Retrieves transformable web components based on the provided source and options.
    //  *
    //  * @param {string} source - The source of the web components.
    //  * @param {Object} options - Options for the web components.
    //  * @returns {Object} An object containing the source, component type, and web components.
    //  */
    // getWebComponents(source, options) {
    //     const results = this.sourceWebComponentService.getWebComponents(source, options);
    //     return {
    //         source,
    //         componentType: options.componentType,
    //         ...results,
    //     };
    // }
}

/**
 * Service for handling source web components.
 * This service provides methods to transform source metadata into simple mobile metadata
 * and to retrieve components from these sources for conversion into mobile components.
 *
 */
class SourceWebComponentService {
    constructor() {
        this.services = {
            FORM_BUILDER: new SourceFormBuilderService(),
            // TODO: Placeholder for future support
            // PAR_DASHBOARD: new SourceParDashboardService(),
            // UIB: new SourceUIBService(),
        };
        this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
    }

    /**
     * Retrieves a web component based on source and options.
     *
     * @param {string} source - Source of the web component.
     * @param {Object} options - Options for the component.
     * @returns {Object} The web component.
     */
    getWebComponent(source, options) {
        this._validateSource(source);
        const SourceWebComponentService = this._getSourceService(source);
        return SourceWebComponentService.getComponent(options);
    }

    /**
     * Transforms source metadata to simple mobile metadata.
     *
     * @param {string} source - Source of the web component.
     * @param {Object} sourceMetadata - Metadata of the source.
     * @param {Object} options - Transformation options.
     * @returns {Object} Simple mobile metadata.
     */
    transformToSimpleMobileMetadata(source, sourceMetadata, options) {
        this._validateSource(source);
        const SourceWebComponentService = this._getSourceService(source);
        return SourceWebComponentService.transformToSimpleMobileMetadata(sourceMetadata, options);
    }

    // /**
    //  * TODO: Placeholder for future support
    //  * Retrieves web components based on source and options.
    //  *
    //  * @param {string} source - Source of the web components.
    //  * @param {Object} options - Options for the components.
    //  * @returns {Object} Web components.
    //  * @throws {MABError} Throws an error if the source is invalid or unsupported.
    //  */
    // getWebComponents(source, options) {
    //     this._validateSource(source);
    //
    //     if (source.toUpperCase() === 'FORM_BUILDER') {
    //         this.customErrorHandler.throwBadRequestError(
    //             'INVALID_SOURCE',
    //             `The source '${source}' is not supported. Please use the Form Builder Internal API to retrieve the form views.`
    //         );
    //     }
    //
    //     const SourceWebComponentService = this._getSourceService(source);
    //     return SourceWebComponentService.getComponents(options);
    // }

    /**
     * Validates the source and throws an error if invalid.
     *
     * @param {string} source - Source to validate.
     * @throws {MABError} Throws an error if the source is missing or invalid.
     *
     * @private
     */
    _validateSource(source) {
        if (!source) {
            this.customErrorHandler.throwBadRequestError(
                'MISSING_SOURCE',
                "The field 'source' is a required field. Please provide a valid source."
            );
        }

        if (!this._isValidSource(source)) {
            this.customErrorHandler.throwBadRequestError(
                'INVALID_SOURCE',
                `The source '${source}' is not valid. Valid sources are: ${this._getAllValidSources().join(', ')}`
            );
        }
    }

    /**
     * Checks if the source is valid.
     *
     * @param {string} source - Source to check.
     * @returns {boolean} Whether the source is valid.
     * @private
     */
    _isValidSource(source) {
        return Object.keys(this.services).includes(source.toUpperCase());
    }

    /**
     * Gets all valid sources.
     *
     * @returns {Array} List of valid sources.
     * @private
     */
    _getAllValidSources() {
        return Object.keys(this.services);
    }

    /**
     * Gets the appropriate service for a given source.
     *
     * @param {string} source - Source to get service for.
     * @returns {Object} The corresponding service.
     * @private
     */
    _getSourceService(source) {
        return this.services[source.toUpperCase()];
    }
}

/**
 * Service for transforming simple mobile metadata to full mobile metadata.
 */
class TargetMobileComponentService {
    constructor() {
        this.services = {
            RECORD_SCREEN: new FullTransformerRecordScreenService(),
            // TODO: Placeholder for future support
            // INPUT_FORM_SCREEN: new FullTransformerInputFormScreenService(),
            // LIST_SCREEN: new FullTransformerListScreenService(),
        }
        this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
    }

    /**
     * Transforms simple mobile metadata to full mobile metadata.
     *
     * @param {Object} simpleMobileMetadata - Simple mobile metadata.
     * @returns {Object} Full mobile metadata.
     */
    transformToFullMobileMetadata(simpleMobileMetadata) {
        const componentType = simpleMobileMetadata.componentType.toUpperCase();
        this._validateComponentType(componentType);
        return this.services[componentType].transform(simpleMobileMetadata);
    }

    /**
     * Gets the regenerated card records.
     *
     * @param {Object} log - The LLM conversation history provided by the MobileComponentGenAiComposer.
     * @returns {Object} Card records.
     */
    getCardRegeneration(fullMobileMetadata) {
        const card = fullMobileMetadata.components.find((component) => component.rootTable === 'sys_sg_view_config');
        const { log } = card.data.sysSgViewConfig;
        return this.services['RECORD_SCREEN'].regenerateCard(log);
    }

    /**
     * Checks if the component type is valid.
     *
     * @param {string} componentType - Component type to check.
     * @returns {boolean} Whether the component type is valid.
     * @private
     */
    _isValidMobileComponent(componentType) {
        return Object.keys(this.services).includes(componentType.toUpperCase());
    }


    /**
     * Gets all valid mobile components.
     *
     * @returns {Array} List of valid mobile components.
     * @private
     */
    _getValidMobileComponents() {
        return Object.keys(this.services);
    }

    /**
     * Validates the component type and throws an error if invalid.
     *
     * @param {string} componentType - Component type to validate.
     * @throws {MABError} Throws an error if the component type is missing or invalid
     *
     * @private
     */
    _validateComponentType(componentType) {
        if (!componentType) {
            this.customErrorHandler.throwBadRequestError(
                'MISSING_COMPONENT_TYPE',
                "The field 'componentType' is a required field. Please provide a valid component type."
            );
        }

        if (!this._isValidMobileComponent(componentType)) {
            this.customErrorHandler.throwBadRequestError(
                'INVALID_COMPONENT_TYPE',
                `The component type '${componentType}' is not valid. Valid component types are: ${this.services._getValidMobileComponents().join(', ')}`
            );
        }
    }
}


module.exports = WebToMobileComponentService;
