var GlideTimeZoneUtil = Class.create();
GlideTimeZoneUtil.prototype = {
    initialize: function() {
    },
	
	// returns a list of all available time zones in the system
	process: function(tableName) {
		var list = new GlideChoiceList();
		var gr = new GlideRecord("sys_choice");
		gr.addEncodedQuery("language=" + gs.getSession().getLanguage() + "^element=time_zone^inactive=false^name=sys_user^ORname=" + tableName + "^value!=NULL_OVERRIDE");
		gr.query();
		while (gr.next()) {
			list.add(new GlideChoice(gr.value, gr.label));
		}
		return list;
	},
	
	// Obsolete, please use method in script include "GlideUtcTimeUtils"
	adjustTimetoTimeZone: function(time, timezone) {
		var gt = new GlideTime();
		var UTCtoUser = gt.getTZOffset();
		var gdt = new GlideDateTime();
		gdt.setTZ(timezone);
		var UTCtoTZ = gdt.getTZOffset();
		var TZtoUser = UTCtoUser - UTCtoTZ;
		
		gt.setValue(time);
		gt.add(TZtoUser);
		return gt;
	},

    type: 'GlideTimeZoneUtil'
};
