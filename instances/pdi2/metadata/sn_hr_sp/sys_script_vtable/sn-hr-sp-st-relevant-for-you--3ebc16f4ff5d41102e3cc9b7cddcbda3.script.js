(function executeQuery(v_table, v_query) {
		var data = {};
	
		//adding data properties
		data.userPredictionCount = 25;
		data.cardType = 'single';
		data.listType = 'card-list';
	
	
		//service portal accessible knowledge bases and catalog items, need to check if they work on remote tables.
		var knowledgeBases = getKnowledgeBases();
		var displayCount = 10;
		data.viewType = (displayCount > 3) ? 'max-view' : 'min-view';
		var RelevantForYouUtil = new sn_hr_sp.RelevantForYouUtil();
		var taxonomyId = new sn_me.MobileTaxonomyUtil().getMobileServicePortalTaxonomy();
	
		// creating payloads
		var catalogPayload = {
			users: null,
			catalogCount: displayCount,
			ignoredCatalogs: null,
			recentActivityCutoffDate: null,
			taxonomyId: taxonomyId
		};
		
		var articlesPayload = {
				users: null,
				knowledgeBases: knowledgeBases,
				kbRecords : getAllKBRecords(knowledgeBases),
				articleCount: displayCount,
				recentActivityCutoffDate: null,
				taxonomyId: taxonomyId
		};
	
		var dataItems = RelevantForYouUtil.getRelevantArticlesAndCatalogs(articlesPayload,catalogPayload, displayCount, data.userPredictionCount, taxonomyId);
		addRowsToVTable(dataItems);
	
		// ---- helper functions ----
		
		
		function getKnowledgeBases() {
			var kbGR = new GlideRecord('kb_knowledge_base');
			var kbIDs = [];
			kbGR.addActiveQuery();
			kbGR.query();
			while(kbGR.next()) {
				kbIDs.push(kbGR.getUniqueValue());
			}
			return kbIDs.join(",");
		}
		
		function getAllKBRecords(kbIDs) {
			var gr = new GlideRecord("kb_knowledge");
			if (kbIDs)
				gr.addQuery("kb_knowledge_base", "IN", kbIDs);
	
			gr.addQuery("workflow_state", "published");
			return gr;
		}

		function transformToHumanFriendlyDate(rawDate) {
			// Time gaps in ms
			var TIME_UNITS = [
				{ label: 'year', ms: 31536000000 },
				{ label: 'month', ms: 2592000000 },
				{ label: 'week', ms: 604800000 },
				{ label: 'day', ms: 86400000 },
				{ label: 'hour', ms: 3600000 },
				{ label: 'minute', ms: 60000 },
				{ label: 'Just Now', ms: 0 }
			];

			var localizedMessages = {
				"time.year.singular": "{0} year ago",
				"time.year.plural": "{0} years ago",
				"time.month.singular": "{0} month ago",
				"time.month.plural": "{0} months ago",
				"time.week.singular": "{0} week ago",
				"time.week.plural": "{0} weeks ago",
				"time.day.singular": "{0} day ago",
				"time.day.plural": "{0} days ago",
				"time.hour.singular": "{0} hour ago",
				"time.hour.plural": "{0} hours ago",
				"time.minute.singular": "{0} minute ago",
				"time.minute.plural": "{0} minutes ago"
			};

			var gap = new Date().getTime() - rawDate;

			if (gap < 60000 && gap >= 0) {  
				return gs.getMessage('Just Now');
			}

			for (var i = 0; i < TIME_UNITS.length; i++) {
				var unit = TIME_UNITS[i];
				var label = unit.label;
				var ms = unit.ms;
				if (gap >= ms) {
					var value = Math.floor(gap / ms);
					// L10n warning reason: this key is used to lookup a localized message for un-concatenated string
					var key = 'time.' + label + (value === 1 ? '.singular' : '.plural');
					return gs.getMessage(localizedMessages[key], value.toString());
				}
			}
		}

	function addRowsToVTable(relevantItems) {
		relevantItems.forEach(function(item) {
			v_table.addRow({
				sys_id : item.sys_id,
				active : true,
				content_sys_id : item.sys_id,
				content_url : item.category == 'article' ? 'id=kb_article&sys_id='+item.sys_id : 'id=sc_cat_item&sys_id='+item.sys_id,
				title : item.category == 'article' ? item.short_description : item.name,
				description : item.category == 'article' ? item.meta_description : item.short_description,
				image: item.image && item.image.replace(".iix", ""),
				type :  item.category == 'article' ? gs.getMessage('Article') : gs.getMessage('Request'),
				icon : item.category == 'article' ? 'article-document' : 'cart-full',
				view_type : data.viewType,
				additional_info : item.sys_updated_on ? transformToHumanFriendlyDate(new GlideDateTime(item.sys_updated_on).getNumericValue()) : '',
				access_price: item.category == 'article' ? null : item.price 
			});
		});

	}
	

})(v_table, v_query);
