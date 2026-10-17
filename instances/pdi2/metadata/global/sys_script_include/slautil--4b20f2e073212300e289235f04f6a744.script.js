var SLAUtil = Class.create();
SLAUtil.prototype = Object.extendsObject(SLAUtilSNC, {
    initialize: function() {
		SLAUtilSNC.prototype.initialize.call(this);
	},

    type: 'SLAUtil'
});
