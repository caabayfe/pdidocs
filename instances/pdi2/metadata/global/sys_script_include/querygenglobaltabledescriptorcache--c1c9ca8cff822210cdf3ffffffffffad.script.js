var QueryGenGlobalTableDescriptorCache = Class.create();
QueryGenGlobalTableDescriptorCache.prototype = {
    /**
     * @param {GlideTableDescriptor} nativeTd - The underlying Java GlideTableDescriptor instance
     */
    initialize: function(nativeTd) {
        this._td = nativeTd;
    },

    /**
     * Returns a list of all element descriptors for this table as
     * QueryGenGlobalElementDescriptor wrappers.
     * Mirrors GlideTableDescriptor.getSchemaList().
     *
     * @returns {Array.<QueryGenGlobalElementDescriptor>}
     */
    getSchemaList: function() {
        var nativeList = this._td.getSchemaList();
        var result = [];
        for (var i = 0; i < nativeList.size(); i++) {
            result.push(new QueryGenGlobalElementDescriptor(nativeList.get(i)));
        }
        return result;
    },

    /**
     * Returns all active field names for this table in alpha order.
     * Mirrors GlideTableDescriptor.getActiveFieldNames().
     *
     * @returns {StringList}
     */
    getActiveFieldNames: function() {
        return this._td.getActiveFieldNames();
    },

    /**
     * Returns the element descriptor for the named field.
     * When includeBaseTables is provided, controls whether inherited fields are searched.
     * Mirrors GlideTableDescriptor.getElementDescriptor(name) and
     * GlideTableDescriptor.getElementDescriptor(name, includeBaseTables).
     *
     * @param {string} name
     * @param {boolean} [includeBaseTables]
     * @returns {QueryGenGlobalElementDescriptor|null}
     */
    getElementDescriptor: function(name, includeBaseTables) {
        var ed = arguments.length > 1
            ? this._td.getElementDescriptor(name, includeBaseTables)
            : this._td.getElementDescriptor(name);
        return ed ? new QueryGenGlobalElementDescriptor(ed) : null;
    },

    /**
     * Returns the logical display field name for this table.
     * Mirrors GlideTableDescriptor.getDisplayName().
     *
     * @returns {string}
     */
    getDisplayName: function() {
        return this._td.getDisplayName();
    },

    /**
     * Returns the table name.
     * Mirrors GlideTableDescriptor.getName().
     *
     * @returns {string}
     */
    getName: function() {
        return this._td.getName();
    },

    /**
     * Returns true if the current user can read from this table.
     * Mirrors GlideTableDescriptor.canRead().
     *
     * @returns {boolean}
     */
    canRead: function() {
        return this._td.canRead();
    },

    /**
     * Returns true if the current user can write to this table.
     * Mirrors GlideTableDescriptor.canWrite().
     *
     * @returns {boolean}
     */
    canWrite: function() {
        return this._td.canWrite();
    },

    /**
     * Returns true if the current user can create records in this table.
     * Mirrors GlideTableDescriptor.canCreate().
     *
     * @returns {boolean}
     */
    canCreate: function() {
        return this._td.canCreate();
    },

    /**
     * Returns the translated label for this table.
     * Mirrors GlideTableDescriptor.getLabel().
     *
     * @returns {string}
     */
    getLabel: function() {
        return this._td.getLabel();
    },

    /**
     * Returns the table-level ElementDescriptor (the collection row in sys_dictionary).
     * Mirrors GlideTableDescriptor.getED().
     *
     * @returns {QueryGenGlobalElementDescriptor|null}
     */
    getED: function() {
        var ed = this._td.getED();
        return ed ? new QueryGenGlobalElementDescriptor(ed) : null;
    },

    /**
     * Returns true if this table is defined and has at least one field.
     * Mirrors GlideTableDescriptor.isValid() (instance).
     *
     * @returns {boolean}
     */
    isValid: function() {
        return this._td.isValid();
    },

    /**
     * Returns true if the named field is defined on this table (including inherited fields).
     * Mirrors GlideTableDescriptor.isValidField(fieldName).
     *
     * @param {string} fieldName
     * @returns {boolean}
     */
    isValidField: function(fieldName) {
        return this._td.isValidField(fieldName);
    },

    /**
     * Returns the TableAccessPolicy controlling cross-scope access for this table.
     * Mirrors GlideTableDescriptor.getAccessPolicy().
     *
     * @returns {TableAccessPolicy}
     */
    getAccessPolicy: function() {
        return this._td.getAccessPolicy();
    },

    /**
     * Returns true if this is a remote (scriptable) table.
     * Mirrors GlideTableDescriptor.isRemoteTable().
     *
     * @returns {boolean}
     */
    isRemoteTable: function() {
        return this._td.isRemoteTable();
    },

    /**
     * Returns true if this is a document-oriented table.
     * Mirrors GlideTableDescriptor.isDocumentTable().
     *
     * @returns {boolean}
     */
    isDocumentTable: function() {
        return this._td.isDocumentTable();
    },

    /**
     * Returns true if this is a Data Fabric table.
     * Mirrors GlideTableDescriptor.isDataFabricTable() (instance).
     *
     * @returns {boolean}
     */
    isDataFabricTable: function() {
        return this._td.isDataFabricTable();
    },

    /**
     * Returns the PrimaryKey object for this table.
     * Mirrors GlideTableDescriptor.getPrimaryKey().
     *
     * @returns {PrimaryKey}
     */
    getPrimaryKey: function() {
        return this._td.getPrimaryKey();
    },

    /**
     * Returns true if this is a locally-mapped Data Fabric table.
     * Mirrors GlideTableDescriptor.isLocalDataFabricTable().
     *
     * @returns {boolean}
     */
    isLocalDataFabricTable: function() {
        return this._td.isLocalDataFabricTable();
    },

    type: 'QueryGenGlobalTableDescriptorCache'
};

/**
 * Returns a QueryGenGlobalTableDescriptorCache wrapping the GlideTableDescriptor for the
 * given table name. Loads the schema before returning.
 * Mirrors GlideTableDescriptor.get(name).
 *
 * @static
 * @param {string} name - The table name
 * @returns {QueryGenGlobalTableDescriptorCache}
 */
QueryGenGlobalTableDescriptorCache.get = function(name) {
    return new QueryGenGlobalTableDescriptorCache(GlideTableDescriptor.get(name));
};

/**
 * Returns true if the specified field exists on the specified table.
 * Mirrors GlideTableDescriptor.fieldExists(tableName, fieldName).
 *
 * @static
 * @param {string} tableName
 * @param {string} fieldName
 * @returns {boolean}
 */
QueryGenGlobalTableDescriptorCache.fieldExists = function(tableName, fieldName) {
    return GlideTableDescriptor.fieldExists(tableName, fieldName);
};

/**
 * Returns true if the specified table exists in the system.
 * Mirrors GlideTableDescriptor.isValid(tableName).
 *
 * @static
 * @param {string} tableName
 * @returns {boolean}
 */
QueryGenGlobalTableDescriptorCache.isValid = function(tableName) {
    return GlideTableDescriptor.isValid(tableName);
};

/**
 * Returns true if the specified table is a Data Fabric table.
 * Mirrors GlideTableDescriptor.isDataFabricTable(tableName).
 *
 * @static
 * @param {string} tableName
 * @returns {boolean}
 */
QueryGenGlobalTableDescriptorCache.isDataFabricTable = function(tableName) {
    return GlideTableDescriptor.isDataFabricTable(tableName);
};
