/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {month, industry, sizeBucket, region} = api.context.props.headerInfo;
    const translatedNA = await helpers.translate("N/A");
    var summaryStackDetails = [{
      "label" : await helpers.translate("Summary of"),
      "value" : month || translatedNA
    },
    {
        "label": await helpers.translate("Your industry"),
        "value": industry || translatedNA
    },
    {
      "label" : await helpers.translate("Number of users"),
      "value" : sizeBucket || translatedNA
    },
    {
      "label" : await helpers.translate("Region"),
      "value" : region || translatedNA
    }
    ];
    api.setState("summaryHeaderDetails",summaryStackDetails);
}
