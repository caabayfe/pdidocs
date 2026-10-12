/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
      const {
        classLabel,
        className,
        displayValue,
        relatedItems,
        sysId
    } = event.payload.data.output.result[0];

    let lead, lookupInfo = {}, output = '';
    if (displayValue && relatedItems.length) {
        lead = await helpers.translate('{0} has been created. Below is a summary of the lookup tables that have been updated:', displayValue);
    } else if (displayValue) {
        lead = await helpers.translate('{0} has been created.', displayValue);
    } else if (relatedItems.length) {
        lead = await helpers.translate('A new {0} CI has been created. Below is a summary of the lookup tables that have been updated:', classLabel);
    } else {
        lead = await helpers.translate('A new {0} CI has been created.', classLabel);
    }
    output += `<span>${lead}</span>`;
    for (const item of relatedItems) {
        const className = item.className;
        if(!lookupInfo.hasOwnProperty(className)) {
            lookupInfo[className] = {
                label: item.classLabel,
                count: 1
            };
        } else {
            lookupInfo[className].count++;
        }
    }
    for (const lookupClass in lookupInfo) {
        const currentClass = lookupInfo[lookupClass];
        let recordCountText = currentClass.count > 1
            ? await helpers.translate('{0} new records added to {1} table', currentClass.count, currentClass.label)
            : await helpers.translate('1 new record added to {0} table', currentClass.label);
        output += `<li>${recordCountText}</li>`;
    }
	api.setState('resultSummary', {
        html: output,
        sysId,
        className
    });
    helpers.modal.open('result_summary_modal', {
        headerLabel: await helpers.translate('New CI created'),
        size: 'md'
    });
}
