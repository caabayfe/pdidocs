var IdentitySecurityUtil = Class.create();
IdentitySecurityUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getNewUISysPropValue: function() {
		return GlideProperties.get("glide.identity.aclanalyzer.is_new_ui", "false");
	},
    type: 'IdentitySecurityUtil'
});
