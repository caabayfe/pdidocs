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
    if (event.elementId == "save_exit" || (api.state.exit && event.elementId == "confirm_retired")) {
        api.setState('exit', true);
    } else {
        api.setState('exit', false);
    }
    if (api.state.isEditing) {
        const originalTemplateType = api.state.originalTemplateType;
        const projectTemplateDetails = { ...api.state.projectTemplateDetails
        };
        const missingFields = [];
        let projectName = api.state.projectDetails.name;
        projectName = stripTranslationPrefix(projectName);

        if (!projectName.trim()) {
            missingFields.push(await helpers.translate('Name'));
        }
        if (!api.state.hideKPISection && !(api.state.selectedkpiDashboard || api.state.projectDetails.paDashboardId)) {
            missingFields.push(await helpers.translate('KPI dashboard'));
        }
        if (!api.state.projectDetails.sourceType) {
            missingFields.push(await helpers.translate('Source type'));
        }
        if (!api.state.projectDetails.source) {
            missingFields.push(await helpers.translate('Table'));
        }
        if (missingFields.length > 0) {
            api.setState('alertMessage', await helpers.translate('The following mandatory fields are not filled in: {0}', missingFields.join(', ')));
            api.setState('isAlertHidden', false);
        } else if (projectTemplateDetails.isTemplate && projectTemplateDetails.templateType.selectedValue !== originalTemplateType) {
            api.data.validate_entity_template_update.execute({
                entityPayload: JSON.stringify({
                    table: getTableName(),
                }),
                templateType: projectTemplateDetails.templateType.selectedValue,
            });
        } else {
            const updatedFields = {
                name: projectName,
                short_description: api.state.projectDetails.description || '',
                par_dashboard_id: api.state.selectedkpiDashboard || api.state.projectDetails.paDashboardId || '',
                status: api.state.projectTemplateDetails.isTemplate ? 'PUBLISHED' : api.state.projectStatus || api.state.projectDetails.status,
                template_type: api.state.projectTemplateDetails.templateType.selectedValue,
                is_le_progress: api.state.is_le_progress,
                auto_retire: api.state.autoRetire.value,
                restricted: api.state.restricted
            };
            const templateFields = Object.entries(updatedFields)
                .map(([key, value]) => `${key}=${value}`)
                .join('^');
            api.data.edit_promin_project.execute({
                'table': 'promin_project',
                'recordId': api.context.props.projectId,
                'templateFields': templateFields,
                'useSetDisplayValue': false
            });
        }
        return;
    }
    if (api.state.templateId == "") {
        const missingFields = [];
        if (api.state.projectDetails.name.trim() === "") {
            missingFields.push(await helpers.translate('Name'));
        }
        if (!api.state.selectedSourceValue) {
            missingFields.push(await helpers.translate(api.state.sourceTypeName) || await helpers.translate('Source'));
        }
        if (api.state.projectTemplateDetails.isTemplate && !api.state.projectTemplateDetails.templateType.selectedValue) {
            missingFields.push(await helpers.translate('Template type'));
        }
        if (!api.state.hideKPISection && !api.state.selectedkpiDashboard) {
            missingFields.push(await helpers.translate('KPI dashboard'));
        }
        if (missingFields.length > 0) {
            api.setState('alertMessage', await helpers.translate('The following mandatory fields are not filled in: {0}', missingFields.join(', ')));
            api.setState('isAlertHidden', false);
        } else if (api.state.projectTemplateDetails.isTemplate && api.state.sourceType === 'PLAYBOOK_DATA') {
            api.setState('alertMessage', await helpers.translate('Source type Playbook is not valid for template creation'));
            api.setState('isAlertHidden', false);
        } else if (!api.state.projectTemplateDetails.isTemplate) {
            if (api.state.sourceType !== 'EXTERNAL_DATA'
                && api.state.sourceType !== 'ARCHIVED_DATA'
                && api.state.sourceType !== 'AGENTIC_AI_DATA'
                && api.state.sourceType !== 'PLAYBOOK_DATA') {
                api.data.is_primary_entity_valid.execute({
                    tableName: api.state.selectedSourceValue,
                });
            } else if (api.state.sourceType == 'PLAYBOOK_DATA') {
                api.data.create_new_playbook_project.execute({
                    playbookId: api.state.selectedDataSourceID,
                    projectName: api.state.projectDetails.name,
                    description: api.state.projectDetails.description,
                    filterCondition: "",
                    restricted: api.state.restricted,
                    autoRetire: api.state.autoRetire.value,
                });
            } else {
                const updatedFields = {
                    name: api.state.projectDetails.name,
                    short_description: api.state.projectDetails.description,
                    ...(api.state.selectedkpiDashboard ? {
                        par_dashboard_id: api.state.selectedkpiDashboard
                    } : {}),
                    status: api.state.projectStatus,
                    auto_retire: api.state.autoRetire.value,
                    restricted: api.state.restricted
                };

                const templateFields = Object.entries(updatedFields)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('^');
                api.data.create_record_1.execute({
                    'table': 'promin_project',
                    'templateFields': templateFields,
                    'useSetDisplayValue': false
                });
            }
        } else if (api.state.projectTemplateDetails.isTemplate) {
            api.data.validate_entity_template.execute({
                entityPayload: JSON.stringify({
                    table: api.state.selectedSourceValue,
                }),
                templateType: api.state.projectTemplateDetails.templateType.selectedValue,
            });
        }
    } else if (api.state.templateId != "") {
        const missingFields = [];
        if (api.state.projectDetails.name.trim() === "") {
            missingFields.push(await helpers.translate('Name'));
        }
        if (!api.state.hideKPISection && !api.state.selectedkpiDashboard) {
            missingFields.push(await helpers.translate('KPI dashboard'));
        }
        if (missingFields.length > 0) {
            api.setState('alertMessage', await helpers.translate('The following mandatory fields are not filled in: {0}', missingFields.join(', ')));
            api.setState('isAlertHidden', false);
        } else {
            helpers.modal.open("[component-id$='template_prefilled_confirmation']");
        }
    }

    function getTableName() {
        const regExp = /\(([^)]+)\)/;
        const matches = regExp.exec(api.state.projectDetails.source);

        // matches[1] contains the value between the parentheses i.e. table name
        return matches[1];
    }

    function stripTranslationPrefix(str) {
        const searchString = 'TRF:';
        const translationPrefixIndex = str.lastIndexOf(searchString);
        if (translationPrefixIndex !== -1) {
            str = str.substring(translationPrefixIndex + searchString.length).trim();
        }
        return str;
    }
}
