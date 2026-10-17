function loadIndexSuggestion() {
   var url = new GlideURL('upload.do');
   url.addParam('sysparm_referring_url', "sys_index_suggestion_list.do");
   url.addParam('sysparm_target', "sys_index_suggestion");
   var frame = top.gsft_main;
   if (!frame)
      frame = top;

   frame.location = url.getURL();
}
