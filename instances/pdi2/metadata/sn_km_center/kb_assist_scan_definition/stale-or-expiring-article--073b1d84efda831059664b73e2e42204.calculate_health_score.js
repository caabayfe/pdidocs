function calculateHealthScore() {
    var scoreUtil = new sn_km_center.AOScansHealthScoreUtil();
    healthScore = scoreUtil.calculateBinaryScore(results);
}
calculateHealthScore();
