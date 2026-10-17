/**
 * @class EFErrorRefiner
 * @classdesc Orchestrates error refinement: enrichment → classification → update
 * Coordinates the refinement workflow and updates the error record
 */
class EFErrorRefiner {
    /**
     * Refines an error by enriching context, classifying, and updating the record
     * @param {GlideRecord|string} errorGrOrId - The error GlideRecord or sys_id to refine
     * @param {Object} [options={}] - Refinement options
     * @param {Array<string>} [options.categories] - Optional array of category sys_ids to pre-filter classifiers (inclusion)
     * @param {Array<string>} [options.excludeCategories] - Optional array of category sys_ids to exclude from classifier
     *   loading. Expanded with child categories using the configured depth.
     * @returns {Object} JSON response object with refinement result
     */
    static refine(errorGrOrId, options = {}) {
        const rateLimitResponse = EFErrorUtil.checkRateLimit();
        if (rateLimitResponse) return rateLimitResponse;

        let errorGr;

        if (typeof errorGrOrId === 'string') {
            errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
            if (!errorGr.get(errorGrOrId)) {
                EFErrorRefiner.logger.error(`Error record not found: ${errorGrOrId}`);
                return EFResponse.failure('Error record not found').toJSON();
            }
        } else if (errorGrOrId && typeof errorGrOrId.getTableName === 'function') {
            errorGr = errorGrOrId;
            if (errorGr.getTableName() !== EFConstants.TABLES.ERROR) {
                EFErrorRefiner.logger.error('Invalid error record provided to refine()');
                return EFResponse.failure('Invalid error record').toJSON();
            }
        } else {
            EFErrorRefiner.logger.error('Invalid parameter: must be GlideRecord or sys_id');
            return EFResponse.failure('Invalid parameter: must be GlideRecord or sys_id').toJSON();
        }

        const errorSysId = errorGr.getUniqueValue();
        const sourceApplication = errorGr.getValue(EFConstants.ERROR_FIELDS.APPLICATION);

        if(!EFErrorRefiner.hasRefinementClassifiers(sourceApplication)) {
            EFErrorRefiner.logger.error(`No refinement classifiers for application ${sourceApplication}`);
            try {
                EFErrorRefiner._updateRefinementTimestamp(errorGr);
            } catch (updateErr) {
                EFErrorRefiner.logger.error(`Failed to update timestamp: ${updateErr.message}`);
                return EFResponse.failure('Failed to update refinement timestamp').toJSON();
            }
            return EFResponse.success({
                errorSysId: errorSysId,
                refinedErrorCode: errorGr.getValue(EFConstants.ERROR_FIELDS.ERROR_CODE),
                hasRefinedContext: false,
                classificationResult: null
            }).withMessage('No refinement classifier found').toJSON();
        }
        EFErrorRefiner.logger.debug(`Starting refinement for error ${errorSysId}`);

        try {
            // Step 1: Execute enrichment
            let refinedContext = null;
            try {
                refinedContext = EFEnrichmentEngine.execute(errorGr);
            } catch (enrichmentErr) {
                EFErrorRefiner.logger.error(`Failed to execute enrichment for ${errorSysId}: ${enrichmentErr.message}`);
                try {
                    EFErrorRefiner._updateRefinementTimestamp(errorGr);
                } catch (updateErr) {
                    EFErrorRefiner.logger.error(`Failed to update timestamp after enrichment failure: ${updateErr.message}`);
                }
                return EFResponse.failure('Enrichment failed: ' + enrichmentErr.message).toJSON();
            }

            // If no enrichers found, skip classification and just update timestamp
            if (!refinedContext) {
                EFErrorRefiner.logger.debug(`No enrichers found for error ${errorSysId}, skipping classification`);
                try {
                    EFErrorRefiner._updateRefinementTimestamp(errorGr);
                } catch (updateErr) {
                    EFErrorRefiner.logger.error(`Failed to update timestamp: ${updateErr.message}`);
                    return EFResponse.failure('Failed to update refinement timestamp').toJSON();
                }
                
                return EFResponse.success({
                    errorSysId: errorSysId,
                    refinedErrorCode: errorGr.getValue(EFConstants.ERROR_FIELDS.ERROR_CODE),
                    hasRefinedContext: false,
                    classificationResult: null
                }).withMessage('Refinement completed - no enrichers found').toJSON();
            }

            let refinedErrorCode = errorGr.getValue(EFConstants.ERROR_FIELDS.ERROR_CODE);
            let classificationResult = null;

            // Step 2: Classify the error (only if we have enriched context)
            if (refinedContext && typeof refinedContext === 'object') {
                try {
                    let errorPrefix = null;

                    if (!sourceApplication) {
                        const errorCodeDisplay = errorGr.getDisplayValue(EFConstants.ERROR_FIELDS.ERROR_CODE);
                        errorPrefix = EFErrorUtil.getErrorPrefix(errorCodeDisplay);
                    }

                    if (sourceApplication || errorPrefix) {
                        // Inject error record fields under _error so refinement classification rules can match on them
                        // (e.g. path search: "_error.message", "_error.state"). Transient — stripped after classify.
                        refinedContext._error = EFErrorRefiner._buildErrorFields(errorGr);

                        const mergedOptions = Object.assign({}, options, { isRefinement: true, sourceApplication: sourceApplication });
                        const classifyResponse = EFClassificationEngine.classify(refinedContext, errorPrefix, mergedOptions);
                        if (classifyResponse.success) {
                            refinedErrorCode = classifyResponse.data.errorCodeSysId;
                            classificationResult = classifyResponse.data;
                        }
                    } else {
                        EFErrorRefiner.logger.warn('Could not resolve source application or error prefix for classification');
                    }
                } catch (classifyErr) {
                    EFErrorRefiner.logger.error(`Classification failed for ${errorSysId}: ${classifyErr.message}`);
                } finally {
                    // Strip _error — transient, injected only for classification, must not persist
                    delete refinedContext._error;
                }
            }

            // Step 3: Update the error record
            EFErrorRefiner._updateError(errorGr, refinedContext, refinedErrorCode);

            EFErrorRefiner.logger.debug(`Successfully refined error ${errorSysId}`);
            return EFResponse.success({
                errorSysId: errorSysId,
                refinedErrorCode: refinedErrorCode,
                hasRefinedContext: refinedContext !== null,
                classificationResult: classificationResult
            }).withMessage('Refinement successful').toJSON();

        } catch (e) {
            EFErrorRefiner.logger.error(`Refinement process crashed for error ${errorSysId}: ${e.message}`, e);
            return EFResponse.failure('Refinement failed: ' + e.message).toJSON();
        }
    }

