var DataExtractionContractValidation = Class.create();
DataExtractionContractValidation.prototype = Object.extendsObject(DataExtractionContractValidationImpl, {
    initialize: function() {
        DataExtractionContractValidationImpl.prototype.initialize.call(this);
    },

    type: 'DataExtractionContractValidation'
});
