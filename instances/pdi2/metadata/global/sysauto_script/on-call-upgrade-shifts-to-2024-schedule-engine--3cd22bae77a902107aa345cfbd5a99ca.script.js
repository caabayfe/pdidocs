var rotaGR = new GlideRecord('cmn_rota');
rotaGR.addActiveQuery();
rotaGR.query();
var ocr = new OnCallRotation();
while (rotaGR.next()) {
    if (ocr.isShiftOnOldEngine(rotaGR))
        ocr.updateScheduleEngine(rotaGR);
}
