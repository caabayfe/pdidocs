function closeFormModal() {
	$j(document).trigger('close-form-modal');
}
function formFrameLoaded(frame) {
	var doc = frame.contentDocument;
	$j('<style>'
	   + 'body { background: #f2f2f4}'
	   + '.form_action_button_container { display: none}'
	   + '.icon-book.knowledge { display: none}'
	   + '#page_timing_div { display: none}'
	   + '.section_header_content_no_scroll { overflow: auto}'
	   + '.form_body { margin-left: -26px}'
	   + '.form-field-addons { display: none}'
	   + '[name="incident.number"] { user-select: none}'
	   +'</style>').appendTo($j('head', doc));
	var windowObject = frame.contentWindow || frame.contentDocument;
	var g_form = windowObject.g_form;
	var fields = g_form.getEditableFields();  
	for (var i=0;i<fields.length;i++) {
		g_form.setReadOnly(fields[i], true); 
	}
	doc.on('click', function() {
		window.NOW.CustomEvent.fireAll('close_preview_popover');
	});
	resizeFrame('#formFrame');
}
function modalFrameLoaded(frame) {
	var doc = frame.contentDocument;
	var jFrame = jQuery(frame);
	var formHeight = 550;
	if (jFrame.contents().find('form.form_body').length) {
		formHeight = jFrame.contents().find('form.form_body').outerHeight() + 50;
		if (formHeight > 550)
			formHeight = 550;
	}
	jFrame.height(formHeight);
	var styling = '<style>'
	   + '.section_header_content_no_scroll { overflow: auto !important; height: auto !important}'
	   + '#page_timing_div { display: none !important}';
	styling += '</style>';
	$j(styling).appendTo($j('head', doc));
	$j(document).trigger('modalframe-loaded', frame);
	if (frame.src.indexOf('sysparm_view=mim_child_incident') != -1) {
		var windowObject = frame.contentWindow;
		var g_form = windowObject.g_form;
		if (g_form) {
			g_form.setValue('short_description', task.short_description);
			g_form.setValue('description', task.description);
		}
	}
}

(function($) {

	var mailWindow;
	window.injectIntoEmailClient = function injectIntoEmailClient(iframe) {
		var win = iframe.contentWindow;
		var path = win.location.pathname.trim();
		// Initially the page loads about:blank, so checks that the url starts with email_client.do
		// which renders the email client.
		if (path.lastIndexOf('/email_client.do', 0) == 0) {
			mailWindow = win;
			var doc = iframe.contentDocument || mailWindow.document;
			$('body', doc).ready(function () {
				$('nav', doc).remove();
				$('#attachmentsLabel', doc).parent().remove();
			});
			$('<style>'
			  + 'form { padding: 5px 20px; }'
			  + 'form .form-group label { text-align: left; }'
			  +'</style>').appendTo($('head', doc));
		} else if (path.lastIndexOf('/email_client_template.do', 0) == 0) {
			// This url is loaded after POST on email_client.do
			mailWindow = undefined;
			g_hideEmailClient(); // Defined in Angular controller
		} else {
			console.log('Ignoring loading of url path ', path);
		}
	};

	window.sendMail = function () {
		if (mailWindow) {
			mailWindow.sendIfOkay();
		}
	};
	
}(jQuery));
