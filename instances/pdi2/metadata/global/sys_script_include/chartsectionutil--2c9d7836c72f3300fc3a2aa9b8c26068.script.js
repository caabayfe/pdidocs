var ChartSectionUtil = Class.create();
ChartSectionUtil.prototype = {
    initialize: function() {
    },
	filterChartsBySectionType:function(){
				
		var sectionType= current.type;
		if(sectionType == "single_score"){
			return "type=report^report.type=single_score^NQtype=PA";
		}else if(sectionType == "report"){
			return "type=report^report.type!=single_score";
		}else if (sectionType == "data_visualization_single_score") {
            return "type=data_visualization^data_visualization.type=single_score";
        } else if (sectionType == "data_visualization_chart")
            return "type=data_visualization^data_visualization.typeINbar,Donut,Pie,Line,Spline,step_line";

		return "";
	},
    type: 'ChartSectionUtil'
};
