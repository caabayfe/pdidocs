var PDVariantService = Class.create();
PDVariantService.prototype = {
    initialize: function(opts) {
        this.repository = (opts && opts.repository) || new PDVariantRepository();
    },
    type: 'PDVariantService',
    getVariants: function(processDefinitionId) {
        return this.repository.getVariantsByProcessDefinition(processDefinitionId);
    },
    insertVariants: function(variants) {
        return (variants || []).map(function(fields) {
            return this.repository.insertVariant(fields);
        }.bind(this));
    },
    updateVariants: function(variants) {
        return (variants || []).map(function(fields) {
            return this.repository.updateVariant(fields);
        }.bind(this));
    },
    deleteVariants: function(variantIds) {
        this.repository.deleteVariants((variantIds || []).join(','));
    }
};
