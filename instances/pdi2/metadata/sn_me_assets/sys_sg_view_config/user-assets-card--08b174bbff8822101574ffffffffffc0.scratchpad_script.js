var attestationUtilsCondition = global.AssetUtils.IS_ITAM_COMMON_ACTIVE && sn_itam_common.AssetAttestationUtils;
if (attestationUtilsCondition) {
	var res = sn_itam_common.AssetAttestationUtils.isAttestationOpenForAsset(current);
	if (res) {
		m_scratchpad.shouldShowAttestationIndicator = current.sys_id;
	}
}
