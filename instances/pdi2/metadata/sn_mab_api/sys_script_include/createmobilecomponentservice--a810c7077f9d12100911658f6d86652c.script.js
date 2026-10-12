/**
 * Service for creating mobile components from full mobile metadata and loading them into the tables.
 */
class CreateMobileComponentService {
    constructor() {
        this.validationHandler = new ValidationHandler();
        this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
        this.mobileDAOCache = new MobileDAOCache();
        this.updateConfigurationService = new UpdateConfigurationService();
        this.configRetrievalService = new ConfigRetrievalService(false);
    }

    /**
     * Creates a mobile component from the given full mobile metadata.
     *
     * @param {Object} fullMobileMetadata - Full mobile metadata containing components.
     * @returns {Object} An object containing created record IDs map and root record.
     */
    createComponent(fullMobileMetadata) {
        const idMap = {};

        try {
            const mobileComponents = fullMobileMetadata.components;
            const tableNames = this._extractTableNames(mobileComponents);
            this._validateTables(tableNames);
            const records = this._extractRecords(mobileComponents);
            const sortedRecords = this._topologicalSort(records);

            // Create a deep copy of sortedRecords to ensure immutability of original metadata
            // as processInsertsAndUpdates() may alter the object passed to it.
            const sortedRecordsCopy = JSON.parse(JSON.stringify(sortedRecords));
            this.updateConfigurationService.processInsertsAndUpdates(sortedRecordsCopy, idMap);

            return {
                rootRecord: this._getRootRecord(idMap, fullMobileMetadata.rootSysId),
                idMap,
            };
        } catch (error) {
            const deleteIdMap = this._deleteRecordsByIdMap(idMap);
            const deletedRecords = this._groupSysIdsByTable(deleteIdMap)

            if (Object.keys(deletedRecords).length > 0) {
                gs.error(`[${this.constructor.name}]
                   Unable to create the mobile component. Rolled back the following records: 
                   ${JSON.stringify(deletedRecords)}`);
            }

            throw error;
        }
    }

    /**
     * Gets a preview of the mobile component.
     * 
     * We need to separately fetch card preview data here because we delete the created mobile components
     * before returning data back to the frontend. In order to render the card preview, we will need to cache the
     * card preview data to avoid the live preview component from trying to fetch data from a card that doesn't exist.
     * 
     *
     * @param {Object} fullMobileMetadata - Full mobile metadata.
     * @returns {Object} Preview of the mobile component metadata.
     */
    getComponentPreview(fullMobileMetadata) {
        const { idMap, rootRecord } = this.createComponent(fullMobileMetadata);
        const previewMobileCardData = this._getCardMetadata(fullMobileMetadata.components, idMap);
        const previewMobileMetadata = this.configRetrievalService.retrieveConfig(rootRecord.table, rootRecord.sysId);
        this._deleteRecordsByIdMap(idMap);
        return { previewMobileMetadata, previewMobileCardData };
    }

    /**
     * Gets the card metadata needed to render card live preview.
     *
     * @param {Array} mobileComponents - mobile metadata components.
     * @param {Map} idMap - map of created record IDs.
	 * @private
     */
    _getCardMetadata(mobileComponents, idMap) {
        const card = mobileComponents.find((component) => component.rootTable === 'sys_sg_view_config');
        if (!card) return {};

        const cardSysId = idMap[card.rootSysId]?.sys_id || card.rootSysId;
        var format = sn_mab_api.McbResultFormats.viewConfigFormat;
		var util = new sn_mab_api.McbGlideRecordUtil(format);

      if (util.verifyAuth('sys_sg_view_config', cardSysId)) {
        var viewConfigHM = util.getCard(cardSysId);
        var viewTemplateHM = util.getTemplate(viewConfigHM["template"], false);
        var uIRuleHMs = util.getUiRules(cardSysId);
    
        viewConfigHM["templateView"] = viewTemplateHM;
        viewConfigHM["mobileUiRules"] = uIRuleHMs;
    
        return viewConfigHM;
      }
	}

    /**
     * Deletes the created records.
     *
     * @param {Map} idMap - Map of created record IDs.
     * @private
     */
    _deleteRecordsByIdMap(idMap) {
        const createdRecords = Object.values(idMap)
            .reverse()
            .map(value => ({
                sys_id: value.sys_id,
                table: value.table
            }));

        return this._deleteRecords(createdRecords);
    }

    /**
     * Deletes records from the database.
     *
     * @param {Array} records - Array of records to be deleted.
     * @returns {Object} A map of deleted record IDs.
     * @private
     */
    _deleteRecords(records) {
        const deleteIdMap = {};
        records.forEach(record => {
            const mobileAppBuilderDao = this.mobileDAOCache.getDAO(record.table);
            try {
                const response = this.updateConfigurationService.deleteRecord(record.sys_id, mobileAppBuilderDao);
                if (response) deleteIdMap[record.sys_id] = response;
            } catch (error) {
                gs.error(`Unable to delete the following record ${record.sys_id} from ${record.table} due to the following error: ${error}`)
            }
        });
        return deleteIdMap;
    }

