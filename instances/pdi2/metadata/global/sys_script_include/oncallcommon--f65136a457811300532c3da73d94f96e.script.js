var OnCallCommon = Class.create();
OnCallCommon.prototype = Object.extendsObject(OnCallCommonSNC, {
	initialize: function () {
		OnCallCommonSNC.prototype.initialize.call(this);
	},
	type: 'OnCallCommon'
});
