var EntitlementBO = Class.create();
EntitlementBO.prototype = {
    initialize: function() {
        this.isEntitled;
        this.isPermitted;
        this.productionInstanceNames;
    },

    getIsEntitled: function() {
        return this.isEntitled;
    },

    setIsEntitled: function(isEntitled) {
        this.isEntitled = isEntitled;
    },

    getIsPermitted: function() {
        return this.isPermitted;
    },

    setIsPermitted: function(isPermitted) {
        this.isPermitted = isPermitted;
    },

    getProductionInstanceNames: function() {
        return this.productionInstanceNames;
    },

    setProductionInstanceNames: function(productionInstanceNames) {
        this.productionInstanceNames = productionInstanceNames;
    },

    type: 'EntitlementBO'
};
