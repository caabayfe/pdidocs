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
    if (event.elementId == "look_up_automated_finding_def") {
        let outOfScopeFindings = 0;
        const automatedTypeLabel = await helpers.translate('Automated');
        const automatedRows = (api.data.look_up_automated_finding_def.results.map(finding => {
            if(!api.state.projectData.touchPointEnabled && (finding.type.value == 'NODE_TOUCH_POINT_OUTLIER' || finding.type.value == 'EXTREME_NODE_TOUCH_POINT')){
                outOfScopeFindings ++;
            }
        return {
            key: finding.sys_id,
            selectionDisabled: true,
            cells: {
                category: {
                    value: finding.category.displayValue,
                    label: finding.category.displayValue,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.category.displayValue,
                        internalType: "string"
                    }
                },
                name: {
                    value: finding.name.displayValue,
                    label: finding.name.displayValue,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.name.displayValue,
                        internalType: "string"
                    }
                },
                type: {
                    value: `${automatedTypeLabel} (${finding.type.displayValue})`,
                    label: `${automatedTypeLabel} (${finding.type.displayValue})`,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.type.displayValue,
                        internalType: "string"
                    }
                },
                sys_updated_on: {
                    type: "string",
                    value: finding.sys_updated_on.value,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.sys_updated_on.value,
                        internalType: "glide_date_time"
                    }
                },
                sys_updated_by: {
                    value: finding.sys_updated_by.value,
                    label: null,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.sys_updated_by.value,
                        internalType: "string"
                    }
                },
                finding_type: {
                    value: "magic-fill",
                    color: "warning",
                    metadata: {
                        referenceSysId: null,
                        internalValue: 'automated',
                        internalType: "string"
                    }
                },
                impacted_kpis: {
                    value: finding.impacted_kpis.displayValue,
                    label: finding.impacted_kpis.displayValue,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.impacted_kpis.displayValue,
                        internalType: "string"
                    }
                },
            }
        };
    }));
        const rows = [...api.state.regularFindingRows, ...automatedRows];
        api.setState("rowDefinitions", {
            rows
        });
        const paginatedItems = rows.slice(api.state.page * 5, (api.state.page + 1) * 5);
        api.setState("paginatedItems", {
            rows: paginatedItems
        });
        api.setState("totalRecords", rows.length);
        api.setState("outOfScopeFindings", outOfScopeFindings);
        return;
    } else {
        const ruleBasedTypeLabel = await helpers.translate('Rule based');
        const rows = (api.data.look_up_finding_def.results.map(finding => ({
            key: finding.sys_id,
            selectionDisabled: true,
            cells: {
                category: {
                    value: finding.category.displayValue,
                    label: finding.category.displayValue,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.category.displayValue,
                        internalType: "string"
                    }
                },
                name: {
                    value: finding.message.displayValue,
                    label: finding.message.displayValue,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.message.displayValue,
                        internalType: "string"
                    }
                },
                type: {
                    value: `${ruleBasedTypeLabel} (${finding.subcategory.displayValue})`,
                    label: `${ruleBasedTypeLabel} (${finding.subcategory.displayValue})`,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.subcategory.displayValue,
                        internalType: "string"
                    }
                },
                impacted_kpis: {
                    value: finding.impacted_kpis.displayValue,
                    label: finding.impacted_kpis.displayValue,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.impacted_kpis.displayValue,
                        internalType: "string"
                    }
                },
                sys_updated_on: {
                    type: "string",
                    value: finding.sys_updated_on.value,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.sys_updated_on.value,
                        internalType: "glide_date_time"
                    }
                },
                sys_updated_by: {
                    value: finding.sys_updated_by.displayValue,
                    label: null,
                    metadata: {
                        referenceSysId: null,
                        internalValue: finding.sys_updated_by.displayValue,
                        internalType: "string"
                    }
                },
                finding_type: {
                    value: "",
                    color: "warning"
                },
            }
        })));

        api.setState('regularFindingRows', rows);
        api.data.look_up_automated_finding_def.refresh();
    }
}
