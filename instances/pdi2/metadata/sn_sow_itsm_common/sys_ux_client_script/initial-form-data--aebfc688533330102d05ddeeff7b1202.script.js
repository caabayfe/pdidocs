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
    const eventName = event.name;
    const table = api.context.props.table;
    const sysId = api.context.props.sysId;
    const modalPath = api.context.props.modalPath;
    let requiredFields = api.context.props.requiredFields;
    let sowFormModal = imports["sn_sow_itsm_common.SOWFormModal"]();
    const translations = {
        "Resolve": await helpers.translate("Resolve"),
        "Assign": await helpers.translate("Assign"),
        "Save": await helpers.translate("Save"),
        "Cancel": await helpers.translate("Cancel")
    };
    let fields;
    if (!api.context.props.fields) {
        api.setState("gform", {
            table: table,
            sysId: sysId
        });
    } else {
        fields = JSON.parse(api.context.props.fields);
    }

    const getObjectIndex = (obj, name) => {
        const len = obj.length;
        if (len == 0) {
            return -1;
        }
        return obj.findIndex((ele) => ele.name == name);
    };

    const getInitialData = () => {
        if (!requiredFields) {
            requiredFields = sowFormModal.getRequiredFields(modalPath);
        }
        let fieldMap = sowFormModal.getFieldMap(fields, requiredFields);
        let sectionMap = sowFormModal.getSectionMap(requiredFields, modalPath);
        let initializeFields = sowFormModal.getInitializeFields(modalPath);
        if (typeof initializeFields == "function") {
            initializeFields(fields);
        }
        api.setState('fieldMap', fieldMap);
        api.setState('section', sectionMap);
        api.setState('requiredFields', requiredFields);

        var resolutionConfig = api.data.get_resolution_config_1.output;
        api.setState('resolutionConfig', api.data.get_resolution_config_1.output);
        var configFields = resolutionConfig && resolutionConfig.fields ? resolutionConfig.fields : {};
        var isCloseNotesApplicable = configFields['close_notes'] && ('close_notes' in fieldMap) && !fieldMap['close_notes'].value;
        var isCloseCodeApplicable = configFields['close_code'] && ('close_code' in fieldMap) && !fieldMap['close_code'].value;
        if (isCloseNotesApplicable || isCloseCodeApplicable) {
            api.data.get_resolution_details.refresh();
        } else {
            api.setState('fields', fieldMap);
        }
    };

    const updateLabel = () => {
        let saveLabel = translations["Save"];
        let cancelLabel = translations["Cancel"];
        if (api.context.props.saveLabel) {
            saveLabel = translations[api.context.props.saveLabel] || api.context.props.saveLabel;
        }
        if (api.context.props.cancelLabel) {
            cancelLabel = translations[api.context.props.cancelLabel] || api.context.props.cancelLabel;
        }
        api.setState("saveLabel", saveLabel);
        api.setState("cancelLabel", cancelLabel);
    };

    const updateFieldValues = () => {
        for (let i = 1; i <= 3; i++) {
            let field = api.context.props["field" + i];
            let value = api.context.props["value" + i];
            let displayValue = api.context.props["displayValue" + i];
            if (field && value && displayValue) {
                fields[field].value = value;
                fields[field].displayValue = displayValue;
            }
        }
    };

    switch (eventName) {
        case 'MACROPONENT_READY':
            if (fields) {
                updateFieldValues();
                getInitialData();
            }
            updateLabel();
            const heading = translations[api.context.props.title] || api.context.props.title;
            api.setState("heading", heading);
            break;
        case 'SN_FORM_DATA_CONNECTED#FETCH_STATUS_UPDATED':
            api.setState("gform", {
                "table": "",
                "sysId": ""
            });
            fields = api.data.gform.nowRecordFormBlob.fields;
            updateFieldValues();
            getInitialData();
            break;
    }
}
