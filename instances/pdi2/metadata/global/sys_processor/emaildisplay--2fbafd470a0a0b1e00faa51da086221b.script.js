var EMAIL_VERSION_HEADER_NAME = "X-ServiceNow-SysEmail-Version:";
var TEXT_HTML = "text/html; charset=utf-8";
var STYLE = "<style> body {"+ gs.getProperty("glide.ui.activity.style.email") + "}</style>";
var TOP_HTML = '<base target="_blank"/>' + STYLE;

	
var SecurityUtil = new GlideSecurityUtils();
process();

function process() {
  var email_id = g_request.getParameter("email_id");
  var emailRecord = new GlideRecord("sys_email");
  if (emailRecord.get(email_id)) {
    if (emailRecord.canRead())
      showEmail(emailRecord);
    else
      g_processor.writeOutput(GlideSysMessage.format("Insufficient rights to read the email body"));
  } else
    g_processor.writeOutput("No such email");
}

function showEmail(emailRecord) {
  if (getParentRecord(emailRecord)) {
    if (getEmailVersion(emailRecord) == 2)
      writeBody(emailRecord);
    else
      writeBodyLegacy(emailRecord);   
  }
}

function writeBody(emailRecord) {
	if (!JSUtil.nil(emailRecord.body)) {
		var sanitizedBody = sanitizeEmail(emailRecord);
		g_processor.writeOutput(TEXT_HTML,TOP_HTML + SecurityUtil.escapeScriptIfDetected(sanitizedBody));
	}
		
  else if (!JSUtil.nil(emailRecord.body_text))
    g_processor.writeOutput("text/plain", emailRecord.body_text);
}

function writeBodyLegacy(emailRecord) {
    var content_type = emailRecord.content_type;
    if (content_type) {
        content_type = content_type.replace(/(\r+)(\n+)|(\n+)(\r+)|(\n+)|(\r+)/g, " ");
        if (content_type.startsWith("multipart")) {
            var unfoldedHeader = emailRecord.headers.replace(/\r\n\s/g, "");
            var multipleContentTypes = unfoldedHeader.match(/MultipartContentTypes.*/i);
            if (multipleContentTypes && multipleContentTypes.toString().toUpperCase().indexOf("TEXT/HTML") == -1)
                content_type = "text/plain";
            else
                content_type = TEXT_HTML;
        }
    } else {
        var showDetailsInline = gs.getProperty("glide.email.empty_content_type.show_details_inline", "false");
        if (showDetailsInline == "true")
            content_type = TEXT_HTML;
    }

    var sanitizedBody = sanitizeEmail(emailRecord);
    var body = SecurityUtil.escapeScriptIfDetected(sanitizedBody);
    if (content_type == TEXT_HTML)
        body = TOP_HTML + body;

    g_processor.writeOutput(content_type, body);
}

function getParentRecord(emailRecord) {
  var table = emailRecord.target_table;
  if (table) {
	// In order to preview the emails targeted to a scoped table, a Restricted Caller Access record needs to be created for EmailDisplayProcessorUtil
	var emailParentRecord = new EmailDisplayProcessorUtil().getParentRecord(emailRecord);
    if (emailParentRecord) {
		if (emailParentRecord == "No access")
			g_processor.writeOutput("No access");
		else
			return emailParentRecord;
	} else
		g_processor.writeOutput("No such parent record");
  } else {
    var sanitizedBody = sanitizeEmail(emailRecord);
    g_processor.writeOutput(TEXT_HTML, SecurityUtil.escapeScriptIfDetected(sanitizedBody));
  }	  
}

function getEmailVersion(emailRecord) {
  var emailVersionHeaderLine = emailRecord.headers.match(/X-ServiceNow-SysEmail-Version.*/i) + "";
  if (JSUtil.nil(emailVersionHeaderLine))
    return 1;

  var version = emailVersionHeaderLine.substring(EMAIL_VERSION_HEADER_NAME.length).trim();
  return version.valueOf();
}

function sanitizeEmail(emailRecord) {
	return SNC.GlideHTMLSanitizer.sanitize(emailRecord.body);
}
