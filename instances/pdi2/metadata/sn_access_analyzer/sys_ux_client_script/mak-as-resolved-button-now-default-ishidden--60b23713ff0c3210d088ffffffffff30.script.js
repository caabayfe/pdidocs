/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const roles = api?.context?.session?.user?.roles || [];
    if(api?.data?.record?.form?.fields?.status?.value == "resolved"){
        return true;
    }
    if ((roles.includes('admin') || roles.includes('access_analyzer_admin')) && api?.data?.record?.form?.fields?.status?.value != "resolved") {
        return false;
    } else if (roles.includes('user_admin') && api?.data?.record?.form?.fields?.status?.value != "resolved") {
        return true;
    }
    return false;
}
