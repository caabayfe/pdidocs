/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const skillCapabilityMapping =  api?.state?.skillCapabilityMapping || []
    if (skillCapabilityMapping) {
        var result = Object.values(skillCapabilityMapping)
            .filter(value => Array.isArray(value))
            .flat()?.map(item=>{return {...item,sublabel:item.type}});
            
        result = Object.values(
            result.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = item;
                }
                return acc;
            }, {})
        );            
        result = result.sort((firstSkill, secondSkill) => firstSkill.label.localeCompare(secondSkill.label));    
        return result
    }
    return [];

}
