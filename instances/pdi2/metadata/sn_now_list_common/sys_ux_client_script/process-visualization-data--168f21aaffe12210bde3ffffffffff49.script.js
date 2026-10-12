async function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.name == "DATA_FETCH_SUCCEEDED") {
        var xAxis = "";
        var yAxis = "";
        var dataSourceLabel = "";
        var resultData = [];
        var metaData;
        var data;
        var dataSource;
        var vizData = api.data.data_visualization_api_for_table_data_source_1.output.result[0].response;

        if (vizData != null && vizData.data != null) {
            data = vizData.data;
        }
        if (vizData != null && vizData.metadata != null) {
            metaData = vizData.metadata;
        }

        if (data && metaData) { //when there is data in response
            xAxis = data[0][0];
            yAxis = data[0][1];
            for (var i = 1; i < data.length; i++) {
                var temp = data[i];

                const filteredElement = metaData.groupBy[0].elements.find((element) => element.id === temp[0]);
                resultData.push({
                    [xAxis]: filteredElement.label,
                    [yAxis]: temp[1]
                });
            }
            if (resultData.length > 0) {
                dataSource = { ...vizData,
                    data: resultData
                };
            }
        }

        if (dataSource != null) {
            api.setState('inputData', [dataSource]);
            api.setState('xAxis', await helpers.translate(metaData.groupBy[0].label));
            api.setState('yAxis', await helpers.translate(yAxis));
        } else {
            var noDataMessageTranslated = await helpers.translate("No data to display. Check the data format or set up the visualization correctly.");
            api.setState('noDataMessage', noDataMessageTranslated);
            api.setState('inputData', [{}]);
        }
    } else {
        var error = event.payload ?.errors[0];
        if (error && error.detail && error ?.message === "ACL Exception") {
            var translatedError = await helpers.translate(error.detail);
            api.setState('noDataMessage', translatedError);
            api.setState('inputData', [{}]);
        } else {
            var translatedError = await helpers.translate("An error has occurred while retrieving the data.");
            api.setState('noDataMessage', translatedError);
            api.setState('inputData', [{}]);
        }
    }
    var hideNavigationButton = !api.context.session.user.roles.includes('viz_creator') && !api.context.session.user.roles.includes('admin');
    api.setState('hideNavigationButton', hideNavigationButton);
    api.setState('hideLoader', true);
}
