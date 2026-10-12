var TreePickerUtils = Class.create();
TreePickerUtils.prototype = {
    initialize: function(table, referenceField, sysId, serializedChanges, encodedRecord) {
        this.table = table;
        this.referenceField = referenceField;
        this.sysId = sysId;
        this.serializedChanges = serializedChanges;
        this.encodedRecord = encodedRecord;
    },
    isTreePicker: function () {
        var gtpce = new GlideTreePickerConfigEvaluator(this.table, this.referenceField, this.sysId, this.serializedChanges, this.encodedRecord);
        return gtpce.isTreePicker();
    },
    type: 'TreePickerUtils'
};
