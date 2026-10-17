/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   
    // Set State values using data 
    const results = api.data.getSettings.output;

    var settingsStatus = JSON.parse(JSON.stringify(api.state.settingsStatus));
    // Max Number of records
    api.setState('maxNumberOfRecords', results.maxRecordsToProcess);
    settingsStatus.maxNumberOfRecords.value = results.maxRecordsToProcess;
    settingsStatus.maxNumberOfRecords.valid = true;

    // Not reporting max days
    api.setState('notReportingMaxDays', results.notReportingMaxDays);
    settingsStatus.notReportingMaxDays.value = results.notReportingMaxDays;
    settingsStatus.notReportingMaxDays.valid = true;

    api.setState('settingsStatus',settingsStatus);

    // Coverage Classes
    api.setState('coverageClasses',results.coverageClasses);

    // Data Mismatch Classes
    api.setState('dataMismatchClasses',results.dataMismatchClasses);

    // Weight Options
    let coverageWeightsOptionsSelected = results.coverageWeightType ? results.coverageWeightType : "automatic";
    let dataMismatchWeightsOptionsSelected = results.dataMismatchWeightType ? results.dataMismatchWeightType : "automatic";
    
    // Fix for Radio buttons
    var dataMismatchWeightOptions = api.state.dataMismatchWeightsOptions.map((x) => x);
    dataMismatchWeightOptions.forEach(item => item.checked = (item.id === dataMismatchWeightsOptionsSelected));
    api.setState('dataMismatchWeightsOptions',dataMismatchWeightOptions);

    var coverageWeightOptions = api.state.coverageWeightsOptions.map((x) => x);
    coverageWeightOptions.forEach(item => item.checked = (item.id === coverageWeightsOptionsSelected));
    api.setState('coverageWeightsOptions',coverageWeightOptions);

    api.setState('coverageWeightsType',coverageWeightsOptionsSelected);
    api.setState('dataMismatchWeightsType',dataMismatchWeightsOptionsSelected);

}
