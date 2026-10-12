/**
 * @class EFCriteriaEvaluator
 * @classdesc Evaluates classification criteria against contextObject.
 * Supports shallow/deep/path searches with various operators including regex (case-insensitive).
 */
class EFCriteriaEvaluator {

	/**
	 * Evaluates all criteria rules against the contextObject
	 * @param {Array} criteriaRules - Array of criteria rule objects {field, searchType, operator, value}
	 * @param {Object} contextObject - The object to evaluate against
	 * @param {string} matchCriteria - 'all' (AND) or 'any' (OR)
	 * @returns {boolean} True if criteria match according to matchCriteria logic
	 */
	static evaluate(criteriaRules, contextObject, matchCriteria) {
		if (!criteriaRules || criteriaRules.length === 0)
			return true;

		if (!contextObject || typeof contextObject !== 'object')
			return false;

		const isMatchAll = matchCriteria === EFConstants.MATCH_CRITERIA.ALL;

		for (let i = 0; i < criteriaRules.length; i++) {
			const rule = criteriaRules[i];
			const result = EFCriteriaEvaluator._evaluateSingleCriteria(rule, contextObject);

			// AND mode: fail fast on first mismatch
			if (isMatchAll && !result)
				return false;

			// OR mode: succeed fast on first match
			if (!isMatchAll && result)
				return true;
		}

		// AND mode: all rules passed → true
		// OR mode: no rules passed → false
		return isMatchAll;
	}

	/**
	 * Evaluates a single criteria rule against the contextObject
	 * @param {Object} rule - Criteria rule {field, searchType, operator, value}
	 * @param {Object} contextObject - The object to evaluate against
	 * @returns {boolean} True if the criteria matches
	 * @private
	 */
	static _evaluateSingleCriteria(rule, contextObject) {
		const field = rule[EFConstants.CLASSIFICATION_RULE_FIELDS.FIELD];
		const searchType = rule[EFConstants.CLASSIFICATION_RULE_FIELDS.SEARCH_TYPE];
		const operator = rule[EFConstants.CLASSIFICATION_RULE_FIELDS.OPERATOR];
		const value = rule[EFConstants.CLASSIFICATION_RULE_FIELDS.VALUE];
		const tableName = rule[EFConstants.CLASSIFICATION_RULE_FIELDS.TABLE_NAME];
		const condition = rule[EFConstants.CLASSIFICATION_RULE_FIELDS.CONDITION];

		const fieldValues = EFCriteriaEvaluator._getFieldValues(contextObject, field, searchType);

		if (fieldValues.length === 0)
			return EFCriteriaEvaluator._isNegativeOperator(operator);

		for (let i = 0; i < fieldValues.length; i++) {
			if (operator == EFConstants.OPERATORS.RECORD) {
				if (EFCriteriaEvaluator._applyRecordOperator(fieldValues[i], tableName, condition))
					return true;
			} else {
				if (EFCriteriaEvaluator._applyOperator(fieldValues[i], operator, value))
					return true;
			}
		}

		return false;
	}

	/**
	 * Gets field values from contextObject based on search type
	 * @param {Object} contextObject - The object to search
	 * @param {string} field - Field name or path
	 * @param {string} searchType - 'shallow', 'deep', or 'path'
	 * @returns {Array} Array of found values
	 * @private
	 */
	static _getFieldValues(contextObject, field, searchType) {
		switch (searchType) {
			case EFConstants.SEARCH_TYPES.SHALLOW:
				return EFCriteriaEvaluator._getShallowValue(contextObject, field);
			case EFConstants.SEARCH_TYPES.DEEP:
				return EFCriteriaEvaluator._getDeepValues(contextObject, field);
			case EFConstants.SEARCH_TYPES.PATH:
				return EFCriteriaEvaluator._getPathValue(contextObject, field);
			default:
				return EFCriteriaEvaluator._getShallowValue(contextObject, field);
		}
	}

	/**
	 * Gets value from top-level field only
	 * @param {Object} obj - Object to search
	 * @param {string} field - Field name
	 * @returns {Array} Array containing the value if found
	 * @private
	 */
	static _getShallowValue(obj, field) {
		if (obj === null || obj === undefined)
			return [];

		if (obj.hasOwnProperty(field)) {
			const val = obj[field];
			if (Array.isArray(val))
				return EFCriteriaEvaluator._flattenArray(val);
			return [val];
		}

		return [];
	}

