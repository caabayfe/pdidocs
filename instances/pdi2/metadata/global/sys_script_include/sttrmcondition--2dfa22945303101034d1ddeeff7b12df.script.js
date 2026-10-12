var STTRMCondition = Class.create();
STTRMCondition.prototype = Object.extendsObject(STTRMConditionSNC, {
    initialize: function(conditionGr, _gs) {
		STTRMConditionSNC.prototype.initialize.call(this, conditionGr, _gs);
    },

    type: 'STTRMCondition'
});
