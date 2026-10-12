answer = true;
if ((global.AssetUtils.IS_HAMP_ACTIVE
	&& sn_hamp.HAMUtils.isParentFieldEditable
	&& sn_hamp.HAMUtils.isParentFieldEditable(current))
	|| (global.AssetUtils.IS_EAM_ACTIVE
   && sn_eam.EAMUtils.isEnterpriseClassAsset
   && sn_eam.EAMUtils.isEnterpriseClassAsset(current.parent))
   || (global.AssetUtils.IS_ITAM_COMMON_ACTIVE
	&& !gs.nil(current.parent) && global.AssetUtils.isParentPallet(current.parent)
	&& sn_itam_common.ITAMCommonPalletsUtil.isParentFieldEditable
	&& !sn_itam_common.ITAMCommonPalletsUtil.isParentFieldEditable(current))) {
    answer = false;
}
answer;
