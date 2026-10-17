var SurveyUtilAjax = Class.create();
SurveyUtilAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isPublic: function(){
		return true;
	},

	validateMultipleStringFieldsAjax: function() {
		return this.validateMultipleStringFields(this.getParameter('stringQAnswerChangeMap'));
	},

	// stringQAnswerMap: {key:field id or name, {value: field value, validator: field validator})
	validateMultipleStringFields: function(stringQAnswerMap) {
		stringQAnswerMap = JSON.parse(stringQAnswerMap);
               if (!stringQAnswerMap)
                 return "";
		var result = (new SNC.AssessmentCreation()).validateMultipleStringFields(stringQAnswerMap);
               if (result === "")
                 return "{}";
		return result;
	},
	
    type: 'SurveyUtilAjax'
});
