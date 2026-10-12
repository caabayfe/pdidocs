(function executeRule(current, previous /*null when async*/ ) {
    var config = new WrapUpInteractionUtil().getWrapUpConfiguration(current);
      if (config != null) {
		var segmentGr = new GlideRecord('interaction_wrap_up_segment');
		segmentGr.addQuery('interaction', current.getUniqueValue());
		segmentGr.addQuery('agent', current.getValue('assigned_to'));
		segmentGr.addQuery('state','open');
		segmentGr.orderByDesc('opened_on');
		segmentGr.query();
		var currentDateTime = new GlideDateTime().getValue();
		var defaultCodeSysId = config.getValue('default_code') ? config.default_code.sys_id : '';
		if (segmentGr.next()) {
			sn_interaction.WrapUpSegment.updateSegment(segmentGr.getUniqueValue(), current.getValue('assigned_to'),
    current.getUniqueValue(), '', defaultCodeSysId, '', currentDateTime, false, null);
		}
	}
})(current, previous);
