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
        If priority is selected, then only show job classifications that exist with
        that priority
        Otherwise, show all job classifications
    */
    var job_and_priority = api.data.job_classification_with_priority_lookup;
    var job_only = api.data.job_classification_lookup;

    var setJobClassificationValues = function(query_data) {
        var jcArr = [];

        if (!query_data) {
            return jcArr;
        }

        query_data.output.data.GlideAggregate_Query.forEach((item) => {
            jcArr.push({
                id: item.groupBy[0].value,
                label: item.groupBy[0].value,
            });
        });
        
        return jcArr;
    };

    return setJobClassificationValues(api.state.priority ? job_and_priority : job_only);
}
