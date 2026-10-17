function include({
    imports
}, {
    lanes,
    laneIdList
}) {
    const {
        'sn_vtb.loadashUtil': loadashUtil
    } = imports;
    const {
        cloneDeep
    } = loadashUtil();

    const cLanes = cloneDeep(lanes);
    const storeLaneObjs = {};
    cLanes.forEach((lane) => (storeLaneObjs[lane.sys_id] = lane));
    let reorderedLanes;

    // Reordered lane id's may contain lanes that do not yet exist in the board, filter them out
    const lReorderedIds = laneIdList.filter((id) => storeLaneObjs[id]);
    if (lReorderedIds.length > 0) {
        reorderedLanes = lReorderedIds.map((laneId, index) => {
            const lane = storeLaneObjs[laneId];
            lane.order = laneIdList.indexOf(laneId);
            return lane;
        });
    }

    return lReorderedIds.length > 0 ? reorderedLanes : cLanes
}
