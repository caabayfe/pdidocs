var STTRMTransition = Class.create();
STTRMTransition.prototype = Object.extendsObject(STTRMTransitionSNC, {
	initialize: function(stateTransitionGr, _gs) {
		STTRMTransitionSNC.prototype.initialize.call(this, stateTransitionGr, _gs);
	},

    type: 'STTRMTransition'
});
