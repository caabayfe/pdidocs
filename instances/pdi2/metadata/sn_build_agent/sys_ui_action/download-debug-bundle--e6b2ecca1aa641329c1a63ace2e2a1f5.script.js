(function executeAction() {
	try {
		if (!gs.hasRole('admin') || gs.getProperty('sn_build_agent.show_workitem_download', 'false') !== 'true') {
			gs.addInfoMessage('You do not have permission to download the debug bundle.');
			action.setRedirectURL('sn_build_agent_conversation.do?sys_id=' + current.getUniqueValue());
			return;
		}

		var convSysId = current.getUniqueValue();

		// Collect conversation data
		var convData = {
			sys_id: convSysId,
			user: current.getValue('user') || '',
			application_id: current.getValue('application') || '',
			application_name: current.getValue('application_name') || current.getDisplayValue('application') || '',
			title: current.getValue('title') || '',
			summary: current.getValue('summary') || null,
			state: current.getValue('state') || '',
			client: current.getValue('client') || '',
			last_message_at: current.getValue('last_message_at') || '',
			archived_timestamp: current.getValue('archived_timestamp') || '',
			completion_timestamp: current.getValue('completion_timestamp') || '',
			active: current.getValue('active') || '',
			sys_created_on: current.getValue('sys_created_on') || '',
			working_set: current.getValue('working_set') || '',
			context_summary: current.getValue('context_summary') || null,
			last_summarized_msg_index: current.getValue('last_summarized_msg_index') || '0'
		};

		// Collect messages
		var messages = [];
		var msgGr = new GlideRecord('sn_build_agent_message');
		msgGr.addQuery('conversation', convSysId);
		msgGr.orderBy('sequence');
		msgGr.query();
		while (msgGr.next()) {
			var msg = {
				sys_id: msgGr.getUniqueValue(),
				sequence: msgGr.getValue('sequence') || '',
				content: msgGr.getValue('content') || '',
				conversation: convSysId,
				active: msgGr.getValue('active') || '',
				sys_created_on: msgGr.getValue('sys_created_on') || ''
			};
			var subAgentId = msgGr.getValue('sub_agent_id');
			if (subAgentId) msg.sub_agent_id = subAgentId;
			messages.push(msg);
		}

		// Parse working set
		var workingSetParsed = [];
		try {
			workingSetParsed = JSON.parse(convData.working_set || '[]');
		} catch (e) {
			workingSetParsed = { parse_error: e.toString(), raw: convData.working_set };
		}

		var manifest = {
			conversationId: convSysId,
			title: convData.title,
			capturedAt: new GlideDateTime().getDisplayValue(),
			messageCount: messages.length,
			workingSetCount: Array.isArray(workingSetParsed) ? workingSetParsed.length : 0
		};

		// Fetch file contents via GlideRecord (REST calls to localhost fail with status 0)
		var gliderFiles = {};
		try {
			var uriToChecksum = {};
			var checksumList = [];
			var fileIndexGr = new GlideRecord('sn_glider_ide_file_index');
			fileIndexGr.addQuery('uri', 'STARTSWITH', 'ba-file:/' + convSysId + '/');
			fileIndexGr.addQuery('type', 'file');
			fileIndexGr.addNullQuery('dtime');
			fileIndexGr.query();
			while (fileIndexGr.next()) {
				var fUri = fileIndexGr.getValue('uri');
				var fChecksum = fileIndexGr.getValue('checksum');
				if (fUri && fChecksum) {
					uriToChecksum[fUri] = fChecksum;
					checksumList.push(fChecksum);
				}
			}
			if (checksumList.length > 0) {
				var checksumToContent = {};
				var contentGr = new GlideRecord('sn_glider_ide_file_content');
				contentGr.addQuery('checksum', 'IN', checksumList.join(','));
				contentGr.query();
				while (contentGr.next()) {
					checksumToContent[contentGr.getValue('checksum')] = contentGr.getValue('content') || '';
				}

				for (var fKey in uriToChecksum) {
					var relPath = fKey.replace('ba-file:/', '').replace(/^\/+/, '');
					if (/\.(zip|jar|png|gif|jpg|jpeg|ico|woff|woff2|ttf|eot)$/.test(relPath)) continue;
					gliderFiles[relPath] = checksumToContent[uriToChecksum[fKey]] || '';
				}
			}
		} catch (fileErr) {
			gs.error('[DownloadDebugBundle] Could not fetch sn_glider files: ' + fileErr.message);
		}

		// Write separate JSON attachments — gsa.write(GlideRecord,...) is confirmed working
		var gsa = new GlideSysAttachment();
		var convGr2 = new GlideRecord('sn_build_agent_conversation');
		convGr2.get(convSysId);
		var links = [];

		function saveFile(name, content) {
			var sid = gsa.write(convGr2, name, 'application/json', content);
			if (sid) {
				var escapedName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
				links.push('<a href="/sys_attachment.do?sys_id=' + sid + '" target="_blank">' + escapedName + '</a>');
			}
		}

		saveFile('manifest.json', JSON.stringify(manifest, null, 2));
		saveFile('conversation.json', JSON.stringify({ conversation: convData, messages: messages }, null, 2));
		saveFile('working-set-manifest.json', JSON.stringify(workingSetParsed, null, 2));

		for (var filePath in gliderFiles) {
			saveFile('files/' + filePath, gliderFiles[filePath]);
		}

		if (links.length > 0) {
			gs.addInfoMessage('Debug bundle (' + links.length + ' files): ' + links.join(' | '));
		} else {
			gs.addErrorMessage('Debug bundle attachment save failed.');
		}
		action.setRedirectURL('sn_build_agent_conversation.do?sys_id=' + convSysId);
	} catch (topErr) {
		gs.error('[DownloadDebugBundle] Fatal error: ' + topErr.message);
		gs.addErrorMessage('Debug bundle failed: ' + topErr.message);
		action.setRedirectURL('sn_build_agent_conversation.do?sys_id=' + current.getUniqueValue());
	}
})();
