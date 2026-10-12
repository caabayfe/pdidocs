var VAImageExtPt = Class.create();
VAImageExtPt.prototype = Object.extendsObject(global.VADefaultImageUtil, {

	handles: function (channel) {
		return false; 
	},

    type: 'VAImageExtPt'
});
