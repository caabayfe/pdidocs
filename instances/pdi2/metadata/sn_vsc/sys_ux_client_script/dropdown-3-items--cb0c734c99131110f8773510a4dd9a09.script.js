/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var list = {};
    var dropdownList = [];
    var secondDatesData = api.state.secondDropdownListData;

    secondDatesData.map((record) => {
        if (record.id == "123") {
            list = {
                "id": record.id,
                "label": record.displayLabel
            };
        } else {
            list = {
                "id": record.id,
                "label": record.displayLabel,
                "sublabel": record.time + " | " + record.result
            };
        }
        dropdownList.push(list);
    });

    return dropdownList;
}
