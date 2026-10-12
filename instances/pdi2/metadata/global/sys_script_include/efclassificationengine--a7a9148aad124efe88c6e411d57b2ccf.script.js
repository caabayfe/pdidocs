/**
 * @class EFClassificationEngine
 * @classdesc Classification engine that evaluates contextObject against classifiers
 * to determine the appropriate error code.
 */
class EFClassificationEngine {

	/**
	 * Classifies a contextObject and returns the matching error code
	 * @param {Object} contextObject - The object containing error context to classify
	 * @param {string} [errorPrefix] - Error prefix to resolve the source application (e.g., 'SN-DISC').
	 *   Required unless options.sourceApplication is provided.
	 * @param {Object} [options={}] - Classification options
	 * @param {boolean} [options.isRefinement=false] - False = initial classification, true = refinement pass
	 * @param {Array<string>} [options.categories] - Optional array of category sys_ids to pre-filter classifiers (inclusion)
	 * @param {Array<string>} [options.excludeCategories] - Optional array of category sys_ids to exclude from classifier loading.
	 *   Expanded to include child categories using the same depth logic as categories. Useful for excluding
	 *   large category trees (e.g., Classification, Pattern) when they are not applicable, reducing the
	 *   number of classifiers evaluated.
	 * @param {string} [options.sourceApplication] - Source application sys_id. Bypasses the
	 *   errorPrefix lookup. Either errorPrefix or sourceApplication must be provided.
	 * @returns {Object} JSON response object with classification result
	 */
	static classify(contextObject, errorPrefix, options = {}) {
		const rateLimitResponse = EFErrorUtil.checkRateLimit();
		if (rateLimitResponse) return rateLimitResponse;

		const {
			isRefinement = false, categories, excludeCategories, sourceApplication
		} = options;
		try {
			if (!contextObject || typeof contextObject !== 'object')
				return EFResponse.failure('Invalid contextObject provided').toJSON();

			const hasValidPrefix = errorPrefix && typeof errorPrefix === 'string' && errorPrefix.trim() !== '';
			if (!hasValidPrefix && !sourceApplication)
				return EFResponse.failure('Either errorPrefix or options.sourceApplication is required').toJSON();

			let sourceAppSysId = sourceApplication;
			if (!sourceAppSysId) {
				const sourceAppGr = EFErrorUtil.getSourceApplicationByPrefix(errorPrefix);
				sourceAppSysId = sourceAppGr ? sourceAppGr.getUniqueValue() : null;
			}
			if (!sourceAppSysId)
				return EFResponse.failure('Source application not found for prefix: ' + errorPrefix).toJSON();

			const {
				classifiers,
				criteriaClassifierSysIds
			} = EFClassificationEngine._loadClassifiers(sourceAppSysId, isRefinement, categories, excludeCategories);

			if (classifiers.length === 0)
				return EFResponse.failure('No active classifiers found').toJSON();

			const criteriaRulesMap = EFClassificationEngine._loadAllCriteriaRules(criteriaClassifierSysIds);

			for (let i = 0; i < classifiers.length; i++) {
				const classifier = classifiers[i];
				const classified = EFClassificationEngine._evaluateClassifier(classifier, contextObject, criteriaRulesMap);

				if (classified) {
					const errorCodeInfo = EFClassificationEngine._getErrorCodeInfo(classifier.targetErrorCode);
					return EFResponse.success({
						errorCode: errorCodeInfo.errorCode,
						errorCodeSysId: errorCodeInfo.sysId,
						classifierName: classifier.name,
						classifierSysId: classifier.sysId,
						refinement: classifier.refinement
					}).withMessage('Classification successful').toJSON();
				}
			}

			return EFResponse.failure('No matching classifier found').toJSON();
		} catch (e) {
			EFClassificationEngine.logger.error('Classification failed: ' + e.message);
			return EFResponse.failure('Classification error: ' + e.message).toJSON();
		}
	}

