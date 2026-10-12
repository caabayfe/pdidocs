var QueryGenScalarTypeResolver = Class.create();
QueryGenScalarTypeResolver.prototype = {
    initialize: function() {
        this.scalarTypeCache = null;
    },

    /**
     * Returns the scalar type for the given internal type. Populates the full
     * cache from sys_glide_object on the first call so that only one query is
     * performed per transaction.
     *
     * @param {string} internalType
     * @returns {string|null}
     */
    getScalarType: function(internalType) {
        if (this.scalarTypeCache === null)
            this._populateScalarTypeCache();

        return this.scalarTypeCache[internalType] || null;
    },

    _populateScalarTypeCache: function() {
        this.scalarTypeCache = {};

        var gr = new GlideRecord(QueryGenScalarTypeResolver.TABLE_GLIDE_OBJECT);
        gr.query();
        while (gr.next()) {
            var name = gr.getValue('name');
            var scalarType = gr.getValue('scalar_type');

            if (name && scalarType)
                this.scalarTypeCache[name] = scalarType;
        }
    },

    type: 'QueryGenScalarTypeResolver'
};

QueryGenScalarTypeResolver._instance = null;
QueryGenScalarTypeResolver.TABLE_GLIDE_OBJECT = 'sys_glide_object';

/**
 * Gets the singleton instance of QueryGenScalarTypeResolver.
 *
 * @static
 * @returns {QueryGenScalarTypeResolver}
 */
QueryGenScalarTypeResolver.get = function() {
    if (!QueryGenScalarTypeResolver._instance)
        QueryGenScalarTypeResolver._instance = new QueryGenScalarTypeResolver();

    return QueryGenScalarTypeResolver._instance;
};
