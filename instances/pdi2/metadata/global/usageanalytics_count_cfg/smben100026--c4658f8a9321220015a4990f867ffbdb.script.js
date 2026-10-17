var totalViews = 0;
var totalDistinctKBsViewed = 0;

function getKBViewCounts() {
	
	var kbTbl = "kb_use";

	if(!GlideTableDescriptor.isValid(kbTbl)) 
		return 0;
	
	 var gr = new GlideAggregate(kbTbl);
	 gr.addAggregate("SUM", "times_viewed");
	 gr.addAggregate("COUNT(DISTINCT", "article");
	 gr.addEncodedQuery("sys_created_onONYesterday@javascript:gs.daysAgoStart(1)@javascript:gs.daysAgoEnd(1)");
	 gr.setGroup(false);
     gr.query();

     if(gr.next()) {
        
		totalViews = JSUtil.nil(gr.getAggregate("SUM", "times_viewed")) ? 0 : gr.getAggregate("SUM", "times_viewed");
		totalDistinctKBsViewed = JSUtil.nil(gr.getAggregate("COUNT(DISTINCT", "article")) ? 0 : gr.getAggregate("COUNT(DISTINCT", "article");
		 
	 }
	
	return totalViews;
}

answer = '{"count": "' + getKBViewCounts() + '","TotalDistinctKBsViewed":"' + totalDistinctKBsViewed + '"}';
