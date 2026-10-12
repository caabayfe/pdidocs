var STTRMStateAttribute = Class.create();
STTRMStateAttribute.prototype = Object.extendsObject(STTRMStateAttributeSNC, {
    initialize: function(stateAttributeGr, _gs) {
		STTRMStateAttributeSNC.prototype.initialize.call(this, stateAttributeGr, _gs);
		
    },

    type: 'STTRMStateAttribute'
});
