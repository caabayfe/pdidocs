function onLoad() {
	function tagToObj(tag, detectValue) {
		var ans = {};
		var attrs = tag.attributes;
		if (attrs.length == 1 && tag.getAttribute('value')) {
			ans = tag.getAttribute('value');
		} else {
			for (var i = 0; i < attrs.length; i++) {
				var attr = attrs.item(i);
				ans[attr.name] = attr.value;
			}
		}
		return ans;
	}
	function toJson(resp) {
		var ans = {};
		var tags = resp.responseXML.documentElement.childNodes;
		for (var i = 0; i < tags.length; i++) {
			var tag = tags.item(i);
			var tagName = tag.nodeName;
			if (tag.getAttribute('idx')) {//Then this is array
				if (!ans[tagName])
					ans[tagName] = [];
				ans[tagName].push(tagToObj(tag, false));
			} else {
				ans[tagName] = tagToObj(tag, true);
			}
		}
		return ans;
	}

	ga = new GlideAjax('StdChangeUtils');
	ga.addParam('sysparm_name', 'getFieldConfigs');
	ga.setWantSessionMessages(false);
	ga.getXML(function(resp) {
		window.g_sncStdChg = toJson(resp);
	});
}
