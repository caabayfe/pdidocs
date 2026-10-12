/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */

function evaluateProperty({
    api,
    helpers
}) {

    if (api.state.selectedStage != "summary") {
        return;
    }
    const findingDetails = [];
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    const pattern = api.state.automatedFindingForm.type.list.find((type) => type.id == api.state.automatedFindingForm.type.value);
    const category = api.state.automatedFindingForm.category.list.find((category) => category.id == automatedFindingForm.category.selectedValue);
    const fields = api.state.automatedFindingForm.fields.listItems.find((field) => field.id == automatedFindingForm.fields.value);
    let impactedKpiLabels = [];
    if (automatedFindingForm.impacted_kpi.selectedItems.length > 0) {
        impactedKpiLabels = automatedFindingForm.impacted_kpi.selectedItems.map((item) => item.label);
    }
    findingDetails.push({
        "label": helpers.translateSync("Name"),
        "value": {
            "type": "string",
            "value": automatedFindingForm.findingName.value
        }
    }, {
        "label": automatedFindingForm.name.applyToSource == "project" ? helpers.translateSync("Apply to project") : helpers.translateSync("Apply to process"),
        "value": {
            "type": "string",
            "value": automatedFindingForm.name.value
        }
    }, {
        "label": helpers.translateSync("Table"),
        "value": {
            "type": "string",
            "value": automatedFindingForm.table.selectedValue
        }
    }, {
        "label": helpers.translateSync("Type"),
        "value": {
            "type": "string",
            "value": pattern?.label
        }
    }, {
        "label": helpers.translateSync("Field"),
        "value": {
            "type": "string",
            "value": fields?.label
        }
    }, {
        "label": helpers.translateSync("Category"),
        "value": {
            "type": "string",
            "value": category?.label
        }
    }, {
        "label": helpers.translateSync("Impacted KPIs"),
        "value": {
            "type": "string",
            "value": impactedKpiLabels.join(', ')
        }
    }, {
        "label": helpers.translateSync("Active"),
        "value": {
            "type": "string",
            "value": automatedFindingForm.active.value == true ? "True" : "False"
        }
    });

    return findingDetails;
}
