var lfUtil = new LiveFeedUtil();
var reply = lfUtil.extractMessageFromEmail(email.body_text);
lfUtil.addReplyByEmail(current, reply);
