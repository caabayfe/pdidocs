function openPreviewExpBuilder() {

    var guidance = g_form.getUniqueValue();
    var ga = new GlideAjax('GuidancePreviewExpUtil');
    ga.addParam('sysparm_name', 'getPreviewUIBUrl');
    ga.addParam('sysparm_guidance', guidance);
    ga.getXML(function(response){
        var outputs = response.responseXML.getElementsByTagName("output");
        if (outputs && outputs.length > 0) {
            var success = outputs[0].getAttribute("success");
            if (success == "false") {
                var msg = outputs[0].getAttribute("message");
                g_form.addErrorMessage(msg);
            } else {
                var url = outputs[0].getAttribute('url');
                g_navigation.open('/now/builder/ui/edit/experience/' + url, '_blank');
            }
            return;
        }
    });

return false;
}
