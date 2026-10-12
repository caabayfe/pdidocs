var summary = new global.JSON().decode(event.parm1);
var uuidComment = summary.thresholdCheck.uuidComment;
var grIndicator = new GlideRecord('pa_indicators');
grIndicator.addEncodedQuery('sys_package=a51d46e3f2014110366b10017c5ba675^sys_id=' + uuidComment);
grIndicator.query();
if (grIndicator.hasNext()) {
    var user = null;
    if (summary.thresholdCheck.personal) {
        user = event.parm2;
    }
    var scoreIntegerDate = summary.scoreIntegerDate;
    var message = buildMessage(summary);
    appendScoreNote(message, uuidComment, scoreIntegerDate, user);
}

function buildMessage(summary) {
    var scoreDate = summary.scoreDate;

    var thresholdCheck = summary.thresholdCheck;

    var uuidString = thresholdCheck.uuidString;

    var message = scoreDate + ": " + uuidString + ": ";

    var unit = thresholdCheck.unit;

    if (typeof unit == 'undefined') {
        unit = '';
    }

    var condition = thresholdCheck.condition;

    var thresholdLevel = thresholdCheck.thresholdLevel;

    if (typeof thresholdLevel != 'undefined') {
        condition += ' ' + thresholdLevel;
        if (unit != '') {
            condition += ' ' + unit;
        }
    }
    return message + condition + ': ' + thresholdCheck.matchingScore + ' ' + unit;
}

function appendScoreNote(message, uuid, scoreDate, user) {
    var gr = new GlideRecord("sn_vsc_metric_threshold_event");
    gr.addQuery("metric", uuid);
    gr.addQuery("score_date", scoreDate);
    gr.addQuery("user", user);
    gr.query();
    if (gr.next()) {
        gr.setValue("score_notes", message + "\n\n" + gr.getValue("score_notes"));
        gr.update();
    } else {
        gr = new GlideRecord("sn_vsc_metric_threshold_event");
        gr.setValue("metric", uuid);
        gr.setValue("score_notes", message);
        gr.setValue('score_date', scoreDate);
        gr.setValue("user", user);
        gr.insert();
    }
}
