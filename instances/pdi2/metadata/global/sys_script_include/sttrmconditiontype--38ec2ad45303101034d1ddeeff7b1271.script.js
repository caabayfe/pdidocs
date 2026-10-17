var STTRMConditionType = Class.create();
STTRMConditionType.prototype = Object.extendsObject(STTRMConditionTypeSNC, {
    initialize: function(conditionTypeGr, _gs) {
		STTRMConditionTypeSNC.prototype.initialize.call(this, conditionTypeGr, _gs);
    },

    type: 'STTRMConditionType'
});
