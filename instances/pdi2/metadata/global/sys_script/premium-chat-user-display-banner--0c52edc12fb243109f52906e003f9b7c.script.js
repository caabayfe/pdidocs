(function executeRule(current, previous /*null when async*/) {
	var langCode = gs.getSession().getLanguage();
    var msg = gs.getMessageLang('This user record is used by Premium Chat to support its connection to Glide. It is an expected system account and is required for the product to function. No action is needed.', langCode);
    gs.addInfoMessage(msg);
})(current, previous);
