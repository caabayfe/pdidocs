var VaTopicRuntimeUtil = Class.create();
VaTopicRuntimeUtil.prototype = {
    initialize: function() {
    },	
	
	executeFunction: function (obj, functionName, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
		return obj[functionName](arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
	},

	encryptPassword2: function(value) {
		return sn_cs.Password2Encrypter.encrypt(value);
	},

	type: 'VaTopicRuntimeUtil'
};
