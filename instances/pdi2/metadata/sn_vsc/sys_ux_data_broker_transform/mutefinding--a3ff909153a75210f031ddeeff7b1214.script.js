function transform(input) {
    if (!gs.hasRole("sn_vsc.security_center_admin"))
        return;
    var hardeningUtil = new global.SecurityCenterHardeningUtil();
    if (input.mute_reason_id)
        hardeningUtil.muteFinding(input.finding_id, input.mute_reason_id);
    else
        hardeningUtil.unmuteFinding(input.finding_id);
}
