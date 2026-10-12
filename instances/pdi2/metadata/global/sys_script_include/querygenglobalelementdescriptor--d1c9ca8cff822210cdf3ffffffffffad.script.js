var QueryGenGlobalElementDescriptor = Class.create();
QueryGenGlobalElementDescriptor.prototype = {
    /**
     * @param {GlideElementDescriptor} nativeEd - The underlying Java GlideElementDescriptor instance
     */
    initialize: function(nativeEd) {
        this.name = this._toStr(nativeEd.getName());
        this.columnName = this._toStr(nativeEd.getColumnName());
        this.label = this._toStr(nativeEd.getLabel());
        this.plural = this._toStr(nativeEd.getPlural());
        this.plural_label = this.plural;
        this.tableName = this._toStr(nativeEd.getTableName());
        this.internalType = this._toStr(nativeEd.getInternalType());
        this.scalarType = QueryGenScalarTypeResolver.get().getScalarType(this.internalType);
        this.reference = this._toStr(nativeEd.getReference());
        this.referenceLabel = this._toStr(this._getTableLabel(this.reference));
        this._isChoiceTable = !!nativeEd.isChoiceTable();
        this.firstTableName = this._toStr(nativeEd.getFirstTableName());
    },

    /**
     * Converts a Java value to a JavaScript string, preserving null as JavaScript null
     * rather than the string "null".
     *
     * @param {*} value
     * @returns {string|null}
     */
    _toStr: function(value) {
        return value == null ? null : value + '';
    },

    /**
     * Returns the display name (label) of the given table, or null if the table
     * name is absent or does not correspond to a valid table.
     *
     * @param {string} tableName
     * @returns {string|null}
     */
    _getTableLabel: function(tableName) {
        if (!tableName || !QueryGenGlobalTableDescriptorCache.isValid(tableName))
            return null;
        return QueryGenGlobalTableDescriptorCache.get(tableName).getLabel();
    },

    /**
     * @returns {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @returns {string}
     */
    getColumnName: function() {
        return this.columnName;
    },

    /**
     * @returns {string}
     */
    getLabel: function() {
        return this.label;
    },

    /**
     * @returns {string}
     */
    getPlural: function() {
        return this.plural;
    },

    /**
     * @returns {string}
     */
    getTableName: function() {
        return this.tableName;
    },

    /**
     * @returns {string}
     */
    getInternalType: function() {
        return this.internalType;
    },

    /**
     * @returns {number}
     */
    getType: function() {
        return this.scalarType;
    },

    /**
     * For reference fields, returns the name of the referenced table.
     *
     * @returns {string}
     */
    getReference: function() {
        return this.reference;
    },

    /**
     * For reference fields, returns the display name (label) of the referenced table,
     * or null if the reference is absent or the table is invalid.
     *
     * @returns {string|null}
     */
    getReferenceLabel: function() {
        return this.referenceLabel;
    },

    /**
     * Returns true if this field has a choice list (dropdown).
     *
     * @returns {boolean}
     */
    isChoiceTable: function() {
        return this._isChoiceTable;
    },

    /**
     * Returns the name of the highest-level (root) table that first introduces this element.
     *
     * @returns {string}
     */
    getFirstTableName: function() {
        return this.firstTableName;
    },

    type: 'QueryGenGlobalElementDescriptor'
};
