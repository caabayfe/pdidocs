function transform(input) {
    var table = input.table;
    var completenessScore = input.completenessScore.result;
    var correctnessScore = input.correctnessScore.result;
    var complianceScore = input.complianceScore.result;
    var relationshipScore = input.relationshipScore.result;
    var attestationScore = input.attestationScore[table]._results[0];

    var outputHealthScores = {};
    outputHealthScores = {
        'completenessScore': completenessScore,
        'correctnessScore': correctnessScore,
        'complianceScore': complianceScore,
        'relationshipScore': relationshipScore,
        'attestationScore': [{
            "friendly_name": "Status",
            "color": getColor(attestationScore.attestation_status.value),
            "metric": "STATUS",
            "active": true,
            "value": attestationScore.attestation_status.displayValue
        },
		{
            "friendly_name":  "Attested on",
            "color": -1,
            "metric": "ATTESTED_ON",
            "active": true,
            "value": attestationScore.attested_date.displayValue
        }]
    };
	
    return outputHealthScores;


    function getColor(value) {
		if (!value || value == "Not Yet Reviewed")
			return -1;   // low

        if (value == "Attested")
            return 0;  // positive
			
        if (value == "Rejected")
            return 2;  // critical
    }
}