    /**
     * Updates the error record with refined data
     * @param {GlideRecord} errorGr - The error GlideRecord
     * @param {Object|null} refinedContext - The refined context object
     * @param {string} refinedErrorCode - The refined error code sys_id
     * @throws {Error} If update fails
     * @private
     */
    static _updateError(errorGr, refinedContext, refinedErrorCode) {
        const errorSysId = errorGr.getUniqueValue();
        const originalErrorCode = errorGr.getValue(EFConstants.ERROR_FIELDS.ERROR_CODE);

        // Read before overwriting — used to detect whether the refined code actually changed
        const previousRefinedCode = errorGr.getValue(EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE);

        errorGr.setValue(EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE, refinedErrorCode);
        errorGr.setValue(EFConstants.ERROR_FIELDS.REFINED_ON, new GlideDateTime().getValue());

        // Update context with refined context if available
        if (refinedContext && Object.keys(refinedContext).length > 0) {
            const refinedContextJson = JSON.stringify(refinedContext);

            if (refinedContextJson.length > EFConstants.FIELD_LIMITS.CONTEXT_MAX_LENGTH) {
                EFErrorRefiner.logger.error(`Refined context too large (${refinedContextJson.length} chars), exceeds ${EFConstants.FIELD_LIMITS.CONTEXT_MAX_LENGTH} character limit. Cannot save refined context.`);
            } else {
                errorGr.setValue(EFConstants.ERROR_FIELDS.CONTEXT, refinedContextJson);
            }
        }

        // Compare against previousRefinedCode when available; fall back to originalErrorCode
        // on first refinement. This ensures re-refinement back to the original code is handled
        // correctly (previousRefinedCode !== originalErrorCode even though refinedErrorCode === originalErrorCode).
        const refinedCodeChanged = previousRefinedCode ? (refinedErrorCode !== previousRefinedCode) : (refinedErrorCode !== originalErrorCode);

        const refinedCodeGr = new GlideRecord(EFConstants.TABLES.ERROR_CODE);
        if (refinedCodeGr.get('sys_id', refinedErrorCode)) {
            const refinedCategory = refinedCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.CATEGORY);
            errorGr.setValue(EFConstants.ERROR_FIELDS.CATEGORY, refinedCategory);

            if (refinedCodeChanged) {
                const refinedSuppressRaw = refinedCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.SUPPRESS);
                // getValue() returns 'true'/'false' in production and '1'/'0' in the grit test framework
                const refinedIsSuppress = String(refinedSuppressRaw) === 'true' || String(refinedSuppressRaw) === '1';
                EFErrorRefiner._applySuppressionState(errorGr, refinedIsSuppress);
            }
        }

        if (gs.nil(errorGr.update())) {
            const errorMsg = `Failed to update error ${errorSysId}: ${errorGr.getLastErrorMessage()}`;
            EFErrorRefiner.logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        EFErrorRefiner.logger.debug(`Successfully updated error ${errorSysId}`);
    }

    /**
     * Applies suppress state changes to an error record when it is reclassified to a
     * different error code. Mirrors the suppress logic in EFErrorRepository._handleErrorStateTransition:
     * - Reclassified to suppressed code: transitions state to IGNORED (unless already CLOSED/IGNORED)
     * - Reclassified to non-suppressed code: reopens error if it was CLOSED/IGNORED
     * @param {GlideRecord} errorGr - The error GlideRecord to update
     * @param {boolean} refinedCodeSuppressed - Whether the refined error code is marked as suppressed
     * @private
     */
    static _applySuppressionState(errorGr, refinedCodeSuppressed) {
        const currentSuppressRaw = errorGr.getValue(EFConstants.ERROR_FIELDS.SUPPRESS);
        // getValue() returns 'true'/'false' in production and '1'/'0' in the grit test framework
        const currentIsSuppress = String(currentSuppressRaw) === 'true' || String(currentSuppressRaw) === '1';

        if (refinedCodeSuppressed === currentIsSuppress) {
            return;
        }

        errorGr.setValue(EFConstants.ERROR_FIELDS.SUPPRESS, refinedCodeSuppressed);

        const currentState = errorGr.getValue(EFConstants.ERROR_FIELDS.STATE);
        const errorSysId = errorGr.getUniqueValue();

        if (refinedCodeSuppressed) {
            // Reclassified to a suppressed code: set IGNORED unless already CLOSED/IGNORED
            if (currentState !== EFConstants.ERROR_STATES.CLOSED && currentState !== EFConstants.ERROR_STATES.IGNORED) {
                errorGr.setValue(EFConstants.ERROR_FIELDS.STATE, EFConstants.ERROR_STATES.IGNORED);
                EFErrorRefiner.logger.debug(`Error ${errorSysId} suppressed via refinement: ${currentState} -> IGNORED`);
            }
        } else {
            // Reclassified to a non-suppressed code: reopen if currently CLOSED/IGNORED
            if (currentState === EFConstants.ERROR_STATES.CLOSED || currentState === EFConstants.ERROR_STATES.IGNORED) {
                errorGr.setValue(EFConstants.ERROR_FIELDS.STATE, EFConstants.ERROR_STATES.OPEN);
                const currentCount = parseInt(errorGr.getValue(EFConstants.ERROR_FIELDS.REOPENED_COUNT) || '0', 10);
                errorGr.setValue(EFConstants.ERROR_FIELDS.REOPENED_COUNT, currentCount + 1);
                EFErrorRefiner.logger.debug(`Error ${errorSysId} unsuppressed via refinement: ${currentState} -> OPEN`);
            }
        }
    }

    /**
     * Builds a snapshot of error record field values for transient injection into contextObject during classification.
     * Available to classifiers as contextObject._error.<field> (e.g. "_error.message", "_error.state").
     * Stripped from refinedContext before persistence — never stored.
     * @param {GlideRecord} errorGr - The error GlideRecord
     * @returns {Object} Map of error field names to their current values
     * @private
     */
    static _buildErrorFields(errorGr) {
        const F = EFConstants.ERROR_FIELDS;
        return {
            source_application: errorGr.getDisplayValue(F.APPLICATION),
            error_category: errorGr.getDisplayValue(F.CATEGORY),
            error_code: errorGr.getDisplayValue(F.ERROR_CODE),
            key: errorGr.getValue(F.KEY),
            error_source_table: errorGr.getValue(F.ERROR_SOURCE_TABLE),
            error_source: errorGr.getValue(F.ERROR_SOURCE),
            message: errorGr.getValue(F.MESSAGE),
            state: errorGr.getValue(F.STATE),
            reopened_count: errorGr.getValue(F.REOPENED_COUNT),
            suppress: errorGr.getValue(F.SUPPRESS),
            last_occurrence: errorGr.getValue(F.LAST_OCCURRENCE),
            consecutive_count: errorGr.getValue(F.CONSECUTIVE_COUNT)
        };
    }

    /**
     * Updates only the refined_on timestamp and refined_error_code (when no enrichers run or context building failed)
     * @param {GlideRecord} errorGr - The error GlideRecord
     * @throws {Error} If update fails
     * @private
     */
    static _updateRefinementTimestamp(errorGr) {
        const errorSysId = errorGr.getUniqueValue();

        const originalErrorCode = errorGr.getValue(EFConstants.ERROR_FIELDS.ERROR_CODE);
        errorGr.setValue(EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE, originalErrorCode);
        errorGr.setValue(EFConstants.ERROR_FIELDS.REFINED_ON, new GlideDateTime());

        if (gs.nil(errorGr.update())) {
            const errorMsg = `Failed to update timestamp for error ${errorSysId}`;
            EFErrorRefiner.logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        EFErrorRefiner.logger.debug(`Updated refinement timestamp for error ${errorSysId}`);
    }

    /**
     * Returns true/false based on the Classifiers present in Error Classifier for Application
     * @param {Application} sourceApplication
     */
    static hasRefinementClassifiers(sourceApplication) {
        const errorClassifier = new GlideRecord(EFConstants.TABLES.CLASSIFIER);
        errorClassifier.addQuery(EFConstants.CLASSIFIER_FIELDS.SOURCE_APPLICATION,sourceApplication);
        errorClassifier.addQuery(EFConstants.CLASSIFIER_FIELDS.ACTIVE, true);
        errorClassifier.addQuery(EFConstants.CLASSIFIER_FIELDS.REFINEMENT,true);
        errorClassifier.setLimit(1);
        errorClassifier.query();
        return errorClassifier.hasNext();
    }
}

// Initialize logger for the class
EFErrorRefiner.logger = EFLogger.forClass('EFErrorRefiner');
