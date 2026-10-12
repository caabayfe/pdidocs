var GuidedTourDesignerHelper = Class.create();
GuidedTourDesignerHelper.prototype = {
    initialize: function() {
    },
	
	getCurrentDomain : function(){
		var currentDomain ;
		
		if(gs.getUser().getDomainDisplayValue() == 'global')
			currentDomain = 'global';
		else
			currentDomain = gs.getUser().getDomainID();
		
		return currentDomain;
	},
	
	getUserUI16Preference : function(){
		return gs.getPreference('use.concourse');
	},
	
	getSanitizedHTML : function(text){
		if (!SNC.GlideHTMLSanitizer)
			return JSUtil.escapeText(text);
		
		return SNC.GlideHTMLSanitizer.sanitizeWithConfig("HTMLSanitizerConfig",text); 
		
	},

	getExpNameofTour: function(tourId) {
		var experience = '';
		var tourType = '';
		var tourContext = '';

		var tourRec = new GlideRecord('sys_embedded_tour_guide');
		tourRec.addQuery('sys_id', '=', tourId);
		tourRec.query();
		if (tourRec.next()) {
			tourType = tourRec.type.toString();
			tourContext = tourRec.context.toString();
		} else {
			return 'ERR: Invalid tourId';
		}

		switch (tourType) {
			case 'custom_ui':
				experience = 'Custom';
				break;
			case 'platform':
				experience = 'Standard UI';
				break;
			case 'service_portal':
				experience = tourRec.getDisplayValue('sp_portal').toString() || 'ERR: Undefined sp_portal';
				break;
			case 'now_experience':
				//TODO: Store experience reference in guided tour table to access the name
				var gr = new GlideRecord('sys_ux_page_registry');
				try {
					var tourContextSearchPath;
					if (tourContext.startsWith('now')) {
						var parts = tourContext.split('/');
						tourContextSearchPath = parts[1];
					} else if (tourContext.startsWith('x')) {
						var xparts = tourContext.split('/');
						tourContextSearchPath = xparts[2];
					} else {
						experience = 'ERR: Unusual now_experience context';
						break;
					}

					gr.addActiveQuery();
					gr.addQuery('path', 'CONTAINS', tourContextSearchPath);
					gr.query();
					var urlPathLength = 0;
					while (gr.next()) {
						var expPath = gr.getValue('path').toString();
						if (tourContext.includes(expPath) && expPath.length > urlPathLength) {
							experience = gr.getValue('title');
							urlPathLength = expPath.length;
						}
					}
					experience = experience || 'ERR: Experience Not Found';
				} catch (e) {
					experience = 'ERR: Parsing error - ' + JSON.stringify(e);
				}
				break;
			default:
				experience = 'ERR: Unknown tour type';
				break;
		}
		return experience;
    },
	
	/*
	  Helper function to evalute ACL for tour creation
	*/
	canUserCreateTours: function() {
		var standard_ui = gs.getProperty('com.snc.guided_tours.standard_ui.enable', 'false') === 'true';
		var sp = gs.getProperty('com.snc.guided_tours.sp.enable', 'false') === 'true';
		var custom = gs.getProperty('com.snc.guided_tours.custom_ui.enable', 'false') === 'true';
        var ga = gs.getUser().hasRole('guided_tour_admin');
        return (standard_ui || sp || custom) && ga;
	}, 
	/*
	  Helper function to evalute ACL for tour edit and delete
	*/
    canUserUpdateTours: function(type) {
		var standard_ui = gs.getProperty('com.snc.guided_tours.standard_ui.enable', 'false')   ==='true';
		var sp = gs.getProperty('com.snc.guided_tours.sp.enable', 'false') === 'true';
		var custom = gs.getProperty('com.snc.guided_tours.custom_ui.enable', 'false') === 'true';
		var ga = gs.getUser().hasRole('guided_tour_admin');
		var answer = false;

		if((type == 'platform'|| type == 'now_experience') && standard_ui) {
			answer = true;
		}else if(type == '' && standard_ui) {
			answer = true;
		}else if(type == 'service_portal' && sp) {
			answer = true;
		}else if(type == 'custom_ui' && custom)
			answer = true;
		return answer && ga;
	},

    type: 'GuidedTourDesignerHelper'
};
