var DataProtectionCorrelationGenerator = Class.create();
DataProtectionCorrelationGenerator.prototype = {
    initialize: function() {},
    getCorrelationId: function(prefix) {
        return prefix + "-" + new Date().getTime();
    },
    type: 'DataProtectionCorrelationGenerator'
};
