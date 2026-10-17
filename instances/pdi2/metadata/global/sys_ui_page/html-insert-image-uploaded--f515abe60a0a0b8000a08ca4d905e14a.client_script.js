newImageUpoaded();

function getParam(name) {
    var regex = new RegExp("[?|&]" + name + "=([^&#]*)");
	//match param between '? or &' and 'not & or #'
	var results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function newImageUpoaded() {
   var ATTACHMENT_PREFIX = "attachment:";
   var DB_IMAGE_PREFIX = "db_image:";
   var DB_VIDEO_PREFIX = "db_video:";
   var errorMesg = getParam('sysparm_error');

   if (newImageInfo.startsWith(ATTACHMENT_PREFIX)) {
	   if (errorMesg != ""){
		 alert(errorMesg);
		 parent.changedLinkType();
		 var loading = parent.gel("attachment_please_wait");
		 if (loading)
		 	hide(loading);

		 var file = parent.gel("attachmentFile");
		 if (file)
		   file.value = '';

		 var attachBtn = (parent.gel("new_attachmentvideo_ok") != null) ? parent.gel("new_attachmentvideo_ok") : parent.gel("new_attachmentimage_ok");
		 if (attachBtn)
		 	showObjectInline(attachBtn);

		 return;
	   }

	   if (parent.cancelAttachmentImage)
         parent.cancelAttachmentImage();
	   else
         parent.cancelAttachmentVideo();

      var imageSysId = newImageInfo.substring(ATTACHMENT_PREFIX.length);
      var semiColon = imageSysId.indexOf(";");
      var contentType = imageSysId.substring(semiColon+1);
      imageSysId = imageSysId.substring(0,semiColon);
      semiColon = contentType.indexOf(";");
      var imageName = contentType.substring(semiColon+1);
      contentType = contentType.substring(0,semiColon);
	   
	 var url = "/api/now/table/sys_attachment?sysparm_query=sys_id=" + imageSysId + "&sysparm_fields=file_name";
	   $j.ajax({url:url}).then(function(response) {	
		   if (response.result.length !== 0)
			   if (typeof response.result[0].file_name !== 'undefined' && response.result[0].file_name !== '')
				   imageName = response.result[0].file_name; 
		  if (parent.gel("new_attachmentimage"))
			 parent.addNewAttachmentImage(imageSysId, contentType, imageName);
		  else
			 parent.addNewAttachmentVideo(imageSysId, contentType, imageName);
	   });
   } else if (newImageInfo.startsWith(DB_IMAGE_PREFIX)) {
      var imageSysId = newImageInfo.substring(DB_IMAGE_PREFIX.length);
      if (imageSysId == "failed;") {
         parent.addNewDbImageFailed("no sys_id returned");
         return;
      }
      var semiColon = imageSysId.indexOf(";");
      var imageName = imageSysId.substring(semiColon+1);
      imageSysId = imageSysId.substring(0,semiColon);
      parent.cancelDbImage();
      parent.addNewDbImage(imageName);
   } else if (newImageInfo.startsWith(DB_VIDEO_PREFIX)) {
      var videoSysId = newImageInfo.substring(DB_VIDEO_PREFIX.length);
      if (videoSysId == "failed;") {
         parent.addNewDbVideoFailed("no sys_id returned");
         return;
      }
      var semiColon = videoSysId.indexOf(";");
      var videoName = videoSysId.substring(semiColon+1);
      videoSysId = videoSysId.substring(0,semiColon);
      parent.cancelDbVideo();
      parent.addNewDbVideo(videoName);
   }
}
