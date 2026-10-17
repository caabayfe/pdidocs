function handler({
    api,
    event,
    helpers,
    imports
}) {

    const timestamp = new Date().getTime();
    let moduleURL = `/now/adoptionservices`;

    if (event.name === "NOW_LIST#CELL_LINK_CLICKED") {
        let columnClicked = event.payload.context.columnKey;
        if (columnClicked === "action") {
            let setupId = event.payload.context.row.key;
            let url = `${moduleURL}/execution-history/${setupId}`;
            api.emit("NAV_ITEM_SELECTED", {
                external: {
                    url: url,
                    target: "_self"
                }
            });

        } else if (columnClicked === "process_definition.label") {
            let setup = event.payload.cell.metadata.openRecordMetadata;
            let setupSysId = setup.sysId;
            api.setState('clickedSetupId', setupSysId);

            let executionType = event.payload.context.row.cells.setup_execution_type.metadata.internalValue;
            let skipExecutionPage = event.payload.context.row.cells.skip_execution_page.metadata.internalValue;
            let checklist = event.payload.context.row.cells.checklist.metadata.internalValue;
            api.setState('skipExecutionPage', skipExecutionPage);
            api.setState('setupHasChecklist', Boolean(checklist));

            if (executionType == "multiple") {

                let setupName = setup.displayValue;
                api.setState('clickedSetupName', setupName);

                let setupStatus = event.payload.context.row.cells.interaction_status.metadata.internalValue;

                if (setupStatus == "NOT_STARTED" || setupStatus == "COMPLETE") {
                    if (skipExecutionPage == "false") {
                        let url = `${moduleURL}/create-execution/${setupSysId}/params/prev-route/home`;
                        api.emit("NAV_ITEM_SELECTED", {
                            external: {
                                url: url,
                                target: "_blank"
                            }
                        });
                    } else {
                        api.data.create_interaction_record_1.execute({
                            setupId: setupSysId,
                            fields: [{
                                "sys_id": "-1"
                            }]
                        });
                    }


                } else {

                    helpers.modal.open('custom_1', {
                        bare: true
                    });
                }
            } else {
                let executionStatus = event.payload.context.row.cells.interaction_status.metadata.internalValue;
                let checklistContent = event.payload.context.row.cells.checklist.metadata.internalValue.trim();
                let url;
                if (executionStatus == "NOT_STARTED" && checklistContent) {
                    url = `${moduleURL}/checklist/${setupSysId}`;
                } else {
                    url = `${moduleURL}/setup/${setupSysId}`;

                }
                api.emit("NAV_ITEM_SELECTED", {
                    external: {
                        url: url,
                        target: "_blank"
                    }
                });
            }

        }
    }
}
