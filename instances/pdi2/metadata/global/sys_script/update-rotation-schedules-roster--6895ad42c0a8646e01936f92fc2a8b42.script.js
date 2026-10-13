// recompute the rotation schedules when the m2m or the roster definition change
var changedFieldNames = GlideScriptRecordUtil.get(current).getChangedFieldNames();
if (!(changedFieldNames.size() == 1 && changedFieldNames.get(0)+ '' === 'rotation_payload')) {
    var rotaGr = current.rota.getRefRecord();
    var onCallRotation = new OnCallRotation();
    if (onCallRotation.canAutoUpgradeToNewScheduleEngine(rotaGr)) {
        onCallRotation.upgradeShiftToNewScheduleEngine(rotaGr);
    } else if (onCallRotation.isShiftOnOldEngine(rotaGr)) {
        OnCallRotationRecalc.updateSchedules(current);
    } else {
        new OnCallRoster(current).updateRotationPayload();
    }
}
