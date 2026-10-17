var STTRMAttribute = Class.create();
STTRMAttribute.prototype = Object.extendsObject(STTRMAttributeSNC, {
    initialize: function(attributeGrOrName, _gs) {
		STTRMAttributeSNC.prototype.initialze.call(this, attributeGrOrName, _gs);
    },

    type: 'STTRMAttribute'
});
