var embedObjectInfo = new Object();
initVideoDialog();

function initVideoDialog() {
  embedObjectInfo.extensions = gel("ni.file_extensions").value.split(",");
  embedObjectInfo.clsids = gel("ni.clsids").value.split("|");
  embedObjectInfo.embedTypes = gel("ni.embedtypes").value.split("|");
  embedObjectInfo.codebases = gel("ni.codebases").value.split("|");
  embedObjectInfo.pluginsPages = gel("ni.pluginspages").value.split("|");

  var gdw = GlideDialogWindow.get();
  var param = gdw.getPreference("outparam");
  var refForm = null;
  if (param && param["textArea"]) {
    refForm = param["textArea"].form;
  };
  var hasDbVideo = gel("ni.has_db_video").value;

  var isAttachmentVideo = false;
  var isDbVideo = false;
  var isURL = false;
  var notFound = false;
  if (param) {
      var showAdvancedDespitePref = false;
      if (param["f_height"]) {
          gel("f_height").value = param["f_height"];
          showAdvancedDespitePref = true;
      }
      if (param["f_width"]) {
          gel("f_width").value = param["f_width"];
          showAdvancedDespitePref = true;
      }
      if (param["f_allowfullscreen"]=="true")
          gel("f_allowfullscreen").checked = true;
      if (param["f_allowscriptaccess"])
          setSelectChoice("f_allowscriptaccess", param["f_allowscriptaccess"]);

      if (param["f_url"]) {
          var url = param["f_url"];

          if (showAdvancedDespitePref)
              show("advanced_options");

          if (url.startsWith("http:")||url.startsWith("https:")) {
              gel("f_url").value = url;
              isURL = true;
              setLinkType('url');
          }

          if (!isURL && (url.substring(0, 19) == "/sys_attachment.do?" || url.substring(0, 18) == "sys_attachment.do?")) {
             var defaultVideo = url.substring(url.lastIndexOf("sys_id=")+7);
             var ampIndex = defaultVideo.indexOf("&");
             if (ampIndex > -1)
                defaultVideo = defaultVideo.substring(0,ampIndex);
             var select = gel("attachment_list");
             if (select) {
                for(var i = 0; select.options.length > i; i++) {
                   if (select.options[i].value == defaultVideo) {
                      select.options.selectedIndex = i;
                      isAttachmentVideo = true;
                      break;
                   }
                }
                if (isAttachmentVideo) {
                   setLinkType('attachment');
                }
             }
          }

          if (hasDbVideo=="true") {
             if (!isAttachmentVideo) {
                   if (url.endsWith("x")) {
                      var select = gel("dbvideo_list");
                      if (select) {
                         var dbVideo = url.substring(0,url.length-1);
                         for(var i = 0; select.options.length > i; i++) {
                            if (select.options[i].value == dbVideo ||
                (dbVideo.indexOf("/") == 0 && select.options[i].value == dbVideo.substring(1))) {
                               select.options.selectedIndex = i;
                               isDbVideo = true;
                               break;
                            }
                         }
                         if (isDbVideo) {
                            setLinkType('dbvideo');
                      }
                   }
             }
          }

          if (!isURL)
             if (!isDbVideo)
                if (!isAttachmentVideo)
                   notFound = true; // show message later after the screen is set up, it looks better that way
       }
      }
     }

     if (!isURL)
        if (!isAttachmentVideo) {
           if (!isDbVideo) {
               if (hasDbVideo == "true")
                  setLinkType("dbvideo");
               else
                  setLinkType("attachment");

        }
     }

     if (notFound)
        alert("${gs.getMessage('No such video file.  Most likely it was deleted or renamed.  You may choose another now.')}");
  }

function onOK() {
  var linkType = getLinkType();
  if (linkType == "attachment") {
    if (!getAttachmentId()) {
        return false;
    }
  } else if (linkType == "dbvideo") {
        if(!getDbVideoName()) {
           return false;
        }
  } else if (linkType == "url") {
     if (trim(gel("f_url").value)=="")
        return false;
  } else {
        if (!getDbVideoName())
                return false;
  }

  // pass data back to the calling window
  var fields = {"f_url": true, "f_width": true, "f_height": true, "f_allowfullscreen": true, "f_allowscriptaccess": true};
  var param = new Object();
  for (var id in fields) {
    var el = gel(id);
    if (el) {
       if (el.type=="checkbox")
          param[id] = (el.checked == true);
       else
          param[id] = el.value;
    }
  }

  if (linkType == "attachment")
    param['f_url'] = buildAttachmentLink(getAttachmentId());
  if (linkType == "dbvideo")
        param['f_url'] = getDbVideoName();
  param['f_type'] = linkType;

  param['f_clsid'] = gel('ni.return_clsid').value;
  param['f_embed_type'] = gel('ni.return_embed_type').value;
  param['f_codebase'] = gel('ni.return_codebase').value;
  param['f_pluginspage'] = gel('ni.return_pluginspage').value;

  var gdw = GlideDialogWindow.get();
  var action = gdw.getPreference("action"); // we set the action to do as a dialog preference
  action(param);
}

