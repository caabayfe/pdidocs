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
    var data = event.payload.data.output.active_skills;
    var allNonCompliantSkills = event.payload.data.output.all_skills.map(skill=>skill.id);
    var rowsDataActionsDisabled = {
            "selectionEnabled": false,
            "rows": [],
            "has_edit_access": event.payload.data.output?.has_edit_access
        };
    var rowsData = rowsDataActionsDisabled;
    api.data.fetch_allowed_providers.execute({
            page_number:"",
            search_term:"",
            type:"FETCH_ALLOWED_PROVIDERS_FROM_AICT",
            payload:{}
        });
    if (event.payload.data.output?.has_edit_access && data.length>0) {
        helpers.modal.open("bulk_deactivation_of_non_complaint_skills");
        var activeText= await helpers.translate("Active");
        var oobText = await helpers.translate("OOB");
        var customText = await helpers.translate("Custom");
        data.forEach(skill=>{
            rowsData.rows.push({
                "key": skill.id,
                "domain": skill.domain,
                "cells": {
                    "name": {
                        "value": skill.name,
                        "label": skill.name,
                        "id": skill.name,
                    },
                    "product": {
                        "value": skill.product,
                        "id": skill.product,
                        "label": skill.product
                    },
                    "type": {
                        "value": skill.type === "oob" ? oobText: customText,
                    },
                    "status": {
                        "componentProps": {
                            size: 'md',
                            icon: 'circle-fill',
                            style:{
                                color:'rgb(var(--now-color_alert--positive-2))'
                            },
                            display: 'flex'
                        }
                    },
                    "provider": {
                        "value": skill.providerName,
                        "id": skill.providerName,
                        "label": skill.providerName
                    },
                }
            });
        });
    }
    var columnsData = {
            "columns": [
                {
                    "key": "status",
                    "type": "custom",
                    "componentTag": "now-icon",
                    "label": "Status",
                    "headerCellAlignment":"inverse"
                },
                {
                    "key": "name",
                    "type": "string",
                    "label":"Skill name",
                    "cellEditingDisabled": true
                },
                {
                    "key": "product",
                    "type": "string",
                    "label":"Product",
                    "cellEditingDisabled": true
                },
                {
                    "key": "type",
                    "type": "string",
                    "label":"Type",
                    "cellEditingDisabled": true
                },
                {
                    "key": "provider",
                    "type": "string",
                    "label": "Current Provider",
                    "cellEditingDisabled": true
                },
            ]
        };
    api.setState("nonComplaintSkills",rowsData);
    api.setState("nonComplaintSkillsColumnsData",columnsData);
    api.setState("allNonCompliantSkills", allNonCompliantSkills);
    api.setState("isFallbackEnabled", event.payload.data.output?.fallback);
}
