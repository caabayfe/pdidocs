answer = getComplianceScore();

function getComplianceScore() {
    var sc = new SNC.PAScorecard();
    sc.addParam('uuid', 'c725162518678110f877e53e0f01871f');
    var result = sc.query();
    return result[0].value;
}
