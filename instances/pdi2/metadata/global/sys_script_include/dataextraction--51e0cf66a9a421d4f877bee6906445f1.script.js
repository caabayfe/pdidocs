var DataExtraction = Class.create();
DataExtraction.prototype = Object.extendsObject(DataExtractionImpl, {
    initialize: function() {
        DataExtractionImpl.prototype.initialize.call(this);
    },

    type: 'DataExtraction'
});
