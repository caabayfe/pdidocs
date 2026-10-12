(function postToFeed() {
	var util = new LiveFeedUtil();

	var msg = request.message;
	var userID = request.user;
	var profileID = request.profile;
	var groupID = request.group;
	var linkUrl = request.linkurl;
	var linkName = request.linkname;

	if (profileID) {
		// Checking if profile id is valid
		if (!util.getProfileUserID(profileID))
			return;
	} else if (userID) {
		// find/create live profile from user sys_id
		profileID = util.getUserProfile(userID);
	} // else session user profile is used

	msg = JSUtil.unescapeText(msg);

	//copy url to name if we don't have a name
	if (linkUrl && !linkName)
		linkName = linkUrl;

	var live_feed_version = util.getLiveFeedVersion();
	var newMsgID;
	if(live_feed_version == '2.0')
		newMsgID = postV2Message(msg, profileID, groupID, linkUrl, linkName);
	else
		newMsgID = postV1Message(msg, profileID, groupID, linkUrl, linkName);

	response.messageID = newMsgID;


	function postV2Message(msg, profileID, groupID, linkUrl, linkName) {
		var data = {
			message: msg,
			group_id: groupID,
			from_profile: profileID
		};
		//add link if we have a valid one
		if (linkUrl && isUrl(linkUrl)) {
			data.links = [
				{short_description: linkName, url: linkUrl}
			];
		}
		return new LiveFeedMessage().postMessage(data); // LiveFeedMessage is not available in V1
	}

	function postV1Message(msg, profileID, groupID, linkUrl, linkName) {
		var msgId = new SNC.LiveFeedApi().addMessage(msg, groupID, null, false, profileID);
		//add link if we have one
		if (msgId && linkUrl)
			addLink(msgId, linkUrl, linkName);
		return msgId;
	}

	function addLink(messageId, url, name) {
		//check url format
		if (!isUrl(url))
			return;

		var linkGr = new GlideRecord("live_link");
		linkGr.url = url;
		linkGr.short_description = name;
		linkGr.attached_to_table = "live_message";
		linkGr.attached_to_id = messageId;
		linkGr.insert();

		var mGr = new GlideRecord("live_message");
		if (mGr.get(messageId)) {
			mGr.has_links = true;
			mGr.update();
		}
	}

	function isUrl(url) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		return regexp.test(url);
	}

}());	
