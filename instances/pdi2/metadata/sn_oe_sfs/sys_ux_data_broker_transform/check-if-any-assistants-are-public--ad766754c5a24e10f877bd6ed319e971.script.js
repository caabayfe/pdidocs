function transform() {
	var result = {};
	var publicAgentSysIds = Object.keys(new sn_oe_sfs.CIUtil().getPublicAccessListData().name);
	result["genaiInstalled"] = GlidePluginManager.isActive("com.glide.cs.genai");
	result["publicActive"] = publicAgentSysIds.length > 0;
	result["publicAgentSysIds"] = publicAgentSysIds;
	return result;
}
