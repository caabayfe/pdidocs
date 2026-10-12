/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    /* 
        If job_classification is selected, then only show priorities that exist within
        that job_classification
        Otherwise, show all priorities
    */
    var priority_and_job = api.data.priority_lookup_with_jc;
    var priority_only = api.data.priority_lookup;

    var setPriorityValues = function(query_data) {
        var priorityArr = [];

        if (!query_data) {
            return priorityArr;
        }

        query_data.output.data.GlideAggregate_Query.forEach((item) => {
            priorityArr.push({
                id: item.groupBy[0].value,
                label: item.groupBy[0].value,
            });
        });
    
        return priorityArr;
    };

    return setPriorityValues(api.state.job_classification ? priority_and_job : priority_only);
}
