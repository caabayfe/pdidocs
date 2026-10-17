(function executeRule(current, previous /*null when async*/) {

	gs.addInfoMessage(gs.getMessage("This RCA record has an associated signature record and its fields have been made read-only. If this record is edited, its signature will become invalid and this RCA record will deny access by default."));

})(current, previous);
