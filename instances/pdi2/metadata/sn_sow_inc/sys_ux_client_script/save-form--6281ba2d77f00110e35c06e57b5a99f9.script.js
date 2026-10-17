/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let { elementId } = event;
    let formSection = elementId.substring(0, elementId.indexOf('_'));
    
    let obj = {
        table: api.context.props.table,
        sys_id: api.context.props.sysId,
        data: {}
    };

    var summaryLookup = [];
    if(elementId == "summary_save"){
        var fields = api.state.fieldsCopy;
        var title = await helpers.translate("Record update");
        var showModal = false;
        var formData = api.data.retrieve_form_section_layout.output.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query;
        var sectionLayout = formData.formLayout.sectionLayout;

        sectionLayout.forEach(function(section) {
            if (section.caption === "summary_lookup") {
                section.rows.forEach(function(row) {
                    row.forEach(function(item) {
                        item.fields.forEach(function(field) {
                            summaryLookup.push(field);
                        });
                    });
                });
            }
        });

        var dirtyFields = api.state.dirtyFields;
        for(var field of summaryLookup) {
            if(field == "work_notes" && (!dirtyFields[formSection] ||  (dirtyFields[formSection] && !dirtyFields[formSection].includes("impact") && !dirtyFields[formSection].includes("urgency")))) {
                continue;
            }
            if(fields[field] && fields[field].mandatory && !fields[field].value){
                showModal = true;
                break;
            }
        }

        for(var field in fields){
            if(fields[field] && fields[field].value != fields[field].originalValue){
                if(fields[field].mandatory && fields[field].value == "") {
                    showModal = false;
                    break;
                }
            }
        }
      
        if(showModal) {
            let data = {
                ...api.state.sectionConfig
            };
            data[formSection] = {
                ...api.state.sectionConfig[formSection],
                showErrorMessage: false,
            };
            api.setState("sectionConfig", data);
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                viewportElementId: 'modal_viewport',
                route: 'sowformmodalv2',
                fields: {
                    table: api.data.record.table,
                    sysId: api.data.record.sysId,
                    title: "",
                    view: "sow_incident_summary_modal"
                },
                params: {
                    "parentFormFields": JSON.stringify(fields),
                    "isGFormSave": "false",
                    "hideOptionalFields": "true",
                    "onclickAppseeEvent":"Click Save Incident Modal Action",
                    "modalTitle": title
                }
            });
            return;
        }
    }
    
    let isMandatoryFieldFilled = true;
    let emptyFieldsLabel = [];
    var sowIncidentOverview = imports['sn_sow_inc.SowIncidentOverview']();

    var sections = sowIncidentOverview.getOverviewCards()[formSection];
    for(var i=0; i < sections.length; i++){
        handleForm(sections[i]);
    }
    
    function handleForm(formSection){  
        let fields = api.state.sectionConfig[formSection].fields;
        for (let i = 0; i < fields.length; i++) {
            if(api.context.props.fields[fields[i]] && api.context.props.fields[fields[i]].readonly || summaryLookup.includes(fields[i])) continue;
            if (api.context.props.fields[fields[i]] && api.context.props.fields[fields[i]].mandatory == true && api.context.props.fields[fields[i]].value == "") {
                isMandatoryFieldFilled = false;
                emptyFieldsLabel.push(api.context.props.fields[fields[i]].label);
            }
            if (api.state.fieldsCopy[fields[i]] && !api.state.fieldsCopy[fields[i]].readonly)
                obj.data[fields[i]] = api.context.props.fields[fields[i]].value;
        }   
    }
    
    if (!isMandatoryFieldFilled) {
        let errorMessage = await helpers.translate("The following mandatory fields are not filled in: {0}", emptyFieldsLabel.join(", "));
        let data = {
            ...api.state.sectionConfig
        };
        data[formSection] = {
            ...api.state.sectionConfig[formSection],
            showErrorMessage: true,
            errorMessage: errorMessage
        };
        api.setState("sectionConfig", data);
    } else {
        obj.data = JSON.stringify(obj.data);
        if(!showModal) api.data["update_incident_"+formSection].execute(obj);
    }
    api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
        event: "Update Incident from Overview Tab",
        value: {
            section: formSection
        }
    });
}
