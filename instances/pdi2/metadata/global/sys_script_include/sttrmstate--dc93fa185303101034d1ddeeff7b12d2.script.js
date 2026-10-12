var STTRMState = Class.create();
STTRMState.prototype = Object.extendsObject(STTRMStateSNC, {
    initialize: function(stateGr, _gs) {
		STTRMStateSNC.prototype.initialize.call(this, stateGr, _gs);
    },

    type: 'STTRMState'
});
