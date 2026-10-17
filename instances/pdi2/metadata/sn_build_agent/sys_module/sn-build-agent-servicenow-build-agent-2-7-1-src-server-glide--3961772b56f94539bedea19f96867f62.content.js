import { gs } from '@servicenow/glide';
import { VariantSelection, BuildAgentServiceUtil } from '@servicenow/glide/sn_build_agent';
export const AE_WORK_ITEM_CREATION_CAPABILITY = '8433dc3f3bf6431009d0a0aa04e45ad7';
export const AE_WORK_ITEM_EXECUTION_CAPABILITY = '92da49843b8f83103f18629aa4e45af8';
export function chargeAssist(capabilityId) {
    try {
        if (VariantSelection.isAutonomousEngineer()) {
            BuildAgentServiceUtil.chargeAssist({ capability_id: capabilityId });
        }
    }
    catch (e) {
        gs.warn(`[assistBilling] charge-assist failed (non-fatal): ${e?.message ?? e}`);
    }
}
