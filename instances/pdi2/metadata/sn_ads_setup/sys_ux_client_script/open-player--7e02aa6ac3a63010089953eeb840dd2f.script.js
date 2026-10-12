function handler({
    api,
    event,
    helpers,
    imports
}) {

    const timestamp = new Date().getTime();
    if (event.name === "NOW_LIST#CELL_LINK_CLICKED") {
        let interactionSysId = event.payload.context.row.cells["hui_sys_id"].value;
        let setupSysId = event.payload.context.row.cells["hg_process_definition.label"].metadata.openRecordMetadata.sysId;
        let extraParams = "";
        let type = event.payload.context.row.cells["hui_guidance.setup_execution_type"].metadata.internalValue;
        if (type === "multiple") {
            extraParams = `/interaction-id/${interactionSysId}`;
        }
        let url = `/now/adoptionservices/setup/${setupSysId}/params/custom-id/${timestamp}` + extraParams;
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: url,
                target: "_blank"
            }
        });
    }
}
