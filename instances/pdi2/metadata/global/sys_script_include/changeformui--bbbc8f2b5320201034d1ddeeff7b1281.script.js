var ChangeFormUI = Class.create();
ChangeFormUI.prototype = Object.extendsObject(ChangeFormUISNC, {
	initialize: function(_currChgGr, _gs) {
		ChangeFormUISNC.prototype.initialize.call(this, _currChgGr, _gs);
	},

	type: 'ChangeFormUI'
});
