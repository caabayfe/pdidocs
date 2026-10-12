/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    let dashboardsInfos = [{
            'dashboardName': 'success-dashboard',
            'image': '/sn_sd.success-dashboard.svg',
            'heading': await helpers.translate('Success Dashboard'),
            'subHeading': await helpers.translate('Success Dashboard provides insights to the leadership team and process owners to measure the performance of their ServiceNow product implementation using the KPIs defined by ServiceNow.'),
            'actionAllowed': await checkAccess('success-dashboard')
        },
        {
            'dashboardName': 'operational-success',
            'image': '/sn_sd.operational-success.svg',
            'heading': await helpers.translate('Operational Success'),
            'subHeading': await helpers.translate('Operational Success provides a consolidated view of the end-to-end performance of the IT processes that are implemented in your organization.'),
            'actionAllowed': await checkAccess('operational-success')
        },
        {
            'dashboardName': 'benchmarks',
            'image': '/sn_sd.benchmarks.svg',
            'heading': await helpers.translate('Benchmarks'),
            'subHeading': await helpers.translate('Benchmarks provides the ability to analyze and compare the trends of the opted KPIs against the peers and industry top performers.'),
            'actionAllowed': await checkAccess('benchmarks')
        }
    ];
    api.setState('dashboardsInformation', dashboardsInfos);

    function checkAccess(dashboardName) {
        for (let dashboardStatus of Object.entries(api.data.isConfigurationPossible.output)) {
            if (dashboardName == dashboardStatus[0])
                return dashboardStatus[1];
        }
        return false;
    }
}
