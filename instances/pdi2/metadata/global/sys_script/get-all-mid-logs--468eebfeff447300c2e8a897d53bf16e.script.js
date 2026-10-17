(function() {
	var parsed, saGr, sa, filepath, isCurrent, fileNum, lastModified,
		StringReader = Packages.java.io.StringReader,
		InputSource = Packages.org.xml.sax.InputSource,
		xmlHelper = new XMLHelper(),
		parser = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance().newDocumentBuilder(),

		// regex below matches line format of the agent logs when using com.service_now.mid.logging.MidLogFormatter
		// (introduced in Tokyo)
		agentLine = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}\.\d{3}[-+]\d{4}) (.*)/, // Matches yyyy-MM-ddTHH:mm:ss.SSS-ZZZZ or yyyy-MM-ddTHH:mm:ss.SSS+ZZZZ

		// regex below matches line format of the agent logs when using com.glide.util.DefaultLogFormatter
		// (used by default prior to Tokyo)
		agentLineLegacy = /^(\d\d)\/(\d\d)\/(\d\d)( \d\d:\d\d:\d\d)(.*)/,   // Matches MM/DD/YY HH:MM:SS

		wrapperLine = /^(\d\d\d\d)\/(\d\d)\/(\d\d)( \d\d:\d\d:\d\d)(.*)/, // Matches YYYY/MM/DD HH:MM:SS
		midNamePattern = /^mid.server.(.*)/,
		filenameRegex = /(agent0\.log|wrapper\.log)\.?(\d+)?/,
		filename = current.name + '',
		nextFilename = filenameRegex.exec(filename),
		content = current.payload + '';


	// Remove the relative path if present
	filename = filename.split('/').pop();
	if (current.source == 'grabSettings') {
		var midName = current.agent ? midNamePattern.exec(current.agent)[1]: '';
		filename = new MidSettingsUtil().getMidSettingsFileName(midName);
	}

	if (content == '<see_attachment/>') {
		saGr = new GlideRecord('sys_attachment');
		saGr.addQuery('table_sys_id', current.getUniqueValue());
		saGr.addQuery('table_name', current.getTableName());
		//there should be only one attachment in the record but name is not hard coded
		saGr.query();
		if (saGr.next()) {
			sa = new GlideSysAttachmentInputStream(saGr.sys_id);
			content = new Packages.java.io.ByteArrayOutputStream();
			sa.writeTo(content, 0, 0);
			content.close();
		} else {
			current.error_string = 'Attachment not created. Verify system property com.glide.attachment.max_size.';
			current.state = 'error';
			current.update();
			content = '';    // No content is one of the conditions that means we're done.
		}
	}

	parsed = parser.parse(new InputSource(new StringReader(content)));
	parser = 0;
	content = xmlHelper.toObject(parsed, true);
	xmlHelper = 0;
	parsed = 0;

	parms = content.parameters.parameter;
	filepath = content.file_path;
	filestatus = content.file_status;
	lastModified = content.last_modified;

	var grabLogType;
	for (var i = 0; i < parms.length; i++) {
		if (parms[i]["@name"] === "grabLogType") {
			grabLogType = parms[i]["@value"];
			break;
		}
	}
	var isDedicatedGrabLog = grabLogType === 'dedicated';
	content = (content.result && content.result.output + '') || '';

	if (nextFilename) {
		filename = nextFilename[1] + (nextFilename[2] ? '.' + nextFilename[2] : '');
		fileNum = nextFilename[2] || '0';
		if (fileNum == 0)
			isCurrent = true;
		nextFilename = nextFilename[1] + '.' + (+fileNum + 1);
	}

	// We always want to save any logs we happen to get.  If we're
	// updating an existing record then assume that we fetched
	if (!saveRecord() || !nextFilename || filestatus == 'file_not_found')
		return;

	// So the debugger is usable
	content = '';

	// We got an agent log, so try to get the next (previous) log also.
	if (!isDedicatedGrabLog) {
	  var midmanage = new MIDServerManage();
	  midmanage.grab_logs(current.agent, nextFilename);
	}

	////////////////////////////////////////////////////////////////////////
	function saveRecord() {
		var startDate, endDate, mid, gr, newRecord, trimmedContent, payloadFilename, endDateFormatted, isTelemetryFile;

		// MID saves the compressed log files directly to agent_file, so skip this step for them
		if (filepath && (filepath.endsWith(".zip") || filepath.endsWith(".jfr")))
			return true;

		if (!fixContent())
			return;

		mid = getMid();
		isTelemetryFile = filename.startsWith("mid-telemetry-metrics");
		gr = new GlideRecord('agent_file');
		gr.addQuery('mid_server', mid);
		if (isTelemetryFile) {
			filename = filename.replace(/\.jsonl$/, "") + '_' + lastModified + ".jsonl";
		} else {
			gr.addQuery('start_date', startDate);
		}
		gr.addQuery('name', filename);
		//there should only be one attachment in record, but filename is not hard coded
		gr.query();

		if (!gr.next()) {
			gr = new GlideRecord('agent_file');
			gr.mid_server = mid;
			gr.start_date = startDate;
			newRecord = true;
		}

		gr.content = trimmedContent || content;
		gr.start_date = startDate;
		if (isCurrent)
			gr.end_date = null;
		else
			gr.end_date = endDate !== undefined ? endDate : formatLastModifiedDate(lastModified);

		gr.name = filename;
		gr.path = filepath;
		gr.mid_server = getMid();
		gr.update();

		if (trimmedContent) {
			var deletedAttachmentSysId = deleteOldAttachment(gr.getUniqueValue(), gr.getTableName());
			sa = new GlideSysAttachment(deletedAttachmentSysId);
			if (current.source == 'grabSettings') {
				// for grabSettings attachment type is json and name is different from MID log files
				sa.write(gr, filename, 'json', content);
			} else if (isTelemetryFile) {
				sa.write(gr, filename, 'jsonl', content);
			} else {
				//naming attachment name to include more information about the file contents
				//attachment filename is in format: midservername_[start time]_[end time]_filename
				//where start time and end time have format YYYY-MM-DD_XXhXXmXXs
				//if most current log, end time will be show up as [empty]
				endDateFormatted = isCurrent ? '[empty]' : formatDate(endDate);
				payloadFilename = current.agent.substr(11).substr(-32) + '_' + formatDate(startDate) + '_' + endDateFormatted + '_' + filename;
				sa.write(gr, payloadFilename, content);
			}
		} else if (current.source == 'grabSettings') {
			//A json file containg the MID settings information in jsonformat will be attached to
			//the corresponding record in agent_file table
			deletedAttachmentSysId = deleteOldAttachment(gr.getUniqueValue(), gr.getTableName());
			sa = new GlideSysAttachment(deletedAttachmentSysId);
			sa.write(gr, filename, 'json', content);
		} else if (isTelemetryFile) {
			sa.write(gr, filename, 'jsonl', content);
		}
		return newRecord;

		function deleteOldAttachment(tableSysId, tableName) {
			saGr = new GlideRecord('sys_attachment');
			saGr.addQuery('table_sys_id', gr.getUniqueValue());
			saGr.addQuery('table_name', gr.getTableName());
			//there should only be one attachment in the record, but filename is not hardcoded
			saGr.query();
			if (saGr.next()) {
				sa = new GlideSysAttachment(saGr.sys_id);
				sa.deleteAttachment(saGr.sys_id);
			}
			return saGr.sys_id;
		}
		function fixContent() {
			var line, dateParsed, date,
				i = 0,
				trimmedNote1 = '<Omitted ',
				trimmedNote2 = ' of ' + format(content.length) + ' characters.  Full content in attachment.>\n\n',
				trimmedNoteLength = trimmedNote1.length + 10 + trimmedNote2.length;   // Reserves 10 characters for number omitted

			if (!content)
				return;

			// I originally reversed the order of the log here (so most recent messages would be on top)
			// but it was surprisingly confusing.  When I decided not to reverse the messages I just left
			// the existing code (mostly) intact and removed the call to content.reverse().
			content = content.split('\n');

			while (i < content.length) {
				line = content[i];
				dateParsed = getDateTime(line);
				if (dateParsed) {
					date = dateParsed[0];
					startDate = startDate || date;
					endDate = date;

					// This will convert the timezone in the raw log into the user's timezone. Again, the
					// timezone offset will be included so we know the correct time, independent of timezone.
					content[i] = date.getDisplayValueInternal() + getOffsetString(date) + ' ' + dateParsed[1];
				}
				i++;
			}

			content = content.join('\n');

			// There's a hard limit of 20,000 on the size of the content (that's the size of the column.)  If we
			// have to truncate it we'll add a message like:
			//         <Omitted 1,423,595 of 10,000 characters.  Full content in attachment.>
			// This code will attempt to truncate at a line boundary and will put the corrent number of
			// omitted characters into the truncation message.
			if (content.length > 20000) {
				trimmedContent = content.substr(content.length - (20000 - trimmedNoteLength));
				trimmedContent = trimmedContent.split('\n');
				// Truncating probably happened in the middle of a line.  Remove the partial line if
				// it's a reasonable length.
				if (trimmedContent[0].length < 5000)
					trimmedContent.shift();
				trimmedContent = trimmedContent.join('\n');
				trimmedContent = trimmedNote1 + format(content.length - trimmedContent.length) + trimmedNote2 + trimmedContent;
			}

			return true;
		}

		function getOffsetString(date) {
			var minutes, hours,
				result = '+',
				offset = date.getTZOffset();

			if (offset < 0) {
				result = '-';
				offset = -offset;
			}

			minutes = offset / 1000 / 60,
			hours = (minutes / 60) | 0;
			minutes = minutes - hours * 60;

			addString(hours);
			addString(minutes);

			return result;

			function addString(t) {
				if (t == 0)
					result += '00';
				else {
					if (t < 10)
						result += '0';
					result += t;
				}
			}
		}

		function format(num) {
			var pattern = /(-?\d+)(\d{3})/,
				s = '' + num;

			while (pattern.test(s))
				s = s.replace(pattern, '$1,$2');
			return s;
		}
	}

	function getMid() {
		var gr = new GlideRecord('ecc_agent');
		gr.addQuery('name', current.agent.substr(11));   // Remove "mid.server."
		gr.query();
		gr.next();
		return gr.sys_id;
	}

	function getDateTime(str) {
		var date = wrapperLine.exec(str);

		if (date)
			return [ new GlideDateTime(date[1] + '-' + date[2] + '-' + date[3] + date[4]), date[5] ];

		// Dates in the file will all have a time zone offset - this will be the timezone used by the
		// MID server, which may not match the instance or user's time zones.
		// The regex captures the timezone offset and it gets passed to GlideDateTime so we have the
		// correct time of log messages, independent of time zone.
		date = agentLine.exec(str);
		if (date)
			return [ new GlideDateTime(date[1] + ' ' + date[2]), date[3] ];

		date = agentLineLegacy.exec(str);
		if (date)
			return [ new GlideDateTime('20' + date[3] + '-' + date[1] + '-' + date[2] + date[4]), date[5] ];
	}

	function formatDate(str) {
		//input string is in the format YYYY-MM-DD XX:XX:XX
		//formatting date in attachment filename to: [YYYY-MM-DD_XXhXXmXXs]
		var date = '[' + str;
		//replacing ':' since this is invalid filename in windows
		date = date.replace(":", "h");
		date = date.replace(":", "m");
		date = date.replace(' ', '_');
		date = date + 's]';
		return date;
	}

	function formatLastModifiedDate(str) {
		// formatting telemetry log file end date given "yyyy-MM-dd'T'HH_mm_ss.SSSZ"
		str = str.split('_').join(':');
		var match = str.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})\.\d{3}([+-]\d{4})$/);

		if (match) {
			var formatted = match[1] + " " + match[2] + " " + match[3];
			var gdt = new GlideDateTime(formatted);
			return gdt;
		}
	}

})();
