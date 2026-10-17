// Class: ManyToManyManager
// Description: Provides functions to manage many-to-many relationships between records in ServiceNow
// Client Callable: false
// Accessible: public

var ManyToManyManager = Class.create();
ManyToManyManager.prototype = {
    AVAILABLE_RECORDS_LIMIT: 100,

    initialize: function() {
        // Initialize cache
        this._cache = {};
    },

    /**
     * Generates a cache key from function parameters
     * @private
     * @param {Object} params - Configuration object containing:
     * @param {string} params.relatedTable - The related table name
     * @param {string} params.sourceField - The field that references the parent record
     * @param {string} params.targetField - The field that references the target record
     * @param {string} params.parentRecordSysId - The sys_id of the parent record
     * @returns {string} A unique cache key
     */
    _cacheKey: function(params) {
        const { relatedTable, sourceField, targetField, parentRecordSysId } = params;
        return [relatedTable, sourceField, targetField, parentRecordSysId].join('_');
    },

    /**
     * Fetches related records for a given parent record with caching
     * @param {Object} params - Configuration object containing:
     * @param {string} params.relatedTable - The related table name
     * @param {string} params.sourceField - The field that references the parent record
     * @param {string} params.targetField - The field that references the target record
     * @param {string} params.parentRecordSysId - The sys_id of the parent record
     * @param {string} params.targetTable - The target table to query for related records
     * @returns {Array} Array of related records with sourceSysId, targetSysId, and targetDisplayValue
     */
    getRelatedRecords: function(params) {
        try {
            const { relatedTable, sourceField, targetField, parentRecordSysId, targetTable } = params;
            const cacheKey = this._cacheKey(params);
            
            // Return cached result if available
            if (this._cache[cacheKey] !== undefined) {
                return this._cache[cacheKey];
            }
            
            const relatedRecords = [];
            const displayField = new GlideRecord(targetTable).getDisplayName();
            
            // Create a query that uses dot-walking to access the target table
            const gr = new GlideRecord(relatedTable);
            gr.addQuery(sourceField, parentRecordSysId);
            gr.addNotNullQuery(targetField);
            
            // Order by the display field of the target table if available
            if (displayField) {
                gr.orderBy(`${targetField}.${displayField}`);
            }
            
            gr.query();
            
            // Process results
            while (gr.next()) {
                const targetGr = gr[targetField].getRefRecord();
                if (targetGr) {
                    relatedRecords.push({
                        relatedRecord: {
                            sys_id: gr.getUniqueValue(),
                            displayValue: gr.getDisplayValue()
                        },
                        targetRecord: {
                            sys_id: targetGr.getUniqueValue(),
                            displayValue: targetGr.getDisplayValue()
                        }
                    });
                }
            }
            
            // Cache the results
            this._cache[cacheKey] = relatedRecords;
            return relatedRecords;
            
        } catch (error) {
            gs.error(`Error in getRelatedRecords: ${error.message}`);
            return [];
        }
    },

    /**
     * Fetches available records for potential relationship
     * @param {Object} params - Configuration object containing:
     * @param {string} params.relatedTable - The related table name
     * @param {string} params.targetTable - The target table to query
     * @param {string} params.sourceField - The field that references the parent record
     * @param {string} params.targetField - The field that references the target record
     * @param {string} params.parentRecordSysId - The sys_id of the parent record
     * @param {string} [params.encodedQuery] - Optional encoded query
     * @returns {Array} Array of available records
     */
    getAvailableRecords: function(params) {
        try {
            const { relatedTable, targetTable, sourceField, targetField, parentRecordSysId, encodedQuery } = params;
            
            // Get already related records (uses cache)
            const relatedRecords = this.getRelatedRecords({
                relatedTable,
                sourceField,
                targetField,
                parentRecordSysId,
                targetTable
            });
            const relatedSysIds = relatedRecords.map(record => record.targetRecord.sys_id);

            // Build query
            let finalQuery = encodedQuery || '';
            if (relatedSysIds.length > 0) {
                const exclusionQuery = `sys_idNOT IN${relatedSysIds.join(',')}`;
                finalQuery = finalQuery ? `${finalQuery}^${exclusionQuery}` : exclusionQuery;
            }

            // Query for available records
            const availableRecords = [];
            const gr = new GlideRecord(targetTable);
            const displayField = gr.getDisplayName();
            if (finalQuery) {
                gr.addEncodedQuery(finalQuery, true);
            }
            gr.setLimit(this.AVAILABLE_RECORDS_LIMIT);
            if (displayField) {
                gr.orderBy(displayField);
            }
            gr.query();

            while (gr.next()) {
                const record = {
                    sys_id: gr.getUniqueValue(),
                    displayValue: gr.getDisplayValue()
                };
                availableRecords.push(record);
            }

            return availableRecords;
        } catch (error) {
            gs.error(`Error in getAvailableRecords: ${error.message}`);
            return [];
        }
    },

    /**
     * Clears the cache for specific parameters or the entire cache
     * @param {string} [relatedTable] - The related table name
     * @param {string} [sourceField] - The field that references the parent record
     * @param {string} [targetField] - The field that references the target record
     * @param {string} [parentRecordSysId] - The sys_id of the parent record
     */
    clearCache: function(relatedTable, sourceField, targetField, parentRecordSysId) {
        if (relatedTable && sourceField && targetField && parentRecordSysId) {
            const cacheKey = this._cacheKey(relatedTable, sourceField, targetField, parentRecordSysId);
            delete this._cache[cacheKey];
        } else {
            // Clear all cache if no specific key provided
            this._cache = {};
        }
    },

    /**
     * Updates the relationships for a parent record to match the provided target IDs
     * @param {Object} params - Configuration object
     * @param {string} params.relatedTable - The related table name
     * @param {string} params.targetTable - The target table name
     * @param {string} params.targetField - The field that references the target record
     * @param {string} params.sourceField - The field that references the source/parent record
     * @param {string} params.parentRecordSysId - The sys_id of the parent record
     * @param {string[]} targetRecordIds - Array of target record sys_ids to keep
     * @returns {Object} Result containing created, deleted, and error counts
     */
    updateRelatedRecords: function(params, targetRecordIds) {
        try {
            const { 
                relatedTable, 
                targetTable, 
                targetField, 
                sourceField, 
                parentRecordSysId 
            } = params;
            
            if (!Array.isArray(targetRecordIds)) {
                return { success: false, error: 'targetRecordIds must be an array' };
            }
            
            // Get current relationships (will use cache if available)
            const currentRelationships = this.getRelatedRecords({
                relatedTable,
                sourceField,
                targetField,
                parentRecordSysId,
                targetTable
            });
            
            const existingTargetIds = new Set();
            const relationshipsToDelete = [];
            
            // Find relationships to keep and delete
            currentRelationships.forEach(rel => {
                if (targetRecordIds.includes(rel.targetRecord.sys_id)) {
                    existingTargetIds.add(rel.targetRecord.sys_id);
                } else {
                    relationshipsToDelete.push(rel.relatedRecord.sys_id);
                }
            });
            
            // Find new relationships to create
            const newTargetIds = targetRecordIds.filter(id => !existingTargetIds.has(id));
            
            // Process deletions
            let deletedCount = 0;
            if (relationshipsToDelete.length > 0) {
                const gr = new GlideRecordSecure(relatedTable);
                gr.addQuery('sys_id', 'IN', relationshipsToDelete);
                gr.query();
                while (gr.next()) {
                    if (gr.deleteRecord()) {
                        deletedCount++;
                    }
                }
            }
            
            // Process creations
            let createdCount = 0;
            const errors = [];
            
            for (const targetId of newTargetIds) {
                try {
                    const gr = new GlideRecordSecure(relatedTable);
                    gr.initialize();
                    gr.setValue(sourceField, parentRecordSysId);
                    gr.setValue(targetField, targetId);
                    
                    if (gr.insert()) {
                        createdCount++;
                    } else {
                        errors.push(`Failed to create relationship for target ID: ${targetId}`);
                    }
                } catch (e) {
                    errors.push(`Error creating relationship: ${e.message}`);
                }
            }
            
            // Clear cache to ensure fresh data on next read
            this.clearCache(relatedTable, sourceField, targetField, parentRecordSysId);
            
            return {
                success: errors.length === 0,
                created: createdCount,
                deleted: deletedCount,
                unchanged: currentRelationships.length - relationshipsToDelete.length,
                errors: errors.length > 0 ? errors : undefined
            };
            
        } catch (error) {
            gs.error(`Error in updateRelatedRecords: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    },

    type: 'ManyToManyManager'
};