	/**
	 * Gets value using exact JSON path (dot notation)
	 * @param {Object} obj - Object to search
	 * @param {string} path - Dot-delimited path (e.g., "error.details.message")
	 * @returns {Array} Array containing the value if found
	 * @private
	 */
	static _getPathValue(obj, path) {
		if (obj === null || obj === undefined || !path)
			return [];

		const parts = path.split('.');
		let current = obj;

		for (let i = 0; i < parts.length; i++) {
			if (current === null || current === undefined)
				return [];

			const part = parts[i];
			const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);

			if (arrayMatch) {
				const arrayField = arrayMatch[1];
				const index = parseInt(arrayMatch[2], 10);
				if (!current.hasOwnProperty(arrayField) || !Array.isArray(current[arrayField]))
					return [];
				current = current[arrayField][index];
			} else {
				if (!current.hasOwnProperty(part))
					return [];
				current = current[part];
			}
		}

		if (current === undefined)
			return [];

		if (Array.isArray(current))
			return EFCriteriaEvaluator._flattenArray(current);

		return [current];
	}

	/**
	 * Recursively searches for field in object tree
	 * @param {Object} obj - Object to search
	 * @param {string} field - Field name to find
	 * @returns {Array} All found values
	 * @private
	 */
	static _getDeepValues(obj, field) {
		const results = [];
		EFCriteriaEvaluator._searchDeep(obj, field, results);
		return results;
	}

	/**
	 * Recursive helper for deep search
	 * @param {*} current - Current value being searched
	 * @param {string} field - Field name to find
	 * @param {Array} results - Array to collect results
	 * @private
	 */
	static _searchDeep(current, field, results) {
		if (current === null || current === undefined)
			return;

		if (Array.isArray(current)) {
			for (let i = 0; i < current.length; i++)
				EFCriteriaEvaluator._searchDeep(current[i], field, results);
			return;
		}

		if (typeof current === 'object') {
			if (current.hasOwnProperty(field)) {
				const val = current[field];
				if (Array.isArray(val)) {
					const flattened = EFCriteriaEvaluator._flattenArray(val);
					for (let i = 0; i < flattened.length; i++)
						results.push(flattened[i]);
				} else {
					results.push(val);
				}
			}

			for (const key in current) {
				if (current.hasOwnProperty(key) && key !== field)
					EFCriteriaEvaluator._searchDeep(current[key], field, results);
			}
		}
	}

	/**
	 * Flattens an array, extracting string values from nested arrays
	 * @param {Array} arr - Array to flatten
	 * @returns {Array} Flattened array of primitive values
	 * @private
	 */
	static _flattenArray(arr) {
		const results = [];
		for (let i = 0; i < arr.length; i++) {
			const item = arr[i];
			if (Array.isArray(item)) {
				const nested = EFCriteriaEvaluator._flattenArray(item);
				for (let j = 0; j < nested.length; j++)
					results.push(nested[j]);
			} else {
				results.push(item);
			}
		}
		return results;
	}

	/**
	 * Applies an operator to compare fieldValue against targetValue
	 * @param {*} fieldValue - Value from contextObject
	 * @param {string} operator - Operator to apply
	 * @param {string} targetValue - Value to compare against
	 * @returns {boolean} Result of comparison
	 * @private
	 */
	static _applyOperator(fieldValue, operator, targetValue) {
		if (fieldValue === null || fieldValue === undefined)
			return EFCriteriaEvaluator._isNegativeOperator(operator);

		const strValue = String(fieldValue).toLowerCase();
		const strTarget = String(targetValue).toLowerCase();

		switch (operator) {
			case EFConstants.OPERATORS.IS_EMPTY:
				return strValue.trim() === '';

			case EFConstants.OPERATORS.IS_NOT_EMPTY:
				return strValue.trim() !== '';

			case EFConstants.OPERATORS.EQUALS:
				return strValue === strTarget;

			case EFConstants.OPERATORS.DOES_NOT_EQUAL:
				return strValue !== strTarget;

			case EFConstants.OPERATORS.CONTAINS:
				return strValue.indexOf(strTarget) !== -1;

			case EFConstants.OPERATORS.DOES_NOT_CONTAIN:
				return strValue.indexOf(strTarget) === -1;

			case EFConstants.OPERATORS.STARTS_WITH:
				return strValue.indexOf(strTarget) === 0;

			case EFConstants.OPERATORS.DOES_NOT_START_WITH:
				return strValue.indexOf(strTarget) !== 0;

			case EFConstants.OPERATORS.ENDS_WITH:
				return strValue.slice(-strTarget.length) === strTarget;

			case EFConstants.OPERATORS.DOES_NOT_END_WITH:
				return strValue.slice(-strTarget.length) !== strTarget;

			case EFConstants.OPERATORS.REGEX_MATCHES:
				try {
					const regex = new RegExp(strTarget, 'i');
					return regex.test(strValue);
				} catch (e) {
					EFCriteriaEvaluator.logger.error('Invalid regex pattern: ' + strTarget);
					return false;
				}

			case EFConstants.OPERATORS.REGEX_DOES_NOT_MATCH:
				try {
					const regex = new RegExp(strTarget, 'i');
					return !regex.test(strValue);
				} catch (e) {
					EFCriteriaEvaluator.logger.error('Invalid regex pattern: ' + strTarget);
					return true;
				}

			case EFConstants.OPERATORS.GREATER_THAN:
				return EFCriteriaEvaluator._compareNumeric(fieldValue, targetValue, (a, b) => a > b);

			case EFConstants.OPERATORS.LESS_THAN:
				return EFCriteriaEvaluator._compareNumeric(fieldValue, targetValue, (a, b) => a < b);

			case EFConstants.OPERATORS.GREATER_THAN_OR_EQUAL:
				return EFCriteriaEvaluator._compareNumeric(fieldValue, targetValue, (a, b) => a >= b);

			case EFConstants.OPERATORS.LESS_THAN_OR_EQUAL:
				return EFCriteriaEvaluator._compareNumeric(fieldValue, targetValue, (a, b) => a <= b);

			case EFConstants.OPERATORS.AFTER_RELATIVE_TIME:
				return EFCriteriaEvaluator._evaluateAfterRelativeTime(fieldValue, targetValue);

			case EFConstants.OPERATORS.BEFORE_RELATIVE_TIME:
				return EFCriteriaEvaluator._evaluateBeforeRelativeTime(fieldValue, targetValue);

			default:
				EFCriteriaEvaluator.logger.warn('Unknown operator: ' + operator);
				return false;
		}
	}

	/**
	 * Applies an operator to compare fieldValue against targetValue
	 * @param {*} fieldValue - Value from contextObject
	 * @param {string} tableName - Table to query
	 * @param {string} condition - Encoded query condition
	 * @returns {boolean} Result of comparison
	 * @private
	 */
	static _applyRecordOperator(fieldValue, tableName, condition) {
		if (fieldValue === null || fieldValue === undefined)
			return false;

		const strValue = String(fieldValue);
		const strTableName = String(tableName);
		const strCondition = String(condition);

		var gr = new GlideRecord(strTableName);
		gr.addQuery("sys_id", strValue);
		gr.addEncodedQuery(strCondition);
		gr.query();
		if (gr.next())
			return true;
		return false;

	}

	/**
	 * Compares two values numerically
	 * @param {*} fieldValue - Value from contextObject
	 * @param {*} targetValue - Value to compare against
	 * @param {Function} compareFn - Comparison function (a, b) => boolean
	 * @returns {boolean} Result of numeric comparison
	 * @private
	 */
	static _compareNumeric(fieldValue, targetValue, compareFn) {
		try {
			const numField = parseFloat(fieldValue);
			const numTarget = parseFloat(targetValue);

			if (isNaN(numField) || isNaN(numTarget)) {
				EFCriteriaEvaluator.logger.warn('Invalid numeric values for comparison: field=' + fieldValue + ', target=' + targetValue);
				return false;
			}

			return compareFn(numField, numTarget);
		} catch (e) {
			EFCriteriaEvaluator.logger.error('Error in numeric comparison: ' + e.message);
			return false;
		}
	}

	/**
	 * Evaluates if a date is after a relative time threshold
	 * Example: "1d" returns true if date is after (now - 1 day), i.e., within the last day
	 * @param {*} fieldValue - Date value from contextObject
	 * @param {string} targetValue - Format: 1d, 2h, 30m, 5s
	 * @returns {boolean} True if date is after the threshold (more recent)
	 * @private
	 */
	static _evaluateAfterRelativeTime(fieldValue, targetValue) {
		const threshold = EFCriteriaEvaluator._calculateRelativeThreshold(fieldValue, targetValue, 'after relative time');
		if (!threshold)
			return false;
		return threshold.fieldDate.onOrAfter(threshold.thresholdDate);
	}

	/**
	 * Evaluates if a date is before a relative time threshold
	 * Example: "1d" returns true if date is before (now - 1 day), i.e., older than 1 day
	 * @param {*} fieldValue - Date value from contextObject
	 * @param {string} targetValue - Format: 1d, 2h, 30m, 5s
	 * @returns {boolean} True if date is before the threshold (older/stale)
	 * @private
	 */
	static _evaluateBeforeRelativeTime(fieldValue, targetValue) {
		const threshold = EFCriteriaEvaluator._calculateRelativeThreshold(fieldValue, targetValue, 'before relative time');
		if (!threshold)
			return false;
		return threshold.fieldDate.before(threshold.thresholdDate);
	}

	/**
	 * Calculates threshold date from relative time format
	 * @param {*} fieldValue - Date value to parse
	 * @param {string} targetValue - Relative time format: 1d, 2h, 30m, 5s
	 * @param {string} operatorName - Operator name for error messages
	 * @returns {{fieldDate: GlideDateTime, thresholdDate: GlideDateTime}|null} Parsed dates or null if invalid
	 * @private
	 */
	static _calculateRelativeThreshold(fieldValue, targetValue, operatorName) {
		try {
			const fieldDate = EFCriteriaEvaluator._parseDate(fieldValue);
			if (!fieldDate)
				return null;

			const match = String(targetValue).match(/^@?(\d+)([dhms])$/i);
			if (!match) {
				EFCriteriaEvaluator.logger.error('Invalid relative date format: ' + targetValue + '. Expected format for "' + operatorName + '": 1d (days), 2h (hours), 30m (minutes), 5s (seconds)');
				return null;
			}

			const amount = parseInt(match[1], 10);
			const unit = match[2].toLowerCase();
			const thresholdDate = new GlideDateTime();

			switch (unit) {
				case 'd':
					thresholdDate.addDaysLocalTime(-amount);
					break;
				case 'h':
					thresholdDate.addSeconds(-amount * 3600);
					break;
				case 'm':
					thresholdDate.addSeconds(-amount * 60);
					break;
				case 's':
					thresholdDate.addSeconds(-amount);
					break;
			}

			return {
				fieldDate,
				thresholdDate
			};
		} catch (e) {
			EFCriteriaEvaluator.logger.error('Error calculating relative threshold for "' + operatorName + '": ' + e.message);
			return null;
		}
	}

	/**
	 * Parses a date value into GlideDateTime
	 * @param {*} dateValue - Date value (GlideDateTime, Date, or string)
	 * @returns {GlideDateTime|null} Parsed date or null if invalid
	 * @private
	 */
	static _parseDate(dateValue) {
		if (!dateValue)
			return null;

		if (dateValue instanceof GlideDateTime)
			return dateValue;

		if (dateValue instanceof Date) {
			const gdt = new GlideDateTime();
			gdt.setValue(dateValue.getTime());
			return gdt;
		}

		const gdt = new GlideDateTime();
		gdt.setValue(String(dateValue));
		if (gdt.getNumericValue() > 0)
			return gdt;

		return null;
	}

	/**
	 * Checks if an operator is a negative operator (returns true when field is missing)
	 * @param {string} operator - Operator to check
	 * @returns {boolean} True if operator is negative
	 * @private
	 */
	static _isNegativeOperator(operator) {
		return operator === EFConstants.OPERATORS.IS_EMPTY ||
			operator === EFConstants.OPERATORS.DOES_NOT_EQUAL ||
			operator === EFConstants.OPERATORS.DOES_NOT_CONTAIN ||
			operator === EFConstants.OPERATORS.DOES_NOT_START_WITH ||
			operator === EFConstants.OPERATORS.DOES_NOT_END_WITH ||
			operator === EFConstants.OPERATORS.REGEX_DOES_NOT_MATCH;
	}
}

EFCriteriaEvaluator.logger = EFLogger.forClass('EFCriteriaEvaluator');
