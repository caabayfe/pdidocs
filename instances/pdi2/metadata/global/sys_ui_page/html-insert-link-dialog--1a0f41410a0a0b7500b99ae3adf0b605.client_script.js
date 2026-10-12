initLinkDialog();
gel("f_href").focus();


function initLinkDialog() {
  var gdw = GlideDialogWindow.get();
  var param = gdw.getPreference("outparam");
  var target_select = gel("f_target");
  var defaultAttachment = null;
  var isAttachmentImage = false;
  var hasAttachments = gel("ni.has_attachments").value;
  if (hasAttachments=="false") {
     var linkType = gel("link_type");
     for (var i=0; i<linkType.options.length; i++) {
        var opt = linkType.options[i];
        if (opt.value == "attachment")
           linkType.remove(i);
     }
     hide("link_type_row");
  }
  if (param) {
	  if (param["textArea"])
		refForm = param["textArea"].form;

	  if (param["f_href"]) {
		  var url = param["f_href"];

		  if (url.substring(0, 14) == "sys_attachment") {
                     var defaultImage = url.substring(url.lastIndexOf("=")+1);
                     var select = gel("attachment_list");
                     if (select) {
					 	for (var i = 0; select.options.length > i; i++) {
					 		if (select.options[i].value == defaultImage) {
					 			select.options.selectedIndex = i;
					 			isAttachmentImage = true;
					 			break;
					 		}
					 	}
					 }
                     if (isAttachmentImage) {
                        setLinkType('attachment');
                     }
                  }

		  if (!isAttachmentImage) {
                     gel("f_href").value = url;
                     gel("f_href").focus();
                     gel("f_href").select();
		  }
	  }

	  if (param["f_title"])
	      gel("f_title").value = param["f_title"];

	  if (param["f_target"]) {
		  comboSelectValue(target_select, param["f_target"]);
		  if (target_select.value != param.f_target) {
			var opt = cel("option");
			opt.value = param.f_target;
			opt.innerText = opt.value;
			target_select.appendChild(opt);
			opt.selected = true;
		  }
	  }
  }
  var opt = cel("option");
  opt.value = "_other";
  opt.innerHTML = "Other";
  target_select.appendChild(opt);
  target_select.onchange = onTargetChanged;
}

function onTargetChanged() {
  var f = gel("f_other_target");
  if (this.value == "_other") {
    showObjectInline(f);
    f.style.visibility = "visible";
    f.select();
    f.focus();
  } else f.style.visibility = "hidden";
}

function onOK() {
  if (getLinkType() == "attachment") {
	if (!getAttachmentId()) {
		return false;
	}
  } else {
	  var required = {
		"f_href": "You must enter the URL where this link points to"
	  };
	  for (var i in required) {
		var el = gel(i);
		if (!el.value) {
		  alert(required[i]);
		  el.focus();
		  return false;
		}
	  }
  }

  // pass data back to the calling window
  var fields = ["f_href", "f_title", "f_target" ];
  var param = new Object();
  for (var i in fields) {
    var id = fields[i];
    var el = gel(id);
	if (el)
	    param[id] = el.value;
  }

  if (getLinkType() == "attachment") {
	param['f_href'] = buildAttachmentLink(getAttachmentId());
  }

  if (param.f_target == "_other")
    param.f_target = gel("f_other_target").value;

  var gdw = GlideDialogWindow.get();
  var action = gdw.getPreference("action"); // we set the action to do as a dialog preference
  action(param);
}

function onCancel() {
  return false;
}

function changedLinkType() {
	var type = getLinkType();
	if (type == "attachment") {
		showURL(false);
		showAttachment(true);
	} else {
		showURL(true);
		showAttachment(false);
	}
}

function getLinkType() {
	var select = gel("link_type");
	return select.options[select.options.selectedIndex].value;
}

function showURL(showIt) {
	var typeURL = gel("type_url");
	if (showIt == true)
		show(typeURL);
	else
		hide(typeURL);
}

function showAttachment(showIt) {
	var typeAttachment = gel("type_attachment");
	if (showIt == true)
		show(typeAttachment);
	else
		hide(typeAttachment);
}

function comboSelectValue(c, val) {
	var ops = c.getElementsByTagName("option");
	for (var i = ops.length; --i >= 0;) {
		var op = ops[i];
		op.selected = (op.value == val);
	}
	c.value = val;
}

function getAttachmentId() {
	var select = gel("attachment_list");
	if (select.options.selectedIndex > -1)
		return select.options[select.options.selectedIndex].value;

	return;
}

function buildAttachmentLink(id) {
	if (id)
		return "sys_attachment.do?sys_id=" + id;

	return;
}

function setLinkType(t) {
	var select = document.getElementById("link_type");
	for(var i = 0; select.options.length > i; i++) {
		if (select.options[i].value == t) {
			select.options.selectedIndex = i;
			if (select['onchange'])
				select.onchange();
		}
	}
}
