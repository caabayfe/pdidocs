/**
 * Data Fetch Handler
 * 
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const payload = {
        name: event.name,
        elementId: event.elementId,
        payload: event.payload
    };

    if (payload.name === "DATA_FETCH_SUCCEEDED") {
        let { output: { _results, _rowCount }} = api.data.sow_team_mgmt_data_broker;

        if (!api.state.onCallActive) {
            // if on-call is not active, we will need to add metadata 
            // so that the progress loader is hidden on the team page.
            _results = _decorateResultDisableOCLoader(_results);
        } else if (api.state.onCallData.init) {
            // initiate load of on-call data for the groups in this page of results
            api.setState("timeStamp", new Date().getTime());
            api.setState("groupIds", _results.map(team => team._row_data.uniqueValue).toString());
        } else {
            // on-call data success event calls this handler so that 
            // it can complete the 2nd pass, decorating the page of groups
            _results = _decorateResultWithOCData(_results);
        }
        
        api.setState('teams', _results);
        api.setState('paginationProps', {
            "currentPage": api.context.props.currentPage,
            "rowLimit": api.context.props.rowLimit,
            "totalRecordCount": _rowCount
        });
    }

    function _decorateResultWithOCData(teams) {
        const { onCallData, users, rotas } = api.state?.onCallData?.result;

        teams.forEach(team => {
            let idx = onCallData.findIndex(data => data.group === team._row_data.uniqueValue);
            if (idx > -1) {
                team.onCallData = {
                    hasCurrentShift: true,
                    primary: users[onCallData[idx].userId],
                    shift: rotas[onCallData[idx].rota]
                };
            } else {
                team.onCallData = {
                    hasCurrentShift: false
                };
            }
        });

        return teams;
    }

    function _decorateResultDisableOCLoader(teams) {
            // add "noShift" on-call-data to indicate the on-call loader should stop loading
            teams.forEach( team => { 
                team.onCallData = {
                    hasCurrentShift: false
                };
            });
            return teams;
    }
}
