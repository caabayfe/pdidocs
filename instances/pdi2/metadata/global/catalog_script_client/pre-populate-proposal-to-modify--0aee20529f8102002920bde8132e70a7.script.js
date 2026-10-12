function onLoad() {
	var stdChangeProducerSysId = getParmVal('std_change_producer');
	if (stdChangeProducerSysId) {
		g_form.setValue('variables.std_change_producer', stdChangeProducerSysId);
		populateValsFromMod(stdChangeProducerSysId);

		populateAttachments(stdChangeProducerSysId, false);
	}
}

function populateValsFromMod(newValue) {
	//Populate Template Values From 'Template to modify'
	ga = new GlideAjax('StdChangeUtils');
	ga.addParam('sysparm_name', 'getTemplNCategoryForModify');
	ga.addParam('sysparm_tableName', 'std_change_record_producer');
	ga.addParam('sysparm_sysid', newValue);
	ga.setWantSessionMessages(false);
	ga.getXML(function(resp) {
		var parsedResp = toJson(resp);
		g_form.setValue('variables.category', parsedResp.category);
	});
}

function tagToObj(tag, detectValue) {
	var ans = {};
	var attrs = tag.attributes;
	if (attrs.length == 1 && tag.getAttribute('value')) {
		ans = tag.getAttribute('value');
	} else {
		for (var i = 0; i < attrs.length; i++) {
			var attr = attrs.item(i);
			ans[attr.name] = attr.value;
		}
	}
	return ans;
}

function toJson(resp) {
	var ans = {};
	var tags = resp.responseXML.documentElement.childNodes;
	for (var i = 0; i < tags.length; i++) {
		var tag = tags.item(i);
		var tagName = tag.nodeName;
		if (tag.getAttribute('idx')) { //Then this is array
			if (!ans[tagName])
				ans[tagName] = [];
			ans[tagName].push(tagToObj(tag, false));
		} else {
			ans[tagName] = tagToObj(tag, true);
		}
	}
	return ans;
}

function getParmVal(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results) {
		return unescape(results[1]);
	} else {
		return '';
	}
}

function populateAttachments(stdChangeProducerSysId, removeExisting){

	var itemGUID = gel('sysparm_item_guid');

	var copyAttAj = new GlideAjax('StdChangeUtils');
	copyAttAj.addParam('sysparm_name', 'copyAttachments');
	copyAttAj.addParam('sysparm_srcTable', 'std_change_record_producer');
	copyAttAj.addParam('sysparm_srcSysId', stdChangeProducerSysId);
	copyAttAj.addParam('sysparm_targetTable', 'std_change_proposal');
	copyAttAj.addParam('sysparm_targetSysId', itemGUID.value);
	copyAttAj.addParam('sysparm_removeExisting', removeExisting);
	copyAttAj.getXML(processAttachments);
}

function processAttachments(response) {
	// get attachmentInfo elements
	var attachments = response.responseXML.getElementsByTagName("attachmentInfo");
	var deletedAttachmentIds = '';

	for ( var i = 0; i < attachments.length; i++) {
		var id = attachments[i].getAttribute("id");
		var name = attachments[i].getAttribute("name");
		var imgSrc = attachments[i].getAttribute("imgSrc");
		var action = attachments[i].getAttribute("action");

		if ('delete' == action) {
			deletedAttachmentIds += ';' + id;
		}
		else if ('add' == action) {
			addAttachmentNameToForm(id, name, "New", imgSrc, "true", "true");
		}
	}

	if(deletedAttachmentIds != '')
		deleteExistingAttachments(deletedAttachmentIds);
}

// this get called after attachments are deleted to update the display
function deleteExistingAttachments(sysIds) {
	var itemGUID = gel('sysparm_item_guid');

	var modified = $("attachments_modified");
	if (modified)
		modified.value = "true";
	var header_attachment = $('header_attachment');

	var idArray = sysIds.split(";");
	for (var i=0; i<idArray.length; i++) {
		var id = idArray[i];
		if(id)
			changeCount(itemGUID.value, 'decrease');

		e = gel("attachment_" + id);
		if (e)
			rel(e);
	}

	var more_attachments = $('more_attachments');
	if (more_attachments && header_attachment)
		if( (computeAttachmentWidth() - 20) >= (header_attachment.getWidth() - more_attachments.getWidth()))
		more_attachments.style.display = 'block';
	else
		more_attachments.style.display = 'none';
}
