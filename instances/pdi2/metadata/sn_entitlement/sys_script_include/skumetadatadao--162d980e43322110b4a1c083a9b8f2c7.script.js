var SkuMetadataDAO = Class.create();
SkuMetadataDAO.prototype = {
    initialize: function() {
        this._cacheManager = new LicensingCacheManager();
    },

    isSKUMetadataHasSubscription: function(metadataType, metadataValues) {
        const gr = new GlideRecord(LicensingEngineDBConstants.SKU_METADATA);
        gr.addQuery(LicensingEngineDBConstants.SCHEMA_TYPE, metadataType);
        gr.addQuery(LicensingEngineDBConstants.COLUMN_VALUES, metadataValues);
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.query();
        return gr.next();

    },

    /**
     * Queries sku_metadata table based on the metadata type and partial/full column values.
     * makes sure to return only for active subscription entitlements
     * @param {string} metadataType
     * @param {string} metadataColumnValue
     * @return {GlideRecord} GR of sku_metadata
     */
    getSKUMetadataGRBasedOnMetadataValue: function(metadataType, metadataColumnValue) {
        const gr = new GlideRecord(LicensingEngineDBConstants.SKU_METADATA);
        gr.addQuery(LicensingEngineDBConstants.SCHEMA, metadataType);
        gr.addQuery(LicensingEngineDBConstants.COLUMN_VALUES, LicensingEngineDBConstants.CONTAINS, metadataColumnValue);
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.query();
        return gr;
    },

    /**
     * Internal method to load SKU metadata data from database
     * @returns {Map} Map of schema type to SKU metadata objects
     */
    _loadSKUMetadataReferenceData: function() {
        var maps = {
            subscription_entitlement: this._loadReferenceDataMap(
                LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT,
                LicensingEngineDBConstants.ENTITLEMENT_ID,
                [LicensingEngineDBConstants.NAME, LicensingEngineDBConstants.SYS_ID],
                LicensingEngineDBConstants.DEFAULT_ENTITLEMENT_STATUS_QUERY_CHECK
            ),
            subscription_entitlement_item: this._loadReferenceDataMap(
                LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_ITEM,
                LicensingEngineDBConstants.ENTITLEMENT_ID,
                [LicensingEngineDBConstants.NAME, LicensingEngineDBConstants.SYS_ID],
                LicensingEngineDBConstants.DEFAULT_ENTITLEMENT_STATUS_QUERY_CHECK
            ),
            sku_metadata_schema: this._loadReferenceDataMap(
                LicensingEngineDBConstants.SKU_METADATA_SCHEMA,
                LicensingEngineDBConstants.TYPE,
                [LicensingEngineDBConstants.COLUMN_NAMES, LicensingEngineDBConstants.SYS_ID],
                null
            )
        };

        return maps;
    },

    /**
     * Prebuild sku_metadata records to populate the data into cache.
     *
     **/
    loadAllDataIntoCache: function() {
        // Step 1: Load all reference data
        var referenceMaps = this._loadSKUMetadataReferenceData();

        // Step 2: Query SKU records
        var skuRecords = this._queryActiveSkuMetadata();

        // Step 3: Build cache structure
        var cacheBySchemaType = this._buildCacheFromSkuRecords(skuRecords, referenceMaps);

        // Step 4: store the data into cache
        this._cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SKU_METADATA_CACHE, cacheBySchemaType);

        return cacheBySchemaType;

    },

    /**
     * Loads reference data from the given table.
     * @param {string} tableName - The name of the table to load data from.
     * @param {string} idField - The name of the field to use as the key in the map.
     * @param {Array<string>} fields - An array of field names to include in the map.
     * @param {string} query - An optional query to filter the records.
     * @returns {Object} A map of records from the table.
     */
    _loadReferenceDataMap: function(tableName, idField, fields, query) {
        var gr = new GlideRecord(tableName);
        if (query) {
            gr.addEncodedQuery(query);
        }
        gr.query();
        var map = {};
        while (gr.next()) {
            map[gr.getValue(idField)] = fields.reduce(function(obj, field) {
                obj[field] = gr.getValue(field);
                return obj;
            }, {});
        }
        return map;
    },

    /**
     * Queries the active SKU metadata records.
     * @returns {GlideRecord} The GlideRecord of the active and expired SKU metadata records.
     */
    _queryActiveSkuMetadata: function() {
        var gr = new GlideRecord(LicensingEngineDBConstants.SKU_METADATA);
        gr.addQuery(
            LicensingEngineDBConstants.SUBSCRIPTION_STATUS,
            LicensingEngineDBConstants.IN,
            LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK
        );
        gr.query();
        return gr;
    },

    /**
     * Builds the cache from the given SKU records.
     * @param {GlideRecord} skuRecords - The SKU records to build the cache from.
     * @param {Object} referenceMaps - The reference maps to use for lookups.
     * @returns {Map} The cache built from the given SKU records.
     */
    _buildCacheFromSkuRecords: function(skuRecords, referenceMaps) {
        var cacheBySchemaType = new Map();

        // Cache field constants once
        var FIELDS = {
            COL_VALUES: LicensingEngineDBConstants.COLUMN_VALUES,
            SUBSCRIPTION: LicensingEngineDBConstants.SUBSCRIPTION,
            SUBSCRIPTION_ITEM: LicensingEngineDBConstants.SUBSCRIPTION_ITEM,
            SCHEMA: LicensingEngineDBConstants.SCHEMA
        };

        while (skuRecords.next()) {
            var cacheEntry = this._createCacheEntry(skuRecords, referenceMaps, FIELDS);
            this._addToCache(cacheBySchemaType, cacheEntry);
        }

        return cacheBySchemaType;
    },

    /**
     * Creates a cache entry for the given SKU record.
     * @param {GlideRecord} skuRecords - The SKU record to create a cache entry for.
     * @param {Object} referenceMaps - The reference maps to use for lookups.
     * @param {Object} FIELDS - The field constants to use for lookups.
     * @returns {Object} The cache entry.
     *{
     *       "column_values": "4bd155cc9f181210cb72c1ce0a0a1cd8,Experience Generation,1000",
     *       "subscription.name": "Now Assist for Enterprise",
     *       "subscription.sys_id": "0ab9d01669a93610f877351ac373e817",
     *       "schema.type": "genai_metadata",
     *       "schema.column_names": "feature_id,feature,assist",
     *       "subscription_item.name": "Now Assist for Enterprise",
     *       "subscription_item.sys_id": "a2b9d01669a93610f877351ac373e8b7"
     *   },
     */
    _createCacheEntry: function(skuRecords, referenceMaps, FIELDS) {
        var subscriptionId = skuRecords.getValue(FIELDS.SUBSCRIPTION);
        var itemId = skuRecords.getValue(FIELDS.SUBSCRIPTION_ITEM);
        var schemaId = skuRecords.getValue(FIELDS.SCHEMA);

        // Safe lookups with fallback
        var subData = referenceMaps.subscription_entitlement[subscriptionId] || {};
        var itemData = referenceMaps.subscription_entitlement_item[itemId] || {};
        var schemaData = referenceMaps.sku_metadata_schema[schemaId] || {};

        return {
            schemaId: schemaId,
            data: {
                "column_values": skuRecords.getValue(FIELDS.COL_VALUES) || "",
                "subscription.name": subData.name || "",
                "subscription.sys_id": subData.sys_id || "",
                "subscription_item.name": itemData.name || "",
                "subscription_item.sys_id": itemData.sys_id || "",
                "schema.type": schemaId || "",
                "schema.column_names": schemaData.column_names || ""
            }
        };
    },

    /**
     * Adds the cache entry to the cache.
     * @param {Map} cache - The cache to add the entry to.
     * @param {Object} cacheEntry - The cache entry to add.
     */
    _addToCache: function(cache, cacheEntry) {
        var schemaEntries = cache.get(cacheEntry.schemaId);
        if (!schemaEntries) {
            schemaEntries = [];
            cache.set(cacheEntry.schemaId, schemaEntries);
        }
        schemaEntries.push(cacheEntry.data);
    },
    /**
     * Returns the map of schema type to SKU metadata object
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Map} Map of schema types to metadata objects
     */
    getSkuMetadata: function() {
        var data = this._cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SKU_METADATA_CACHE);
        if (gs.nil(data)) {
            // Load data locally; loadAllDataIntoCache() already persists it for other threads
            data = this.loadAllDataIntoCache();
        }
        // Return local variable if cache doesn't exist  - immune to concurrent cache flush
        return data;
    },

    type: 'SkuMetadataDAO'
};
