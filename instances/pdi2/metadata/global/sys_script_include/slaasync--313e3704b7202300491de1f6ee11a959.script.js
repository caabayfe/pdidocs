var SLAAsync = Class.create();

SLAAsync.prototype = Object.extendsObject(SLAAsyncSNC, {
    initialize: function() {
		SLAAsyncSNC.prototype.initialize.call(this);
	},

    type: 'SLAAsync'
});
