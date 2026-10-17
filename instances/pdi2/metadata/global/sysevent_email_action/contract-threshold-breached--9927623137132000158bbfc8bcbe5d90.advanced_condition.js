if (GlidePluginManager.isActive('com.sn_itam_common') && sn_itam_common.CommonContractManagementUtils && sn_itam_common.CommonContractManagementUtils.prototype.sendContractNotification) {
	answer = new sn_itam_common.CommonContractManagementUtils().sendContractNotification(current);
}
else {
	answer = true;
}