function onPreview(defaultAttachment) {
  var url;
  var filename = ".swf";

  var linkType = getLinkType();
  if (linkType == "url") {
     var urlInput = gel("f_url");
    urlInput.value = htmlEscape(urlInput.value);
     url = transformWatchUrl(urlInput.value);
     urlInput.value = url;
     filename = url;
     var index = url.indexOf("?");
     if (index > -1)
        filename = url.substring(0,index-1);
  } else if (linkType == "attachment") {
     var attachmentId;
     if (defaultAttachment) { // used to preview the video when the dialog first loads if editing existing
        attachmentId = defaultAttachment;
        url = buildAttachmentLink(defaultAttachment);
     } else {
        attachmentId = getAttachmentId()
        url = buildAttachmentLink(attachmentId);
     }
     var select = gel("attachment_list");
     if (select) {
        for(var i = 0; i < select.options.length; i++) {
           if (select.options[i].value == attachmentId) {
              filename = select.options[i].text;
              break;
           }
        }
     } else
        alert("${gs.getMessage('no attachment_list')}");
  } else if (linkType == "dbvideo") {
        url = getDbVideoName();
        filename = url;
  }

  if (!url) {
    hide("ipreview");
    return false;
  }

  previewVideo("preview_img_load", url, filename);
  return false;
}

function previewVideo(id, src, filename) {
   var dot = filename.lastIndexOf('.')+1;
   var fileType = filename.substring(dot);
   fileType = fileType.toLowerCase();
   if (fileType.endsWith("x"))
      fileType = fileType.substring(0,fileType.length-1);
   if (fileType == "")
      fileType = "swf";
   var found = getExtensionIndex(fileType);
   if (found == -1)
      found = getExtensionIndex("swf");

   gel("ni.return_clsid").value = embedObjectInfo.clsids[found];
   gel("ni.return_embed_type").value = embedObjectInfo.embedTypes[found];
   gel("ni.return_codebase").value = embedObjectInfo.codebases[found];
   gel("ni.return_pluginspage").value = embedObjectInfo.pluginsPages[found];

	var isHTTPS = /^https?:\/\//.test(filename)

   if (fileType == "swf" || isHTTPS)
      vis("flash_options");
   else
      invis("flash_options");
   var ipreview = gel('ipreview');

   /*
   * For youtube and other video websites iframes are the required or
   * recommened way to use the video players.
   */
   var html
   var gdw = GlideDialogWindow.get();
   var videoGenerationFunction = gdw.getPreference("getVideoHTML");
   if (videoGenerationFunction || isHTTPS) {
      html = videoGenerationFunction({
         f_url: src,
         f_type: 'url',
         f_width: "100%",
         f_height: "100%"
      });
   } else {
      html = '<video controls width="100%" height="100%" src="' + src + '" />';
   }

   ipreview.innerHTML = html;
   show("ipreview");
}

function getExtensionIndex(fileType) {
   var found = -1;
   for (var i=0; i<embedObjectInfo.extensions.length; i++) {
      if (embedObjectInfo.extensions[i] == fileType) {
         found = i;
         break;
      }
   }
   return found;
}

function showNewDbVideo() {
   hide("ipreview");
   show("new_dbvideo");
   hideObject(gel("dbvideo_list"));
   hideObject(gel("new_db_video_button"));
   var select = gel("dbvideo_list");
   if (select.options && select.options.length > 0)
      showObjectInline(gel("new_dbvideo_cancel"));
}

function checkDbVideoSubmitOK(changeType) {
   var videoNameElement = gel("db_video_name");
   var videoName = trim(videoNameElement.value);
   var fileName = gel("attachFile").value;
   if (changeType == "file" && fileName && !videoName) {
      var i = fileName.lastIndexOf("\\");
      if (i > -1)
         fileName = fileName.substring(i+1);
      videoName = fileName;
      videoNameElement.value = fileName;
   }
   if (videoName && fileName)
      toggleButton("new_dbvideo_ok", true);
   else
      toggleButton("new_dbvideo_ok", false);
}

