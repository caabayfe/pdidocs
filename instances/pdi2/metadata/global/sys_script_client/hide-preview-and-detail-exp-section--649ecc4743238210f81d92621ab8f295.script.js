function onLoad() {
    var guidanceSysId = g_form.getUniqueValue();
    if (guidanceSysId != undefined) {
        var ga = new GlideAjax('global.GuidancePreviewExpUtil');
        ga.addParam('sysparm_name', 'getCustomExperienceDetails');
        ga.addParam('sysparm_guidanceSysId', guidanceSysId);
        ga.getXML(function(response) {
            var responseString = response.responseXML.documentElement.getAttribute("answer");
            var resObj = JSON.parse(responseString);
            if (resObj && resObj.preview) {
                g_form.setSectionDisplay('preview_experience', false);
            }
            if (resObj && resObj.detail) {
                g_form.setSectionDisplay('detail_experience', false);
            }
            return;
        });
    }
}
