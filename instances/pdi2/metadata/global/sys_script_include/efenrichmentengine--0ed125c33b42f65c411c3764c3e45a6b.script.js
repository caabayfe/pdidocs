/**
 * @class EFEnrichmentEngine
 * @classdesc Builds refined context by executing enrichment scripts
 * Returns enriched data without modifying records (pure function)
 */
class EFEnrichmentEngine {
    /**
     * Executes enrichment for an error by running enrichment scripts
     * @param {GlideRecord} errorGr - The error GlideRecord (read-only)
     * @returns {Object|null} The refined context object, or null if no enrichers found
     * @throws {Error} If error record is invalid or refined context exceeds size limit
     */
    static execute(errorGr) {
        if (!errorGr || !errorGr.isValidRecord()) {
            EFEnrichmentEngine.logger.error('Invalid error record provided to execute()');
            throw new Error('Invalid error record');
        }

        const errorSysId = errorGr.getUniqueValue();
        EFEnrichmentEngine.logger.debug(`Executing enrichment for error ${errorSysId}`);

        const sourceApplication = errorGr.getValue(EFConstants.ERROR_FIELDS.APPLICATION);
        const errorCode = errorGr.getValue(EFConstants.ERROR_FIELDS.ERROR_CODE);

        EFEnrichmentEngine.logger.debug(`Filtering enrichers for application=${sourceApplication}, code=${errorCode}`);

        const enrichers = EFEnrichmentEngine._getApplicableEnrichers(sourceApplication, errorCode);

        if (enrichers.length === 0) {
            EFEnrichmentEngine.logger.debug(`No enrichers found for error ${errorSysId}`);
            return null;
        }

        EFEnrichmentEngine.logger.debug(`Found ${enrichers.length} enricher(s) for error ${errorSysId}`);

        let contextObject = {};
        const existingContext = errorGr.getValue(EFConstants.ERROR_FIELDS.CONTEXT);
        if (!gs.nil(existingContext)) {
            try {
                contextObject = JSON.parse(existingContext);
            } catch (e) {
                // Context could indeed be empty, so just a warning
                // The errorGr is also passed to the enricher, so this could be enough for retrieving more relevant info
                EFEnrichmentEngine.logger.warn(`Failed to parse existing context for error ${errorSysId}: ${e.message}`);
                contextObject = {};
            }
        }

        const enrichedData = EFEnrichmentEngine._executeEnrichers(enrichers, errorGr, contextObject);

        const refinedContext = EFEnrichmentEngine._mergeContexts(contextObject, enrichedData);

        // Check size limit (8000 characters)
        const refinedContextJson = JSON.stringify(refinedContext);
        if (refinedContextJson.length > 8000) {
            const errorMsg = `Refined context too large (${refinedContextJson.length} chars), exceeds 8000 character limit`;
            EFEnrichmentEngine.logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        return refinedContext;
    }

    /**
     * Retrieves applicable enrichers based on source application, and error code
     * @param {string} sourceApplication - Source application sys_id
     * @param {string} errorCode - Error code sys_id
     * @returns {Array} Array of enricher GlideRecords
     * @private
     */
    static _getApplicableEnrichers(sourceApplication, errorCode) {
        const enrichers = [];

        // TODO:
        // Once moved to global scope may look into setEffectiveDomain.
        // Originally had domain added to the query, but may be best to change domain on caller at job level
        // So not doing anything with domains here, to be looked into stry62493874.

        const enricherGr = new GlideRecord(EFConstants.TABLES.ERROR_ENRICHER);
        enricherGr.addQuery(EFConstants.ERROR_ENRICHER_FIELDS.ACTIVE, true);
        enricherGr.addQuery(EFConstants.ERROR_ENRICHER_FIELDS.SOURCE_APPLICATION, sourceApplication);

        const codeCondition = enricherGr.addQuery(EFConstants.ERROR_ENRICHER_FIELDS.ERROR_CODES, 'IN', errorCode);
        codeCondition.addOrCondition(EFConstants.ERROR_ENRICHER_FIELDS.ERROR_CODES, 'NULL');

        enricherGr.orderBy(EFConstants.ERROR_ENRICHER_FIELDS.ORDER);
        enricherGr.query();

        while (enricherGr.next()) {
            // Cache GlideRecord to avoid redundant queries and re-instantiation.
            // Trades memory for performance; enricher count per error is low enough to be safe.
            const enricherRecord = new GlideRecord(EFConstants.TABLES.ERROR_ENRICHER);
            if (enricherRecord.get(enricherGr.getUniqueValue()))
                enrichers.push(enricherRecord);
        }

        return enrichers;
    }

    /**
     * Executes each enricher script and collects the results
     * Each enricher operates independently on the original context
     * @param {Array} enrichers - Array of enricher GlideRecords
     * @param {GlideRecord} errorGr - The error GlideRecord
     * @param {Object} contextObject - The current context object
     * @returns {Object} Merged enriched data from all enrichers
     * @private
     */
    static _executeEnrichers(enrichers, errorGr, contextObject) {
        const enrichedData = {};

        for (const enricherGr of enrichers) {
            const enricherName = enricherGr.getValue(EFConstants.ERROR_ENRICHER_FIELDS.NAME);
            const enricherSysId = enricherGr.getUniqueValue();

            EFEnrichmentEngine.logger.debug(`Executing enricher: ${enricherName} (${enricherSysId})`);

            try {
                // TODO: Use GlideStopWatch once moved to global scope
                const scriptResult = EFEnrichmentEngine._executeEnricherScript(enricherGr, errorGr, contextObject);

                // Merge the result into enrichedData
                if (scriptResult && typeof scriptResult === 'object') {
                    for (const key in scriptResult) {
                        if (scriptResult.hasOwnProperty(key)) {
                            enrichedData[key] = scriptResult[key];
                            EFEnrichmentEngine.logger.debug(`Enricher ${enricherName} added/updated key: ${key}`);
                        }
                    }
                } else {
                    EFEnrichmentEngine.logger.warn(`Enricher ${enricherName} did not return a valid object`);
                }

            } catch (e) {
                // Log error but continue with remaining enrichers
                EFEnrichmentEngine.logger.error(`Error executing enricher ${enricherName} (${enricherSysId}): ${e.message}`, e);
            }
        }

        return enrichedData;
    }

    /**
     * Executes an enricher script in a controlled scope
     * @param {GlideRecord} enricherGr - The enricher GlideRecord containing the script
     * @param {GlideRecord} error - The error GlideRecord
     * @param {Object} contextObject - The current context object
     * @returns {Object} The result returned by the script
     * @private
     */
    static _executeEnricherScript(enricherGr, error, contextObject) {
        try {
            let answer = {};

            const evaluator = new GlideScopedEvaluator();
            evaluator.putVariable('error', error);
            evaluator.putVariable('contextObject', contextObject);
            evaluator.putVariable('answer', answer);

            evaluator.evaluateScript(enricherGr, EFConstants.ERROR_ENRICHER_FIELDS.SCRIPT);

            return evaluator.getVariable('answer');
        } catch (e) {
            throw new Error(`Script execution failed: ${e.message}`);
        }
    }

    /**
     * Merges the enriched data into the existing context
     * Enriched values overwrite existing ones if keys conflict
     * @param {Object} originalContext - Original context object
     * @param {Object} enrichedData - Enriched data to merge
     * @returns {Object} Merged context object
     * @private
     */
    static _mergeContexts(originalContext, enrichedData) {
        const merged = {};

        // Copy original context
        for (const key in originalContext) {
            if (originalContext.hasOwnProperty(key))
                merged[key] = originalContext[key];
        }

        // Overwrite with enriched data
        for (const key in enrichedData) {
            if (enrichedData.hasOwnProperty(key)) {
                if (merged.hasOwnProperty(key))
                    EFEnrichmentEngine.logger.debug(`Overwriting existing context key: ${key}`);

                merged[key] = enrichedData[key];
            }
        }

        return merged;
    }
}

EFEnrichmentEngine.logger = EFLogger.forClass('EFEnrichmentEngine');
