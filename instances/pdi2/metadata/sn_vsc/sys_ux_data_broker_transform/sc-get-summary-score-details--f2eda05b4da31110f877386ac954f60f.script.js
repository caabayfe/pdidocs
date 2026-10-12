function transform(input) {
    var prevScore = 0;
    var currScore = 0;
    var currScoreDate = "";
    var arrowDir = "";
    var prevScoreDate = "";
    var updatedSettings = 0;
    var n = 0;

    // get last 2 compliance scores and their calculation date
    var gr = new GlideRecord('sn_vsc_hardening_compliance_scores');
    gr.orderByDesc('harc_collected');
    gr.query();

    while (gr.next()) {
        if (n == 0) {
            currScore = parseInt(gr.getValue('harc_score'));
            currScoreDate = new GlideDateTime(gr.getValue("harc_collected")).getDisplayValue();
        } else {
            // if there is more than 1 record with same date in hardening compliance score, get previous scan date not equal to current scan date 
            var prevHarcDate = new GlideDateTime(gr.getValue("harc_collected")).getDisplayValue();
            if (prevHarcDate.split(" ")[0] != currScoreDate.split(" ")[0]) {
                prevScore = parseInt(gr.getValue('harc_score'));
                prevScoreDate = prevHarcDate;
                break;
            }

        }
        n++;
    }

    // if there is no previous run/score, set it with current compliance score 
    if (prevScore == 0) {
	prevScore = currScore;
        prevScoreDate = currScoreDate;
    }

    // set the arrow direction based on current and previous score
    if (currScore < prevScore) {
        arrowDir = "down";
    } else if (currScore > prevScore) {
        arrowDir = "up";
    }

    // get the most affected security area and priority of updated settings
    var scUtil = new sn_vsc.SCComparisonUtil();
    if (currScoreDate != prevScoreDate) { //ensure changed settings are from different dates
        var grSettings = scUtil.getUpdatedSettings(currScoreDate, prevScoreDate);
        if (grSettings) {
            updatedSettings = grSettings.getRowCount();
        }

        var securityArea = scUtil.mostRepeatedSecurityArea(currScoreDate, prevScoreDate);
        var priority = scUtil.getAllPriorityForSecurityArea(securityArea, currScoreDate, prevScoreDate);
    }
	

    // return all the summary data 
    return [{
        "changeFromPrev": currScore - prevScore,
        "currScore": currScore + "%",
        "prevScore": prevScore + "%",
        "arrowDirection": arrowDir,
        "previousScoreDate": prevScoreDate,
        "updatedSettings": updatedSettings,
        "securityArea": securityArea,
        "priority": priority
    }];

}
