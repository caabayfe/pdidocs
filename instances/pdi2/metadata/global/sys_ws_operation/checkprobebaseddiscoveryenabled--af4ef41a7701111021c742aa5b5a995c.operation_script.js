(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var isProbeBasedDiscoveryEnabled = isProbeDiscoveryActive();
    var result = {
        'value': isProbeBasedDiscoveryEnabled,
		'kbUrl': 'https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0694477'
    };
    response.setBody(result);
    response.setStatus(200);
    response.setContentType('application/json');
})(request, response);

function isProbeDiscoveryActive() {

    var plugin = new GlidePluginManager();
    if (!plugin.isActive('com.snc.discovery.core'))
        return "false";

    var prevClassifier = '';
    var classifierList = [];
    var classifierObject = {};
    var au = new ArrayUtil();

    var probePatternList = ['c277921c0a0a0b1c00719b2c948d2719', '94bbe5830a0a0b82005d40873b8e0695', '94c2ab610a0a0b82009ed1ef45b1f48a', 'c759f913c313200031e65ad8cbba8fd7', '0e5b55adc0a80a390075725cd6b0eeb5', '156bf4a137010100a664384c5dbe5d75', '98d98911cb293200a03ef59ea34c9c7e', 'c277e37c0a0a0b1c007b6daef23d8786', 'c27bd8460a0a0b1c009b4a01dd95229e', 'c27bf9730a0a0b1c00427d6ef5e9c2e1', 'c27c1ccf0a0a0b1c006149d6a38f3958', 'c27c58df0a0a0b1c00991796ad6971ee', 'b9d852c60ab3015100c74a8e158664ca', 'b9e8a5b40ab30151007111d556cd0718', '7b91ce17c0a80fd000d79dadac118963', '7b91ca8fc0a80fd00025134633edf527', '7b91c0afc0a80fd00040cc655f2507d7', '7b91be46c0a80fd000fac9a374861146', '7b91c3b1c0a80fd0003403a47b4fc46b', '8c7f114d37530000dadacffbcfbe5d3a', '80af75bbc32221002d031f051eba8fe9', '7b91c2c3c0a80fd000d316c7a732834c', '7b91c214c0a80fd0001c22b52b96f389', '8448a958535202001f175f43911c083a', 'b6cce1d8535202001f175f43911c08f7', 'e16c61d8535202001f175f43911c088c', '68dbed98535202001f175f43911c0861', 'fdab4c2bff30310000d3ffffffffff88', '08b6cdb29f6202002887734ec32e70e7'];

    var grClassifier = new GlideRecord('discovery_classifier_probe');
    grClassifier.orderBy('classy.sys_id');
    grClassifier.setWorkflow(false);
    grClassifier.query();

    while (grClassifier.next()) {
        if (grClassifier.classy.toString() != prevClassifier) {
            if (prevClassifier != '')
                classifierList.push(classifierObject);
            classifierObject = {};
            classifierObject.name = grClassifier.classy.getDisplayValue();
            classifierObject.sys_id = grClassifier.classy.toString();
            classifierObject.hasPattern = false;
            classifierObject.hasProbe = false;
            classifierObject.activePattern = false;
            classifierObject.activeProbe = false;
            prevClassifier = grClassifier.classy.toString();
        }
        if (grClassifier.child == '4f64c6389f230200fe2ab0aec32e7068' || grClassifier.child.getDisplayValue() == 'Horizontal Pattern') {
            classifierObject.hasPattern = true;
            if (grClassifier.active)
                classifierObject.activePattern = true;
        } else if (grClassifier.phase == "identification" || grClassifier.classy.sys_class_name == 'discovery_classy_proc') {
            classifierObject.hasProbe = true;
            if (grClassifier.active)
                classifierObject.activeProbe = true;
        }
    }
    classifierList.push(classifierObject);

    for (var i = 0; i < classifierList.length; i++) {
        if ((classifierList[i].hasPattern == true && classifierList[i].hasProbe == true && classifierList[i].activeProbe == true) || (au.contains(probePatternList, classifierList[i].sys_id) && classifierList[i].activeProbe == true)) {
            return "true";
        }
    }
    return "false";
}
