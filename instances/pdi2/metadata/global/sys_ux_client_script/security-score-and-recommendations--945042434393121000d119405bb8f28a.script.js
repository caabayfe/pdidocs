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

    const hideLoader = () => api.setState('loaderVisibility', false);

    function update() {

        if (api.context.props.navigationUrl) {
            var url = '/now/machine-identity-console/' + api.context.props.navigationUrl;
            var link = api.state.widgetLink.replace("{0}", url);
            api.setState('widgetLink', link);
            api.setState('footerLink', url);
        }

        var riskyMI = 0;
        var score = 0;

        api.data.dataSource.results.forEach(row => {
            riskyMI += row.risky_mi.value;
            score += row.score.value;
        });

        var securityScoreData = [{
            data: [{
                riskType: 'nonRisky',
                value: score
            }, {
                riskType: 'risky',
                value: 100 - score
            }],
            metadata: {
                groupBy: [{
                    label: "Risk Type",
                    id: "riskType"
                }],
                format: {
                    unitFormat: "{0}%"
                }
            }
        }];

        hideLoader();
        api.setState('securityScoreData', securityScoreData);

        const fmt = Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 2
        });
        api.setState('riskyMI', fmt.format(riskyMI));
    }

    function handleError() {
        hideLoader();
        api.setState('hasError', true);
    }

    ({
        DATA_FETCH_SUCCEEDED: update,
        DATA_FETCH_FAILED: handleError
    })[event.name]();

}
