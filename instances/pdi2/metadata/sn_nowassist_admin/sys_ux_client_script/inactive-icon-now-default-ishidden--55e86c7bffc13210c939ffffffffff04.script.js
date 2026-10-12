/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    return !api.item?.parent?.value?.versions?.some(version => {
        return !version.sysId?.includes('index') && 
               !version.oobVersion && 
               version.sourceModel === api.item.value.sourceModel;
    });
}
