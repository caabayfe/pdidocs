function onLoad() {
  var source = g_form.getValue("source");
  if (source == null || source == '' || source == 'false') {
    var url = g_form.getValue("instance_url");
    if (url == null || url.length == 0)
      g_form.setValue("instance_url", "https://instance.service-now.com");

    if (!g_form.isNewRecord())
      g_form.setReadOnly("instance_url", true);

    _addLoadingImg();   
  }
}

function _addLoadingImg() {
  $('instance.do').insert({after: "<div id='authenticatingTargetLoadingDiv' style='display:none'><img src='images/loading_anim2.gifx'/> Authenticating Target...</div>"});
}
