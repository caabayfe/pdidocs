(function() {
	data.currentUserID = gs.getUserID();
	data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
	if (isNaN(data.maxAttachmentSize))
		data.maxAttachmentSize = 24;
	data.uploadingAttachmentMsg = gs.getMessage("Uploading attachment...");
	data.sharingLocMsg = gs.getMessage("Sharing location...");
	data.scanBarcodeMsg = gs.getMessage("Scan barcode");
	data.checkInLocMsg = gs.getMessage("Check in location");
	data.messagePostedMsg = gs.getMessage("Comment has been posted successfully");
	data.viewMsg = gs.getMessage("View");
	data.attachAddedMsg = gs.getMessage("Attachment added");
	data.attachFailMsg = gs.getMessage("Failed to add attachment");
	data.scanFailedMsg = gs.getMessage("File failed security scan");
	data.sys_id = (input && input.sys_id) || options.sys_id || $sp.getParameter("sys_id");
	data.table = (input && input.table) || options.table || $sp.getParameter("table");
	// don't use options.title unless sys_id and table also come from options
	if (options && options.sys_id && options.table)
		data.ticketTitle = options.title;
	data.placeholder = options.placeholder || gs.getMessage("Type your message here...");
	data.placeholderNoEntries = options.placeholderNoEntries || gs.getMessage("Type your message here...");
	data.btnLabel = options.btnLabel || gs.getMessage("Send");
	data.includeExtended = options.includeExtended || false;
	data.use_dynamic_placeholder = options.use_dynamic_placeholder;
	data.hideAttachmentBtn = options.hideAttachmentBtn;
	data.showActivityNotesLabel = options.showActivityNotesLabel;
	data.read_only = options.read_only|| false;
	data.rich_text_editor = (options.rich_text_editor == 'true');
	data.at_mentions = (options.at_mentions == 'true');
	data.displayFilter = (options.displayFilter == 'true');
	data.downloadAttachmentMsg = gs.getMessage("Download attachment");
	data.enterKeyAddsNewLine = false;
	if (options.enter_key_behavior == "System property")
		data.enterKeyAddsNewLine = gs.getProperty("glide.service_portal.comment.enter_adds_newline") == "true";
	else if (options.enter_key_behavior == "New line")
		data.enterKeyAddsNewLine = true;

    var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
    data.hasSummarizeSkill = 'false';
    if (nowAssistSkillConfig != null && nowAssistSkillConfig.isSkillConfigurationActive("ab0992bf2fd432101960e34fafa4e3a8")) //Standard ticket summarization skill-id
        data.hasSummarizeSkill = 'true';

	var gr = sn_std_tkt_api.TicketConfig.getTicketRecord(data.table, data.sys_id);
	if (gr == null || !gr.canRead())
		return;

	data.isNewRecord = data.sys_id == -1 || gr.isNewRecord();
	data.table = gr.getRecordClassName(); // use actual table for the record
	options.no_readable_journal_field_message = options.no_readable_journal_field_message || gs.getMessage("No readable comment field");
	//data.number = gr.getDisplayValue('number');
	data.number = $sp.getField(gr, 'number');
	data.created_on = gr.getValue('sys_created_on');
	data.reqFor = gr.getValue('requested_for');
	data.openedBy = gr.getValue('opened_by');
	data.portal = $sp.getValue('url_suffix');
	var translationLuaParameters = {
		'event': {
			'eventName': 'Activity Stream - Portal'
			},
		'tableName': data.table
		};
	var isDynamicTranslationInstalled = GlidePluginManager.isActive("com.glide.dynamic_translation");
	if (isDynamicTranslationInstalled) {
		var isDynamicTranslationEnabled	= sn_dt_api.DynamicTranslation.isEnabled(translationLuaParameters);
		data.isTranslationEnabled = isDynamicTranslationEnabled && isDynamicTranslationEnabled.translation;
		if(data.isTranslationEnabled)
			initDynamicTranslation();
	}

	function initDynamicTranslation() {
	    var translation = {};
	    translation.translateLinkMsg = gs.getMessage("Translate");
	    translation.sameLanguageErrorMsg = gs.getMessage("This content is written in your preferred language. No need to translate.");
	    translation.genericErrorMsg = gs.getMessage("Unable to translate.");
	    translation.credentialsErrorMsg = gs.getMessage("Credentials are missing or invalid. Contact your administrator.");
	    translation.maxLengthErrorMsg = gs.getMessage("Text has exceeded the maximum length.");
	    translation.langNotSupportedErrorMsg = gs.getMessage("Text cannot be translated to your preferred language.");
	    translation.creditsMsg = gs.getMessage("Translated by {0}");
	    translation.translationProgressMsg = gs.getMessage("Translating...");
	    translation.hideMsg = gs.getMessage("Hide");
	    translation.showMsg = gs.getMessage("Show");
	    translation.tryAgainMsg = gs.getMessage("Try Again");
	    data.translation = translation;
	}

	//mask first entry incase of UR
	if (data.table != 'universal_request') {
		if (gr.isValidField('universal_request') && !gr.universal_request.nil()) {
			var ur = sn_std_tkt_api.TicketConfig.getTicketRecord('universal_request', gr.universal_request);
			data.number = $sp.getField(ur, 'number');
			data.created_on = ur.getValue('sys_created_on');
			var userRecord = ur.opened_by;
			data.urCreatedBy = userRecord.name.toString();
			data.initUser = {
								userID: userRecord.toString(),
								name: data.urCreatedBy,
								avatar: GlideAvatarFinder.getAvatarPath(userRecord),
								initials: buildInitials(data.urCreatedBy)
							}
		}
	}

	if (input) { // if we have input then we're saving
		if (input.isPosting && input.journalEntry && input.journalEntryField && gr.canWrite(input.journalEntryField)) {
			if (input.rich_text_editor) {
				input.journalEntry = "[code]" + input.journalEntry + "[/code]";
				input.journalEntry = expandMentions(input.journalEntry, input.mentionMap);
			}
			var fields = {};
			fields[input.journalEntryField] = {value:input.journalEntry, journalInputChanged: true};

			$sp.saveRecord(data.table, data.sys_id, fields);
			$sp.logStat('Comments', data.table, data.sys_id, input.journalEntry);
		}
		data.ticketTitle = input.ticketTitle;
		data.placeholder = input.placeholder;
		data.btnLabel = input.btnLabel;
		data.includeExtended = input.includeExtended;
	} else {
		if (!data.ticketTitle) {
			if (gr.isValidField('short_description') && gr.short_description.canRead())
				data.ticketTitle = gr.getDisplayValue("short_description");
			if (!data.ticketTitle)
				data.ticketTitle = data.number;
		}

		$sp.logStat('Task View', data.table, data.sys_id);
	}

	if (!data.number)
		data.number = { display_value: gr.getLabel()}

	data.canWrite = gr.canWrite();
	data.canAttach = userCanAttach(gr);
	data.canRead = gr.canRead();
	data.hasWritableJournalField = false;
	data.hasReadableJournalField = false;
	if (data.canRead && !data.isNewRecord) {
		data.stream = $sp.getStream(data.table, data.sys_id, {fieldChange: true});
		// Journal fields come in correct order already
		// so grab the first 2 writeable fields
		if ('journal_fields' in data.stream) {
			var jf = data.stream.journal_fields;
			for(var i=0; i < jf.length; i++){
				if (jf[i].can_read === true)
					data.hasReadableJournalField = true;
				if (jf[i].can_write === true){
					data.hasWritableJournalField = true;
					if (!data.primaryJournalField)
						data.primaryJournalField = jf[i];
					else if (data.includeExtended && !data.secondaryJournalField)
						data.secondaryJournalField = jf[i];
					else
						break;
				}
			}
		}

	}

	data.systemUser = {
		userID: "",
		name: gs.getMessage("System"),
		//avatar: GlideAvatarFinder.getAvatarPath(userName),
		initials: buildInitials(gs.getMessage("System"))
	}


	data.tableLabel = gr.getLabel();

	function userCanAttach(originalRecord) {
		if (!gs.hasRole(gs.getProperty("glide.attachment.role")))
			return false;

		// To check whether user can upload attachments, need to check "no_attachment" table
		// attribute of the target record (e.g., incident vs. task), so fetch it if we need to.
		// GlideRecordScriptUtil.getRealRecord is not available to scoped apps, so can't use it.
		var targetRecordForAttributes = originalRecord;
		/*if (originalRecord.getRecordClassName() != originalRecord.getTableName()) {
			targetRecordForAttributes = new GlideRecord(originalRecord.getRecordClassName());
			targetRecordForAttributes.get(originalRecord.getUniqueValue());
		}*/
		return targetRecordForAttributes.getAttribute("no_attachment") != "true";
	}

	function buildInitials(name) {
		if (!name)
			return "--";

		var initialMatchRegex = /^[A-ZÀ-Ÿ]|^[\u3040-\u309f]|^[\u30a0-\u30ff]|^[\uff66-\uff9f]|^[\u4e00-\u9faf]/;
		// Included Hiragana, Katakana, CJK Unified Ideographs and Halfwidth and Fullwidth Forms Blocks
		// Hiragana -> Japanese words, Katakana -> foreign words
		// CJK Unified Ideographs -> modern Chinese, Japanese, Korean and Vietnamese characters

		var initials = name.split(" ").map(function(word) {
			return word.toUpperCase();
		}).filter(function(word) {
			return word.match(initialMatchRegex);
		}).map(function(word) {
			return word.substring(0,1);
		}).join("");

		return (initials.length > 3) ? initials.substr(0, 3) : initials;
	}

	function expandMentions(entryText, mentionIDMap) {
            return entryText.replace(/@\[(.+?)\]/gi, function(mention) {
                var mentionedName = mention.substring(2, mention.length - 1);
                if (mentionIDMap[mentionedName]) {
                    return "@[" + mentionIDMap[mentionedName] + ":" + mentionedName + "]";
                } else {
                    return mention;
                }
            });
	}

})()
