(function executeRule(current, previous /*null when async*/ ) {
    if (gs.nil(current.rota)) return;
    var rotaGr = current.rota.getRefRecord();
    g_scratchpad.isShiftOnOldEngine = new OnCallRotation().isShiftOnOldEngine(rotaGr);
})(current, previous);