	/**
	 * Loads active classifiers for a given source application, ordered by priority
	 * @param {string} sourceAppSysId - Source application sys_id
	 * @param {boolean} [isRefinement=false] - Filter by refinement flag
	 * @param {Array<string>} [categories] - Optional array of category sys_ids to include (expanded with children)
	 * @param {Array<string>} [excludeCategories] - Optional array of category sys_ids to exclude (expanded with children)
	 * @returns {Object} { classifiers: Array<Object>, criteriaClassifierSysIds: Array<string> }
	 * @private
	 */
	static _loadClassifiers(sourceAppSysId, isRefinement, categories, excludeCategories) {
		const classifiers = [];
		const criteriaClassifierSysIds = [];
		const classifierGr = new GlideRecord(EFConstants.TABLES.CLASSIFIER);
		classifierGr.addQuery(EFConstants.CLASSIFIER_FIELDS.ACTIVE, true);
		classifierGr.addQuery(EFConstants.CLASSIFIER_FIELDS.SOURCE_APPLICATION, sourceAppSysId);
		classifierGr.addQuery(EFConstants.CLASSIFIER_FIELDS.REFINEMENT, isRefinement);
		const maxDepth = EFClassificationEngine._getCategoryMaxDepth(sourceAppSysId);
		if (Array.isArray(categories) && categories.length > 0) {
			const expandedCategories = EFClassificationEngine._expandCategoriesWithChildren(categories, maxDepth);
			classifierGr.addQuery(
				EFConstants.CLASSIFIER_FIELDS.TARGET_ERROR_CODE + '.' + EFConstants.ERROR_CODE_FIELDS.CATEGORY,
				'IN',
				expandedCategories
			);
		}
		if (Array.isArray(excludeCategories) && excludeCategories.length > 0) {
			const expandedExcludeCategories = EFClassificationEngine._expandCategoriesWithChildren(excludeCategories, maxDepth);
			classifierGr.addQuery(
				EFConstants.CLASSIFIER_FIELDS.TARGET_ERROR_CODE + '.' + EFConstants.ERROR_CODE_FIELDS.CATEGORY,
				'NOT IN',
				expandedExcludeCategories
			);
		}
		classifierGr.orderBy(EFConstants.CLASSIFIER_FIELDS.ORDER);
		classifierGr.query();

		while (classifierGr.next()) {
			const classifierType = classifierGr.getValue(EFConstants.CLASSIFIER_FIELDS.CLASSIFIER_TYPE);
			const sysId = classifierGr.getUniqueValue();

			classifiers.push({
				sysId: sysId,
				name: classifierGr.getValue(EFConstants.CLASSIFIER_FIELDS.NAME),
				classifierType: classifierType,
				matchCriteria: classifierGr.getValue(EFConstants.CLASSIFIER_FIELDS.MATCH_CRITERIA),
				targetErrorCode: classifierGr.getValue(EFConstants.CLASSIFIER_FIELDS.TARGET_ERROR_CODE),
				refinement: classifierGr.getValue(EFConstants.CLASSIFIER_FIELDS.REFINEMENT) == true
			});

			if (classifierType === EFConstants.CLASSIFIER_TYPES.CRITERIA) {
				criteriaClassifierSysIds.push(sysId);
			}
		}

		EFClassificationEngine.logger.debug('Loaded ' + classifiers.length + ' classifiers');
		return {
			classifiers,
			criteriaClassifierSysIds
		};
	}