    /**
     * Retrieves the root record from the ID map.
     *
     * @param {Object} idMap - Map of created record IDs.
     * @param {string} newSysId - unsaved system id of the root record.
     * @returns {Object|null} The root record or null if not found.
     * @private
     */
    _getRootRecord(idMap, newSysId) {
        if (idMap.hasOwnProperty(newSysId)) {
            const { sys_id, table } = idMap[newSysId];
            return {
                table: table,
                sysId: sys_id
            };
        } else {
            return null;
        }
    }

    /**
     * Converts an object to an array.
     * @param {Object} obj - The object to be converted.
     * @returns {Array} - The converted array.
     */
    _objectToArray(obj) {
        let resultArray = [];
        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                resultArray = resultArray.concat(obj[key]);
            } else {
                resultArray.push(obj[key]);
            }
        }

        return resultArray;
    }

    /**
     * Performs a topological sort on the given data.
     *
     * @param {Array} data - The data to be sorted.
     * @returns {Array} - The sorted data.
     * @throws {MABError} - If the graph has a cycle.
     */
    _topologicalSort(data) {
        const nodes = new Map();
        const sorted = [];
        const visited = new Map();

        data.forEach(item => {
            nodes.set(item.sysId, {
                item,
                dependencies: new Set()
            });
        });

        // Populate dependencies dynamically
        data.forEach(item => {
            for (const key in item.fields) {
                const value = item.fields[key];
                if (typeof value === 'string' && nodes.has(value)) {
                    nodes.get(item.sysId).dependencies.add(value);
                }
            }
        });

        const visitDFS = (node) => {
            if (visited.get(node.item.sysId) === 'temporary') {
                this.customErrorHandler.throwBadRequestError(
                    'GRAPH_CYCLE_ERROR',
                    `The mobile component metadata graph has a cycle in node: ${node.item.sysId}.`
                );
            }
            if (!visited.has(node.item.sysId)) {
                visited.set(node.item.sysId, 'temporary');
                node.dependencies.forEach(dep => {
                    if (nodes.has(dep)) {
                        visitDFS(nodes.get(dep));
                    }
                });
                visited.set(node.item.sysId, 'permanent');
                sorted.push(node.item);
            }
        };

        nodes.forEach(node => {
            if (!visited.has(node.item.sysId)) {
                visitDFS(node);
            }
        });

        return sorted;
    }

    /**
     * Groups system IDs by table name from the ID map.
     *
     * @param {Object} idMap - A map containing objects with sys_id and table properties.
     * @param {Array} [sortedRecords=[]] - An optional array of keys dictating the order of results.
     * @returns {Object} An object with table names as keys and arrays of sys_ids as values.
     * @private
     */
    _groupSysIdsByTable(idMap, sortedRecords = []) {
        const results = {};

        const addResult = (sysId) => {
            if (idMap.hasOwnProperty(sysId)) {
                const { sys_id, table } = idMap[sysId];
                if (!results[table]) {
                    results[table] = [];
                }
                results[table].push(sys_id);
            }
        };

        if (sortedRecords.length > 0) {
            sortedRecords.forEach(node => addResult(node.sysId));
        } else {
            Object.keys(idMap).forEach(addResult);
        }

        return results;
    }


    /**
     * Extracts table names from mobile components.
     *
     * @param {Array} mobileComponents - Array of mobile component objects.
     * @returns {Array} An array of unique table names.
     * @private
     */
    _extractTableNames(mobileComponents) {
        const setOfTableNames = mobileComponents.reduce((set, item) => {
            const tableNames = Object.values(item.data).map((obj) =>
                Array.isArray(obj) ? obj[0]?.tableName : obj?.tableName
            ).filter(tableName => tableName && tableName !== "");
            return new Set([...set, ...tableNames]);
        }, new Set());

        return [...setOfTableNames];
    }

    /**
     * Extracts records from mobile components.
     *
     * @param {Array} mobileComponents - Array of mobile component objects.
     * @returns {Array} An array of records.
     * @private
     */
    _extractRecords(mobileComponents) {
        return mobileComponents.reduce((acc, item) => {
            return [...acc, ...this._objectToArray(item.data)];
        }, []);
    }

    /**
     * Validates table names for existence and accessibility.
     *
     * @param {Array} tableNames - Array of table names to validate.
     * @throws {MABError} - Will throw an error if any table is not found or inaccessible.
     * @private
     */
    _validateTables(tableNames) {
        const invalidTables = tableNames.filter(tableName => !this.validationHandler.isValidTable(tableName));
        if (invalidTables.length > 0) {
            this.customErrorHandler.throwBadRequestError(
                'TABLE_NOT_FOUND',
                `The following tables do not exist: ${invalidTables.join(', ')}`
            );
        }

        const inaccessibleTables = tableNames.filter(tableName => !this.validationHandler.isTableAccessible(tableName));
        if (inaccessibleTables.length > 0) {
            this.customErrorHandler.throwInternalError(
                'TABLE_INACCESSIBLE',
                `The following tables are inaccessible: ${inaccessibleTables.join(', ')}`,
                new Error().stack
            );
        }
    }
}

module.exports = CreateMobileComponentService;
