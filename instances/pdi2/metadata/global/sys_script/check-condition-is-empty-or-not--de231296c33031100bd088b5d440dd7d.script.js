(function executeRule(current, previous /*null when async*/ ) {
    var normalArr = replaceAndOr(current.condition);
    if (checkIsEmpty(normalArr)) {
        var msg = gs.getMessage('Security Attribute {0} condition cannot be empty ',current.condition);
        gs.addErrorMessage(msg);
        current.setAbortAction(true);
    }
})(current, previous);

function checkIsEmpty(arr) {
    var operator = ["STARTSWITH", "ENDSWITH", "ISEMPTY", "NOT LIKE", "LIKE", ">=", "<=", ">", "<", "!=", "="];
    for (var i = 0; i < operator.length; i++) {
        for (var j = 0; j < arr.length; j++) {
            if (arr[j].indexOf(operator[i]) > -1) {
                var val = arr[j].split(operator[i])[1];

                if (val == "" && operator[i] != "ISEMPTY") {
                    return true;
                }
            }

        }
    }
    return false;
}

function replaceAndOr(condition) {
    var andOp = "^AND";
    var orOp = "^OR";
    var repDel = "##";
    condition = condition.replaceAll(andOp, repDel);
    condition = condition.replaceAll(orOp, repDel);
    var normalArr = condition.split(repDel);
    return normalArr;

}
