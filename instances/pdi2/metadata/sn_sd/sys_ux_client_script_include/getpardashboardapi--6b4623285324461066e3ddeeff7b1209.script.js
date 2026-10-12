async function include({imports}, helpers, dashboardId, visibility){
    let url = '/api/now/v1/par/dashboards/' + dashboardId + '?visibility=' + visibility;
    let response = await helpers.snHttp(url, {
        method: 'GET',
        body: {}
    });
    return response;
}
