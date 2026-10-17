answer = false;
if (!gs.nil(current.automated_finding)) {
    answer = new global.ProminACLUtil(current.automated_finding.project).canRead();
} else if (!gs.nil(current.rule_finding)) {
    answer = new global.ProminACLUtil(current.rule_finding.project).canRead();
}