function submitDbVideo() {
   var videoNameElement = gel("db_video_name");
   var videoName = videoNameElement.value;
   if (!endsWithVideoExtension(videoName, gel("ni.file_extensions").value)) {
      videoNameElement.focus();
      toggleButton("new_dbvideo_ok", false);
      alert("${gs.getMessage('Name is not a recognized view file format')}");
      return false;
   }

   var fileName = gel("attachFile").value;
   if (!endsWithVideoExtension(fileName, gel("ni.file_extensions").value)) {
      alert("${gs.getMessage('File is not a recognized video file format. Must be one of')} ${jvar_video_extensions}");
      toggleButton("new_dbvideo_ok", false);
      return false;
   }

   var exists = videoAlreadyExists(videoName);
   if (exists == "false") {
      hide("new_dbvideo_ok");
      hide("new_dbvideo_cancel");
      show("dbvideo_please_wait");
      return true;
   } else {
      toggleButton("new_dbvideo_ok", false);
      alert("${gs.getMessage('There is already an video file by this name.  Choose a different name.')}");
      return false;
   }
}

function videoAlreadyExists(videoName) {
   var gdw = GlideDialogWindow.get();
   var forceReplace = gdw.getPreference("force_replace");
   if (forceReplace == 'true')
       return "false";

   var aj = new GlideAjax("DbVideoNameCheck");
   aj.addParam("sysparm_name", videoName);
   var responseXML = aj.getXMLWait();
   if (responseXML && responseXML.documentElement) {
      var items = responseXML.getElementsByTagName("match");
      var item = items[0];
      var exists = item.getAttribute("exists");
      return exists;
   }

   return "false";
}

function cancelDbVideo() {
   hide("new_dbvideo");
   show("ipreview");
   showObjectInline(gel("dbvideo_list"));
   showObjectInline(gel("new_db_video_button"));
}

function addNewDbVideo(name) {
   hide("dbvideo_please_wait");
   show("ipreview");
   var select = gel("dbvideo_list");
   addOption(select, name, name, true);
   onPreview(name + "x");
   gel("new_dbvideo_form").reset();
   toggleButton("new_dbvideo_ok", false);
   showObjectInline(gel("new_dbvideo_ok"));
   showObjectInline(gel("new_dbvideo_cancel"));
}

function addNewDbVideoFailed() {
   hide("dbvideo_please_wait");
   showObjectInline(gel("new_dbvideo_ok"));
   showObjectInline(gel("new_dbvideo_cancel"));
   alert("${gs.getMessage('Failed to add the new video file to the database.')}");
}

function showNewAttachmentVideo() {
   hide("ipreview");
   show("new_attachmentvideo");
   hide("attachment_list");
   hide("new_attachment_video_button");
   var select = gel("attachment_list");
   if (select.options && select.options.length > 0)
      showObjectInline(gel("new_attachmentvideo_cancel"));
}

function checkAttachmentSubmitOK() {
   var fileName = gel("attachmentFile").value;
   if (fileName)
      toggleButton("new_attachmentvideo_ok", true);
   else
      toggleButton("new_attachmentvideo_ok", false);
}

function submitAttachmentVideo() {
   var videoNameElement = gel("attachmentFile");
   var videoName = videoNameElement.value;
   if (!endsWithVideoExtension(videoName, gel("ni.file_extensions").value)) {
      videoNameElement.focus();
      alert("${gs.getMessage('Attachment is not a recognized video file format')}");
      return false;
   }
   show("attachment_please_wait");
   hide("new_attachmentvideo_ok");
   hide("new_attachmentvideo_cancel");
   return true;
}

function addNewAttachmentVideo(sysid,contentType,name) {
   hide("attachment_please_wait");
   show("ipreview");
   var select = gel("attachment_list");
   addOption(select, sysid, name, true);
   onPreview(sysid);
   var showView = gel("ni.show_attachment_view").value;
   var showPopup = gel("ni.show_attachment_popup").value
   addAttachmentNameToForm(sysid, name, "New", "images/attachment.gifx", showView, showPopup);
   gel("new_attachmentvideo").reset();
   toggleButton("new_attachmentvideo_ok", false);
   showObjectInline(gel("new_attachmentvideo_ok"));
   showObjectInline(gel("new_attachmentvideo_cancel"));
}

function cancelAttachmentVideo() {
   hide("new_attachmentvideo");
   show("ipreview");
   showObjectInline(gel("attachment_list"));
   showObjectInline(gel("new_attachment_video_button"));
}

function getLinkType() {
    var select = gel("link_type");
    return select.options[select.options.selectedIndex].value;
}

function setLinkType(t) {
    setSelectChoice("link_type", t);
}

function setSelectChoice(id, choice) {
    var select = document.getElementById(id);
    for(var i = 0; select.options.length > i; i++) {
        if (select.options[i].value == choice) {
            select.options.selectedIndex = i;
            if (select['onchange'])
                select.onchange();
        }
    }
}

function changedLinkType() {
    var type = getLinkType();

    if (type == "attachment") {
        showAttachment(true);
        showDbVideo(false);
        showURL(false);
    } else if (type == "dbvideo") {
        showAttachment(false);
        showDbVideo(true);
        showURL(false);
    } else if (type == "url") {
        showAttachment(false);
        showDbVideo(false);
        showURL(true);
    }
    show("ipreview");

    onPreview();
}

