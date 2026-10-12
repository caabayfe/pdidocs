var commonCapabilityId = sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID;
var commonCapabilityName = sn_wwna.WWNAConstants.WWNA_COMMON_CAPABILITY_NAME;
var capabilityGr = new GlideRecord('sys_one_extend_capability');
capabilityGr.get(commonCapabilityId);
var currentName = capabilityGr.getValue('name');
if (currentName && currentName !== commonCapabilityName) {
    capabilityGr.setValue('name', commonCapabilityName);
    capabilityGr.update();
}
var utils = new global.WWNAGlobalUtils();
utils.updateReplaceOnUpgrade(`sys_one_extend_capability_${commonCapabilityId}`);
