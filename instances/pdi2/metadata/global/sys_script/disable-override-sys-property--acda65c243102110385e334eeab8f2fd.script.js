(function executeRule(current, previous /*null when async*/ ) {
			var isOverrideProp = new GlidePropertiesDB().isOverrideProperty(current.name);
			g_scratchpad.isOverrideProperty = isOverrideProp;

			if (isOverrideProp) {
				var moreInfoMsgLink = '<a target="_blank" href="/api/now/v1/context_doc_url/revertible-behavior-instance-security-hardening">'+ gs.getMessage("More Info") + '</a>';
				gs.addInfoMessage(sn_i18n.Message.getMessage("sys-properties-msg", "This property cannot be deleted. {more_info_link}", {more_info_link: moreInfoMsgLink}));
			}
		})(current, previous);
