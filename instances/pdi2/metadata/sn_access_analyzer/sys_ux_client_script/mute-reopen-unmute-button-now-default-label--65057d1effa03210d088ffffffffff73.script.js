/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
const statusValue = api?.data?.look_up_a_single_record?.result?.status?.value || "";
if (statusValue === "resolved") {
    return "Reopen";
}
if (statusValue === "muted") {
    return "Unmute";
}
if (statusValue === "open") {
    return "Mute";
}
return null;
}
