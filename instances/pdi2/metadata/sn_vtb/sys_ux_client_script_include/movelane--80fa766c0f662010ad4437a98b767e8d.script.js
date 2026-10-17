function include({
    imports
}, {
    fromPosition,
    toPosition,
    id,
    lanes = [],
    hiddenLanes = []
}) {
    const {
        'sn_vtb.loadashUtil': loadashUtil,
        'sn_vtb.reorderLanes': reorderLanes
    } = imports;
    const {
        cloneDeep
    } = loadashUtil();

    const laneIds = lanes.filter((lane) => !hiddenLanes.includes(lane.sys_id));

    //fromPosition and toPosition are getting from now-visual-board
    //These are updated w.r.t hiddenLanes
    const fromPositionUpdated = lanes.findIndex((lane) => lane.sys_id === id);
    const toPositionSysId = laneIds[toPosition].sys_id;
    const toPositionUpdated = lanes.findIndex((lane) => lane.sys_id === toPositionSysId);
    const allLanes = cloneDeep(lanes);
    const laneObj = allLanes[fromPositionUpdated];

    // Delete from old position and insert at new position
    allLanes.splice(fromPositionUpdated, 1);
    allLanes.splice(toPositionUpdated, 0, laneObj);

    const laneIdList = allLanes.map((lane) => lane.sys_id);
    return reorderLanes({
        laneIdList,
        lanes: allLanes
    });
}
