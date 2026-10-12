var variableDebugger = {
		actions : [],
		messages : {
			"time_taken" : "${gs.getMessage('Time taken to execute')}"
		},
		searchText : '',
		typingTimer : null,
		decodeHelper: document.createElement('textarea'),
		doneTypingInterval : 500,
        showChildren : function (el) {
            $$(el.getAttribute('data-target')).each(function(current){
                if(current.classList.contains('collapsed')) {
                    current.classList.remove('collapsed');
                }
                current.show();
            });
            el.classList.remove('collapsed');
        },
        hideChildren : function (el) {
            $$(el.getAttribute('data-target')).each(function(current){
                if(!current.classList.contains('collapsed')) {
                    current.classList.add('collapsed');
                }
                current.hide();
            });
            el.classList.add('collapsed');
        },
        toggleCollapse : function (el) {
            if(el.classList.contains('collapsed')) {
                variableDebugger.showChildren(el);
            } else {
                variableDebugger.hideChildren(el);
            }
			
        },
		collapseAll: function() {
			$$('#log-content tr.collapisble:not(.collapsed)').each(function(el) {
				variableDebugger.hideChildren(el);
			});
		},
		expandAll: function() {
			$$('#log-content tr.collapisble.collapsed').each(function(el) {
				variableDebugger.showChildren(el);
			});
		},
		onKeyUpForSearch : function() {
			clearTimeout(this.typingTimer);
			this.typingTimer = setTimeout(this.searchForScriptOrVariable,
					this.doneTypingInterval);
		},
		onKeyDownForSearch : function() {
			clearTimeout(this.typingTimer);
		},
		searchForScriptOrVariable : function() {
			if (!document.getElementById('search_logs')) return;
			var textForSearch = document.getElementById('search_logs').value;
			if (textForSearch) {
				if(variableDebugger.searchText.toLowerCase() === textForSearch.toLowerCase())
					return;
				variableDebugger.searchText = textForSearch.toLowerCase();
				variableDebugger.actions = g_form.actions;
				variableDebugger.actions.map(function(action) {
					action.visible = variableDebugger.filterLogsForSearch(action);
					return action;
				});
			} else {
				variableDebugger.searchText = '';
				g_form.actions.map(function(action) {
					action.visible = true;
					return action;
				});
				variableDebugger.actions = g_form.actions;
			}
			variableDebugger.removeTableRows();
			variableDebugger.runOnLoad(variableDebugger.actions);
			variableDebugger.filterLogsByCategory();
		},
		filterLogsForSearch : function(action) {
			var name = "";
			if (action.type == 'context') {
				name = action.name;
			} else {
				name = this.getVariableName(action.field);
				variableDebugger.decodeHelper.innerHTML = name;
				name = variableDebugger.decodeHelper.value;
			}
			var ret = name.toLowerCase().indexOf(variableDebugger.searchText) > -1;
			if (!ret && action.actions) {
				for (var i = 0; i < action.actions.length; i++) {
					ret = variableDebugger.filterLogsForSearch(action.actions[i]);
					if (ret) {
						return ret;
					}
				}
			}
			return ret;
		},
		print : function() {
			window.self.print();
		},
		filterLogsByCategory : function(event) {
			$$('#log-content tbody tr').invoke('addClassName', 'hidden');
			var classes = "";
			if (document.getElementById("chk_client_script").checked) {
				classes = "tr.sys_script_client";
			}
			if (document.getElementById("chk_ui_policy").checked) {
				classes += classes ? ",tr.ui_policy" : "tr.ui_policy";
			}
			if (document.getElementById("chk_data_lookup").checked) {
				classes += classes ? ",tr.data_lookup" : "tr.data_lookup";
			}	
			if (classes)
				$$('#log-content tbody ' + classes).invoke('removeClassName',
				'hidden');
			$$('#log-content tbody tr.no_search').invoke('removeClassName', 'hidden');
		},
		runOnLoad : function(actions) {
			if ((!actions || actions.length == 0) && !this.searchText) {
				document.getElementById('debug-controls').style.display = 'none';
				document.getElementById('log-content').innerHTML = getMessage('No Action Logs have been captured at the moment');
				return;
			} else {
				document.getElementById('debug-controls').style.display = '';
			}
			var html = "<tbody>";
			var no_action = true;
			for (var i = 0; i < actions.length; i++) {
				var action = actions[i];
				if (action.visible === true) {
					no_action = false;
					html += "<tr role='button' onclick='event.stopPropagation(); variableDebugger.toggleCollapse(this)' class='success collapisble " + action['category'] + "' step='"
					+ action.step + "'  data-target='."
						+ ('cls-' + (i + 1))
						+ "'>";
					html += "<td>" + (i + 1) + "</td>";
					html += "<td colspan='2'><span class='pull-left'>";
					html += '<span class="label label-default">';
					html += (g_optics_inspect_handler.CATEGORIES[action['category']] || '&lt;${"Unknown"}&gt;');
					html += "</span> ";
					html += "<a class='collapse-icon' style='text-decoration: none; font-size: 9px;' href='javascript:void(0)' title='" + getMessage('Expand or Collapse') + "'></a> ";
					html += this.getActionLink(action) + "</span>";
					html += "<span class='badge badge-primary pull-right' title='" + this.messages.time_taken + "'>";
					html += (action.startTime ? this.processDuration(action.endTime - action.startTime): 'NA');
					html += "</span></td>";
					html += "</tr>";
					html += this.processActions(action.actions, (i + 1), action,
							('cls-' + (i + 1)) + ' ' + action['category']);
				}
			}
			if (no_action) {
				html += "<tr class='no_search'><td colspan='3' style='text-align: center'>&lt;${gs.getMessage('Your search did not return any results')}&gt;</td></tr>";
			}
			html += '</tbody>' ;
			var table = document.getElementById('log-content').childNodes[0];
			table.insertAdjacentHTML('beforeend', html);
		},
	
		removeTableRows : function() {
			var table = document.getElementById('log-content').childNodes[0];
			if (table.childNodes[1])
				table.removeChild(table.childNodes[1]);
		},
	
		toTitleCase : function(str) {
			return str.split(' ').map(function (s) {
				return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
				}).join(' ');
		},

		processActions : function(actions, prefix, context, targetClass) {
			if (!actions)
				return;

			var html = "";

			if (actions.length == 0) {
				html += "<tr class='"
					+ targetClass
					+ " collapse in'><td colspan='3' class='text-center'>&lt;${gs.getMessage('No action occured')}&gt;</td></tr>";
			} else {
				actions.sort(function(a, b) {
					if (a.step > b.step)
						return -1;
					if (a.step < b.step)
						return 1;
					if (a.step == b.step)
						return 0;
				});
				var index = 1;
				for (var i = 0; i < actions.length; i++) {
					var action = actions[i];
					var tempPrefix = prefix ? prefix + '.' + (index++) : (index++);
					if (action.type === 'context') {
						html += "<tr  role='button' onclick='variableDebugger.toggleCollapse(this)'  class='active collapisble " + targetClass
						+ " collapse in' step='" + action.step + "' data-target='.cls-" + tempPrefix.replace(/\./g,'_') + "'>";
						html += "<td>" + tempPrefix + "</td>";
						html += "<td colspan='2'>"
							+ '<span class="pull-left"><span class="label label-default"">'
							+ (getMessage(g_optics_inspect_handler.CATEGORIES[action['category']]) || '&lt;${gs.getMessage("Unknown")}&gt;')
							+ "</span>" + "<a class='collapse-icon' style='text-decoration: none; font-size: 9px;' href='javascript:void(0)' title='" + getMessage('Expand or Collapse') + "' ></a> "
							+ this.getActionLink(action) + "</span>";
						html += "<span class='pull-right badge badge-primary' title=" + this.messages.time_taken + ">"
							+ this.processDuration(action.endTime - action.startTime)
							+ "</span></td>";
						html += "</tr>";
						html += this.processActions(action.actions,
								tempPrefix + '', action, 'cls-' + tempPrefix.replace(/\./g,'_') + ' ' + targetClass);
					} else if (action.type === 'log') {
						if (context) {
							html += "<tr class='" + targetClass
							+ " collapse in' step='" + action.step + "'>";
							html += "<td>" + tempPrefix + "</td>";
							if (action.field) {
								html += "<td><a target='_blank' href='item_option_new.do?sys_id="
									+ action.field.replace('IO:', '')
									+ "'>"
									+ this.highLightText(this.getVariableName(action.field))
											+ "</a></td>";
							} else {
								html += "<td>"
									+ this.highLightText(this.getVariableName(action.field))
											+ "</td>";
							}
							html += "<td>" + action.message + "</td>";
							html += "</tr>";
						}
					}
				}
			}
			return html;
		},
		highLightText : function(text) {
			if (this.searchText) {
				variableDebugger.decodeHelper.innerText = this.searchText;
				var keyWord = variableDebugger.decodeHelper.innerHTML;
				var reg = new RegExp(keyWord, 'gi');
				text = text.replace(reg, function(str) {
					return '<span class="highlight">' + str + '</span>';
				});
			}
			return text;
		},
		getActionLink : function(context) {
			if (context) {
				var tableName = context.category;
				if (tableName === "ui_policy") {
					tableName = "catalog_ui_policy";
				}
				if (tableName == "request_action")
					tableName = "sys_ui_action";
				var link = context["sys_id"] ? "<a  target='_blank' href="
						+ tableName + ".do?sys_id=" + context.sys_id + ">"
						+ (this.highLightText(context.name) || '&lt;${gs.getMessage("Unknown")}&gt;')
						+ "</a>"
						: (this.highLightText(context.name) || '&lt;${gs.getMessage("Unknown")}&gt;');
						return link;
			}
			return "";
		},

		getCSVContent : function(parentAction, prefix) {
			if (!parentAction || parentAction.actions.length == 0) {
				return prefix + "," + (parentAction.name || '<${gs.getMessage("Unknown")}>') +
				+ ",<${gs.getMessage('No action occured')}>\n";
			}
			var csvContent = "";
			for (var i = 0; i < parentAction.actions.length; i++) {
				var action = parentAction.actions[i];
				var tempPrefix = prefix ? (prefix + '.' + (i + 1)) : (i + 1) + '';
				if (action.type === 'context') {
					csvContent += this.getCSVContent(action, tempPrefix + '');
				} else {
					csvContent += tempPrefix + ","
					+ (parentAction.name || '<${gs.getMessage("Unknown")}>') + ","
					+ this.getVariableName(action.field) + ","
					+ action.message + "\n";
				}

			}
			return csvContent;
		},

		exportDebugDetailsToCSV : function() {
			var csvContent = "${gs.getMessage('Order')},${gs.getMessage('Source Name')},${gs.getMessage('Field Name')},${gs.getMessage('Message')}\n";
			if (this.actions && this.actions.length > 0) {
				for (var i = 0; i < this.actions.length; i++) {
					var action = this.actions[i];
					var filtered =  false;
					if (document.getElementById("chk_client_script").checked && "sys_script_client" == action['category']) {
						filtered = true;
					}
					if (document.getElementById("chk_ui_policy").checked && "ui_policy" == action['category']) {
						filtered = true;
					}
					if (document.getElementById("chk_data_lookup").checked && "data_lookup" == action['category']) {
						filtered = true;
					}
					if (action.visible && filtered)
						csvContent += this.getCSVContent(action, (i + 1) + '');
				}
			}
			csvContent = csvContent.replace(/\n$/, "");
			if (navigator.msSaveBlob) { // IE 10+ 
				navigator.msSaveBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), "variable_action_logs_"
						+ (new Date()).getTime() + ".csv"); 
			} else {
				var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
				var link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", "variable_action_logs_"
						+ (new Date()).getTime() + ".csv");
				document.body.appendChild(link); // Required for FF
				link.click();
			}
		},
		clearLogs : function() {
			g_form.actions = [];
			this.actions = [];
			this.searchText = '';
			//document.getElementById('search_logs').value = this.searchText;
			this.removeTableRows();
			//this.runOnLoad(this.actions);
			alert('${gs.getMessage("The action logs have been cleared")}');
		},
		processDuration : function(duration) {
			var sec = parseInt(duration / 1000);
			if (sec == 0) 
				return duration + "ms";
			else
				return sec + "s " + parseInt(duration % 1000) + "ms";
		},
        getVariableName: function(id) {
            if (!id)
                return;
            id = id.startsWith('IO:') ? id : 'IO:' + id;
            return g_form.resolveLabelNameMap(id);
        }
};
(function() {
	if (typeof g_form !== 'undefined') {
		g_form.actions.map(function(action) {
			action.visible = true;
			return action;
		});
		variableDebugger.actions = g_form.actions;
		document.getElementById('log-content').click();
		document.getElementById('search_logs').focus();
	} else {
		document.getElementById('debug-controls').style.display = 'none';
		document.getElementById('log-content').innerHTML = getMessage('Form not available');
	}
	variableDebugger.runOnLoad(g_form.actions);
})();
