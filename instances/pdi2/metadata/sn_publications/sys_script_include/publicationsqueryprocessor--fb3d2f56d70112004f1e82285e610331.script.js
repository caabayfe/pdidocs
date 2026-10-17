var PublicationsQueryProcessor = Class.create();

		PublicationsQueryProcessor.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
			fetchPublications: function() {
				var query = this.getParameter("sysparm_query");
				var limit = parseInt(this.getParameter("sysparm_limit")) || 20;
				var offset = parseInt(this.getParameter("sysparm_offset")) || 0;
				var unreadOnly = this.getParameter("sysparm_unread_only") == 'true';
				var escapeHTML = this.getParameter("sysparm_escapeHTML") == 'true';
				var pubGr = this._runQuery(query, limit, offset, unreadOnly);
				var response = {result:[]};								
				if(unreadOnly) {
					response.unreadCount = pubGr.getRowCount();
					response.count = this._runQuery(query, limit, offset, false).getRowCount();
				}else {
					response.unreadCount = this._runQuery(query, limit, offset, true).getRowCount();
					response.count = pubGr.getRowCount();					
				}
				while(pubGr.next()) {
					var pubUserM2mGr = new GlideRecord('sn_publications_publication_contact_m2m');
					var userReadPublication = false;
					pubUserM2mGr.addQuery('publication', pubGr.getUniqueValue());
					pubUserM2mGr.addQuery('user', gs.getUserID());
					pubUserM2mGr.query();
					if(pubUserM2mGr.next()) {
						userReadPublication = true;
					}
					var short_desc = pubGr.getValue('short_description');
					if(escapeHTML){
						short_desc = GlideStringUtil.escapeHTML(short_desc);
					}
					var pub = {
						content: pubGr.getValue('content_type') == 'wiki' ? pubGr.getDisplayValue('wiki') : pubGr.getDisplayValue('text'),
						sys_id: pubGr.getUniqueValue(),
						category: pubGr.getDisplayValue('category'),
						short_description: short_desc,
						publish_date: pubGr.getDisplayValue('publish_date'),
						expiry_date: pubGr.getDisplayValue('expiry_date'),
						read_publication: userReadPublication
					};
					response.result.push(pub);
				}
				var json = new global.JSON();
				return json.encode(response);
			},
			
			_sanitizeQuery: function(query) {
				if (!query) return query;
				// Block dot-walk and disallowed operators in field name position.
				// Normalize to lowercase so mixed-case field names (e.g. Sys_Created_By.field) are caught.
				// Strip all known query prefixes in a loop to handle chained prefixes (e.g. NQOR...).
				// Note: JOIN/JAVASCRIPT:/DYNAMIC/GOTO are only blocked in field position so that legitimate
				// search values like "how to join meeting" are not affected.
				var disallowedInlineOps = /dynamic|javascript:/;
				var prefixPattern = /^(orderbydesc|orderby|groupby|nq|or)/;
				// Matches a valid condition: plain field name (no dot) followed by a known operator and value.
				// After prefix stripping, ORDERBY/ORDERBYDESC conditions reduce to bare field names (no operator);
				// those are matched by the separate bareFieldPattern below.
				var validConditionPattern = /^([a-z0-9_]+)(startswith|endswith|contains|isnotempty|isempty|between|like|in|!=|>=|<=|>|<|=)/;
				var bareFieldPattern = /^[a-z0-9_]+$/;
				var conditions = query.split('^');
				for (var i = 0; i < conditions.length; i++) {
					var cond = conditions[i].toLowerCase();
					var prev;
					do {
						prev = cond;
						cond = cond.replace(prefixPattern, '');
					} while (cond !== prev);
					if (cond === '') continue;
					if (/^(join|javascript:|dynamic|goto)/.test(cond) || disallowedInlineOps.test(cond)) {
						gs.warn('PublicationsQueryProcessor: rejected query containing disallowed operator: ' + query);
						return null;
					}
					// Require the condition to match the expected shape: plain field name then operator,
					// OR a bare field name (result of stripping an ORDERBY/ORDERBYDESC/GROUPBY prefix).
					// A field name with a dot means cross-table traversal (oracle attack vector).
					// If the condition matches neither shape, reject it (fail-closed).
					var fieldMatch = cond.match(validConditionPattern);
					if (fieldMatch) {
						if (fieldMatch[1].indexOf('.') !== -1) {
							gs.warn('PublicationsQueryProcessor: rejected query containing dot-walk in field position: ' + query);
							return null;
						}
					} else if (!bareFieldPattern.test(cond)) {
						gs.warn('PublicationsQueryProcessor: rejected unparseable condition: ' + query);
						return null;
					} else if (cond.indexOf('.') !== -1) {
						gs.warn('PublicationsQueryProcessor: rejected query containing dot-walk in field position: ' + query);
						return null;
					}
				}
				return query;
			},

			_runQuery: function(query, limit, offset, unreadOnly) {
				var pubGr = new GlideRecordSecure('sn_publications_publication');
				var sanitized = this._sanitizeQuery(query);
				if(query && !sanitized) {
					return pubGr;
				}
				if(sanitized) {
					pubGr.addEncodedQuery(sanitized, true);
				}
				if(limit) {
					pubGr.chooseWindow(offset, limit + offset, true);
					gs.info("offset:"+offset);
					gs.info("limit:"+limit);					
				}
				if(unreadOnly) {
					var subQuery = pubGr.addJoinQuery('sn_publications_publication_contact_m2m', 'sys_id', 'publication');
					subQuery.addCondition("user", gs.getUserID());
					subQuery.addCondition("viewed_article", false);			
				}
				pubGr.query();
				return pubGr;
			}
		});
