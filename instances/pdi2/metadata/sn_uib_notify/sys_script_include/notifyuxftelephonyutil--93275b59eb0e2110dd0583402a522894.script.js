var NotifyUXFTelephonyUtil = Class.create();
NotifyUXFTelephonyUtil.prototype = Object.extendsObject(NotifyUXFTelephonyUtilSNC, {
    initialize: function() {
		NotifyUXFTelephonyUtilSNC.prototype.initialize.call(this);
	},

    type: 'NotifyUXFTelephonyUtil'
});