function showAttachment(showIt) {
    var typeAttachment = gel("type_attachment");
    if (showIt == true) {
        show(typeAttachment);
        show("ipreview");
        var select = gel("attachment_list");
        if (!select.options || select.options.length==0) { // no options so show the new panel
            hide("attachment_list");
            showNewAttachmentVideo();
        } else {
            hide("new_attachmentvideo");
            showObjectInline(gel("attachment_list"));
            showObjectInline(gel("new_attachment_video_button"));
        }
    } else
        hide(typeAttachment);
}

function showDbVideo(showIt) {
    var typeDbVideo = gel("type_dbvideo");
    if (showIt == true) {
        show(typeDbVideo);
        var select = gel("dbvideo_list");
        if (!select.options || select.options.length==0) { // no options so show the new panel
            hide("dbvideo_list");
            showNewDbVideo();
        } else {
            hide("new_dbvideo");
            showObjectInline(gel("dbvideo_list"));
            showObjectInline(gel("new_db_video_button"));
        }
    } else
        hide(typeDbVideo);
}

function showURL(showIt) {
    var typeUrl = gel("type_url");
    if (showIt == true)
        show(typeUrl);
    else
        hide(typeUrl);
}

function buildAttachmentLink(id) {
    if (id)
        return "sys_attachment.do?sys_id=" + id + "&view=true";

    return;
}

function getAttachmentId() {
    var select = gel("attachment_list");
    if (select.options.selectedIndex > -1)
        return select.options[select.options.selectedIndex].value;

    return;
}

function getDbVideoName() {
    var select = gel("dbvideo_list");
    if (select.options.selectedIndex > -1)
        return select.options[select.options.selectedIndex].value + "x";

    return;
}

function adjustFullScreen() {
    var urlInput = gel("f_url");
    var url = convertToEmbededURL(urlInput.value);
    urlInput.value = url;
}

// Some video sites have one format for pasting the URL into your browser and another variation when you embed it.  This
// trasform the "watch" link into the "embed" format.
function transformWatchUrl(url) {
   var newUrl = convertToEmbededURL(url);
   newUrl = transformDailyMotionUrl(newUrl);
   return newUrl;
}

function getQueryVariables(urlString) {
    var url = document.createElement('a');
    url.href = urlString;
    var vars = url.search.substring(1).split('&');
    var queryObject = vars.reduce(function (prev, current) {
      var currentVar = current.split("=");
      prev[currentVar[0]] = currentVar[1];
      return prev;
    }, {});
    return queryObject;
}

function getVimeoNumber(urlString) {
  var urlArray = urlString.split('/');
  return urlArray[urlArray.length-1];
}

function isYoutube(url) {
  return /^(https?:\/\/)?(www\.)?youtu(\.be||be\.com)/.test(url);
}

function isVimeo(url) {
  return /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+(\/)?$/.test(url);
}

function convertToEmbededURL(urlString) {
  if (isYoutube(urlString)) {
    var videoNumber = getQueryVariables(urlString)["v"];
    if (videoNumber) {
      return 'https://www.youtube.com/embed/' + videoNumber;
   }
  } else if (isVimeo(urlString)) {
    return "https://player.vimeo.com/video/" + getVimeoNumber(urlString);
  }
  return urlString;
}

function transformDailyMotionUrl(url) {
   var dmStart = "http://www.dailymotion.com/video/";
   var dmStartSecure = "https://www.dailymotion.com/video/";
   if (!url.startsWith(dmStart) && !url.startsWith(dmStartSecure))
      return url;

   var newUrl = "";
   if (url.startsWith(dmStart)){
      newUrl = "http://www.dailymotion.com/swf/" + url.substring(dmStart.length);

   }else{
      newUrl = "https://www.dailymotion.com/swf/" + url.substring(dmStartSecure.length);
   }
   return newUrl;
}

function toggleButton(buttonID, active) {
       var cn = 'disabled';
       var db = true;
       if (active) {
          cn = 'web';
          db = false;
       }

       var b = gel(buttonID);
       b.disabled = db;
       b.setAttribute('class', cn);
       b.setAttribute('className', cn);
}

function toggleAdvanced() {
  var e = document.getElementById("advanced_options");
  if (e) {
    if (e.style.display == "block") {
      e.style.display = "none";
      deletePreference("image_select.advanced.options");
    } else {
      e.style.display = "block";
      setPreference("image_select.advanced.options","true");
    }
  }
}

function invis(id) {
  var e = gel(id);
  if (e)
    e.style.visibility = "hidden";
}

function vis(id) {
  var e = gel(id);
  if (e)
    e.style.visibility = "visible";
}