	/**
	 * Bulk-loads classification criteria rules for multiple classifiers
	 * @param {Array<string>} classifierSysIds - Array of classifier sys_ids
	 * @returns {Object} Map of classifier sys_id to array of rule objects
	 * @private
	 */
	static _loadAllCriteriaRules(classifierSysIds) {
		if (!classifierSysIds || classifierSysIds.length === 0)
			return {};

		const criteriaRulesMap = {};
		const ruleGr = new GlideRecord(EFConstants.TABLES.CLASSIFICATION_RULE);

		ruleGr.addQuery(EFConstants.CLASSIFICATION_RULE_FIELDS.CLASSIFIER, 'IN', classifierSysIds);
		ruleGr.query();

		while (ruleGr.next()) {
			const classifierSysId = ruleGr.getValue(EFConstants.CLASSIFICATION_RULE_FIELDS.CLASSIFIER);

			if (!criteriaRulesMap[classifierSysId])
				criteriaRulesMap[classifierSysId] = [];

			criteriaRulesMap[classifierSysId].push({
				field: ruleGr.getValue(EFConstants.CLASSIFICATION_RULE_FIELDS.FIELD),
				search_type: ruleGr.getValue(EFConstants.CLASSIFICATION_RULE_FIELDS.SEARCH_TYPE),
				operator: ruleGr.getValue(EFConstants.CLASSIFICATION_RULE_FIELDS.OPERATOR),
				value: ruleGr.getValue(EFConstants.CLASSIFICATION_RULE_FIELDS.VALUE),
				table_name: ruleGr.getValue(EFConstants.CLASSIFICATION_RULE_FIELDS.TABLE_NAME),
				condition: ruleGr.getValue(EFConstants.CLASSIFICATION_RULE_FIELDS.CONDITION)
			});
		}

		return criteriaRulesMap;
	}

	/**
	 * Evaluates a classifier against the contextObject
	 * @param {Object} classifier - Classifier object
	 * @param {Object} contextObject - Context to evaluate
	 * @param {Object} criteriaRulesMap - Map of classifier sys_id to array of rule objects
	 * @returns {boolean} True if classifier matches
	 * @private
	 */
	static _evaluateClassifier(classifier, contextObject, criteriaRulesMap) {
		const classifierType = classifier.classifierType;

		if (classifierType === EFConstants.CLASSIFIER_TYPES.CRITERIA)
			return EFClassificationEngine._evaluateCriteriaBased(classifier, contextObject, criteriaRulesMap);

		if (classifierType === EFConstants.CLASSIFIER_TYPES.SCRIPT)
			return EFClassificationEngine._evaluateScriptBased(classifier, contextObject);

		EFClassificationEngine.logger.warn('Unknown classifier type: ' + classifierType);
		return false;
	}

	/**
	 * Evaluates criteria-based classifier using EFCriteriaEvaluator
	 * @param {Object} classifier - Classifier with matchCriteria ('all' or 'any')
	 * @param {Object} contextObject - Context to evaluate
	 * @param {Object} criteriaRulesMap - Map of classifier sys_id to array of rule objects
	 * @returns {boolean} True if criteria match
	 * @private
	 */
	static _evaluateCriteriaBased(classifier, contextObject, criteriaRulesMap) {
		const criteriaRules = criteriaRulesMap[classifier.sysId] || [];

		if (criteriaRules.length === 0) {
			EFClassificationEngine.logger.debug('No criteria rules for classifier: ' + classifier.name);
			return false;
		}

		return EFCriteriaEvaluator.evaluate(criteriaRules, contextObject, classifier.matchCriteria);
	}

