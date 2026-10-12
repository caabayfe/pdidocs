function onSubmit() {
   var videoName = g_form.getValue("name");
   var extensionsObject = gel("ni.db_video.video.supported_extensions");
   if (!extensionsObject)
      return;

   var extensions = extensionsObject.value;
   if (endsWithVideoExtension(videoName, extensions))
      return;

   alert(getMessage("Video names must end with one of the supported extensions: ") + extensions);
   g_form.flash("db_video.name", "#FFFACD", 0);
   return false;
}
