/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    let allClasses = await helpers.translate("All Classes");
    let useAllClasses = await helpers.translate("Use all classes");

    api.setState('classData' , ({ currentValue, api }) => {
        let classData = JSON.parse(JSON.stringify(currentValue));
        // Avaialble are all classses minus any that are currently selected.
        classData.available = currentValue.all.filter((o) => (!api.state.query.query_json.class_conditions.find(item => (item.class_name === o.id))));

        // AvailableWithAllOption are all classses plus the all option minus any that are currently selected 
        classData.availableWithAllOption = [{"id": "all","label": allClasses,"sublabel": useAllClasses}];
        classData.availableWithAllOption.push(...classData.available);

        return classData;
    });
}