	/**
	 * Evaluates script-based classifier using GlideScopedEvaluator
	 * Script has access to contextObject and should set answer=true/false
	 * @param {Object} classifier - Classifier object
	 * @param {Object} contextObject - Context available as 'contextObject' variable
	 * @returns {boolean} True if script returns/sets true
	 * @private
	 */
	static _evaluateScriptBased(classifier, contextObject) {
		try {
			const classifierGr = EFClassificationEngine._getClassifierGlideRecord(classifier.sysId);
			const script = classifierGr.getValue(EFConstants.CLASSIFIER_FIELDS.CLASSIFICATION_SCRIPT);

			if (!script || script.trim() === '') {
				EFClassificationEngine.logger.warn('No script defined for script-based classifier: ' + classifier.name);
				return false;
			}

			const evaluator = new GlideScopedEvaluator();
			evaluator.putVariable('contextObject', contextObject);
			evaluator.putVariable('answer', false);

			const result = evaluator.evaluateScript(classifierGr, EFConstants.CLASSIFIER_FIELDS.CLASSIFICATION_SCRIPT);

			if (typeof result === 'boolean')
				return result;

			const answer = evaluator.getVariable('answer');
			return answer === true || answer === 'true';
		} catch (e) {
			EFClassificationEngine.logger.error('Script evaluation failed for classifier ' + classifier.name + ': ' + e.message);
			return false;
		}
	}

	/**
	 * Gets classifier GlideRecord for script evaluation
	 * @param {string} classifierSysId - Classifier sys_id
	 * @returns {GlideRecord} Classifier record
	 * @private
	 */
	static _getClassifierGlideRecord(classifierSysId) {
		const classifierGr = new GlideRecord(EFConstants.TABLES.CLASSIFIER);
		classifierGr.get(classifierSysId);
		return classifierGr;
	}

	/**
	 * Gets error code information
	 * @param {string} errorCodeSysId - Error code sys_id
	 * @returns {Object} {errorCode, sysId}
	 * @private
	 */
	static _getErrorCodeInfo(errorCodeSysId) {
		const errorCodeGr = new GlideRecord(EFConstants.TABLES.ERROR_CODE);
		if (errorCodeGr.get(errorCodeSysId)) {
			return {
				errorCode: errorCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.CODE),
				sysId: errorCodeSysId
			};
		}

		return {
			errorCode: null,
			sysId: errorCodeSysId
		};
	}

	/**
	 * Gets the maximum category hierarchy depth from config
	 * @param {string} sourceAppSysId - Source application sys_id
	 * @returns {number} Maximum depth for category expansion (default: 1)
	 * @private
	 */
	static _getCategoryMaxDepth(sourceAppSysId) {
		try {
			const classification = EFErrorUtil.getConfigProp(sourceAppSysId, EFConstants.CONFIG_PROPERTIES.CLASSIFICATION);
			const configValue = classification ? classification.categoryMaxDepth : undefined;
			if (configValue === null || configValue === undefined || configValue === '')
				return 1;
			const depth = parseInt(configValue, 10);
			return isNaN(depth) ? 1 : depth;
		} catch (e) {
			return 1;
		}
	}

	/**
	 * Expands category list to include children up to maxDepth
	 * @param {Array<string>} categories - Array of category sys_ids
	 * @param {number} maxDepth - Maximum depth to traverse
	 * @returns {Array<string>} Expanded array including all descendants
	 * @private
	 */
	static _expandCategoriesWithChildren(categories, maxDepth) {
		if (!maxDepth || maxDepth <= 0) return categories;

		let allCategories = categories.slice();
		let currentLevel = categories;

		for (let depth = 0; depth < maxDepth; depth++) {
			if (currentLevel.length === 0) break;

			const categoryGr = new GlideRecord(EFConstants.TABLES.ERROR_CATEGORY);
			categoryGr.addNotNullQuery(EFConstants.ERROR_CATEGORY_FIELDS.PARENT);
			categoryGr.addQuery(EFConstants.ERROR_CATEGORY_FIELDS.PARENT, 'IN', currentLevel);
			categoryGr.query();

			let nextLevel = [];
			while (categoryGr.next()) {
				const childSysId = categoryGr.getUniqueValue();
				if (allCategories.indexOf(childSysId) === -1) {
					allCategories.push(childSysId);
					nextLevel.push(childSysId);
				}
			}
			currentLevel = nextLevel;
		}

		return allCategories;
	}

}

EFClassificationEngine.logger = EFLogger.forClass('EFClassificationEngine');
