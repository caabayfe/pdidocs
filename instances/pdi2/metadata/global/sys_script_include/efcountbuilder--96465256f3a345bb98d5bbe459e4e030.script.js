/**
 * Builder class for fluent count map operations
 * Simplifies count map updates by providing a fluent interface
 * and automatic key generation
 * Uses database field names (error_code, error_category, etc.) as keys
 */
class EFCountBuilder {
	
	/**
	 * Creates a new builder instance with shared parameters
	 * @param {Object} sharedParams - Shared parameters containing counts and fields (using database field names)
	 * @returns {EFCountBuilder} New builder instance
	 */
	static create(sharedParams) {
		return new EFCountBuilder(sharedParams);
	}
	
	/**
	 * Private constructor - use EFCountBuilder.create() instead
	 * @param {Object} sharedParams - Shared parameters containing counts and fields (using database field names)
	 * @private
	 */
	constructor(sharedParams) {
		this.sharedParams = sharedParams;
		this.operations = [];
	}
	
	/**
	 * Generic update method for count maps
	 * @param {string} type - The operation type ('error_category' or 'error_code')
	 * @param {Object} countMap - The count map to update
	 * @param {string} primaryValue - The primary value (error_category or error_code value)
	 * @param {string} [key] - Override key (defaults to primaryValue)
	 * @param {Object} [additionalFields] - Additional fields to include in the entry
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	update(type, countMap, primaryValue, key = null, additionalFields = {}) {
		const mapKey = key || primaryValue;
		const keyFields = Object.assign(
			{ [type]: primaryValue },
			additionalFields
		);
		
		this.operations.push({
			type: type,
			map: countMap,
			key: mapKey,
			keyFields: keyFields
		});
		return this;
	}
	
	/**
	 * Add category count map update (convenience method)
	 * @param {Object} categoryCountMap - The category count map to update
	 * @param {string} [key] - Override key (defaults to error_category)
	 * @param {Object} [additionalFields] - Additional fields to include in the entry
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	updateCategory(categoryCountMap, key = null, additionalFields = {}) {
		return this.update('error_category', categoryCountMap, this.sharedParams.error_category, key, additionalFields);
	}
	
	/**
	 * Add code count map update (convenience method)
	 * @param {Object} codeCountMap - The code count map to update
	 * @param {string} [key] - Override key (defaults to error_code from sharedParams)
	 * @param {Object} [additionalFields] - Additional fields to include in the entry
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	updateCode(codeCountMap, key = null, additionalFields = {}) {
		return this.update('error_code', codeCountMap, this.sharedParams.error_code, key, additionalFields);
	}
	
	/**
	 * Generic update method with source fields
	 * @param {string} type - The operation type ('error_category' or 'error_code')
	 * @param {Object} countMap - The count map to update
	 * @param {string} primaryValue - The primary value (error_category or error_code value)
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	updateWithSource(type, countMap, primaryValue) {
		const key = this._generateCompositeKey(primaryValue);
		return this.update(type, countMap, primaryValue, key, this._getSourceFields());
	}
	
	/**
	 * Add category-source count map update (convenience method)
	 * @param {Object} categorySourceCountMap - The category-source count map to update
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	updateCategorySource(categorySourceCountMap) {
		return this.updateWithSource('error_category', categorySourceCountMap, this.sharedParams.error_category);
	}
	
	/**
	 * Add source-code count map update (convenience method)
	 * @param {Object} codeSourceCountMap - The source-code count map to update
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	updateCodeSource(codeSourceCountMap) {
		return this.updateWithSource('error_code', codeSourceCountMap, this.sharedParams.error_code);
	}
	
	/**
	 * Add timeseries category count map update
	 * @param {Object} timeseriesCountMap - The timeseries count map to update
	 * @param {string} [key] - Override key (defaults to error_category)
	 * @param {string} [occurredOn] - The date this aggregation occurred on
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	updateCategoryTimeseries(timeseriesCountMap, key = null, occurredOn = null) {
		const additionalFields = occurredOn ? { occurred_on: occurredOn } : {};
		return this.update('error_category', timeseriesCountMap, this.sharedParams.error_category, key, additionalFields);
	}

	/**
	 * Add timeseries code count map update
	 * @param {Object} timeseriesCountMap - The timeseries count map to update
	 * @param {string} [key] - Override key (defaults to error_code)
	 * @param {string} [occurredOn] - The date this aggregation occurred on
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	updateCodeTimeseries(timeseriesCountMap, key = null, occurredOn = null) {
		const additionalFields = occurredOn ? { occurred_on: occurredOn } : {};
		return this.update('error_code', timeseriesCountMap, this.sharedParams.error_code, key, additionalFields);
	}

	/**
	 * Execute all queued operations
	 * @returns {EFCountBuilder} This builder for chaining
	 */
	build() {
		this.operations.forEach(operation => {
			this._executeOperation(operation);
		});
		return this;
	}
	

	/**
	 * Execute a single operation
	 * @param {Object} operation - The operation to execute
	 * @private
	 */
	_executeOperation(operation) {
		if (gs.nil(operation.map[operation.key])) {
			operation.map[operation.key] = this._createCountMapEntry(operation.keyFields);
		}
		this._incrementCounts(operation.map[operation.key]);
	}
	
	/**
	 * Create a new count map entry with specified key fields
	 * @param {Object} keyFields - Fields to set on the entry (using database field names)
	 * @returns {Object} New count map entry
	 * @private
	 */
	_createCountMapEntry(keyFields) {
		const entry = {
			error_count: 0,
			error_ignored_count: 0
		};
		
		// Copy all relevant fields from sharedParams (using database field names)
		const possibleFields = [
			'error_code', 'error_category', 'error_source', 'error_source_table',
			'error_instance', 'error_instance_table', 'sys_domain'
		];
		
		possibleFields.forEach(field => {
			if (this.sharedParams[field] !== undefined) {
				entry[field] = this.sharedParams[field];
			}
		});
		
		// Override with key-specific fields
		Object.assign(entry, keyFields);
		
		return entry;
	}
	
	/**
	 * Increment count fields in an entry
	 * @param {Object} entry - The entry to update
	 * @private
	 */
	_incrementCounts(entry) {
		entry.error_count += this.sharedParams.error_count || 0;
		entry.error_ignored_count += this.sharedParams.error_ignored_count || 0;
	}
	
	/**
	 * Generate composite key with source fields
	 * @param {string} primaryKey - The primary key (error_category or error_code value)
	 * @returns {string} Composite key
	 * @private
	 */
	_generateCompositeKey(primaryKey) {
		return primaryKey + '|' + 
			this.sharedParams.error_source + '|' + 
			this.sharedParams.error_source_table;
	}
	
	/**
	 * Get source fields object
	 * @returns {Object} Source fields (using database field names)
	 * @private
	 */
	_getSourceFields() {
		return {
			error_source: this.sharedParams.error_source,
			error_source_table: this.sharedParams.error_source_table
		};
	}
	
	/**
	 * Get instance fields object
	 * @returns {Object} Instance fields (using database field names)
	 * @private
	 */
	_getInstanceFields() {
		return {
			error_instance: this.sharedParams.error_instance,
			error_instance_table: this.sharedParams.error_instance_table
		};
	}
}
