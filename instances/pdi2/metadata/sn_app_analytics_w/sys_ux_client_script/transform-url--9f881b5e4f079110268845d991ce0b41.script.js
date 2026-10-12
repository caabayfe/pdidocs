/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    const urlDimensions = api.context.props.breakdowns;
    const transFormedDimensions = urlDimensions.reduce((cumm,curr)=>{
        return {...cumm, [curr.dimension.value]: curr.dimensionValues.reduce((vCumm,vCurr)=>{
            return [...vCumm,vCurr.value];
        },[])};
    },{});
    const appliedConditions = Object.entries(transFormedDimensions)
        .map(([key, value]) => ({
            operator: {
                id: "default",
                label: "is"
            },
            selectedDimension: {
                id: key
            },
            selectedDimensionValues: value.map((val) => {
                var isEmptyValue = /empty_*/g.test(val);
                return {
                    id: isEmptyValue ? '' : val
                };
            })
        }));
    api.setState("appliedConditions", appliedConditions);
    api.setState('selectedBreakDownElements', transFormedDimensions);
}
