function include() {
   /** DEF0773592: Check if the URL exceeds the maximum size, in Global we have :
	* {
	*  "use_tiny": true,
	*  "min_length": 2000
	*	}
	* however we cannot access it from here, so we set default 2000
	*/
	function isMaxURLSizeExceeded(url) {
		const maxSizeForDomainNameAndWorkspacePath = 200;
		const maxURLSize = 2000;
		const totalURLSize = url.length + maxSizeForDomainNameAndWorkspacePath;
		return totalURLSize > maxURLSize;
	}

    /**
     * Extracts the view name for a specific table from the drilldownListView object
     * @param {Record<string, string> | string | undefined} drilldownListView - Can be an object mapping table names to view names, or a legacy string value
     * @param {string | undefined} table - The table name to look up
     * @returns {string | undefined} The view name for the table, or undefined if not found
     */
    const getViewNameForTable = (drilldownListView, table) => {
        if (!drilldownListView) {
            return undefined;
        }
        // Handle object format (new approach)
        if (typeof drilldownListView === 'object') {
            return table ? drilldownListView[table] : undefined;
        }
        // Handle legacy string format - return the string value for backward compatibility
        return drilldownListView;
    };

	// Create a tiny URL for a given URL, we cannot access GlideTinyURL().createTinyURL from here
	// user token is always set in globalWindow.g_ck
	function createTinyURLSync(url, globalWindow) {
		if (!globalWindow) return url;
		try {
			const client = new globalWindow.XMLHttpRequest();
			client.open('POST', '/api/now/tinyurl', false);
			client.setRequestHeader('Content-Type', 'application/json');
			client.setRequestHeader('Accept', 'application/json');
			client.setRequestHeader('X-UserToken', globalWindow.g_ck); //this is available globally
			client.send(JSON.stringify({
				url: url
			}));
			if (client.status === 200 || client.status === 201) {
				const response = JSON.parse(client.responseText);
				return response.result;
			}
		} catch (e) {
			console.error('Failed to create tiny URL:', e);
		}
		return url;
	}

	// Constructs payload for UI navigation to CoreUI list view
	function getCoreUIListNavigationPayload(coreUIParam, title) {
		return {
			context: {
				path: 'now/nav/ui'
			},
			params: {
				target: coreUIParam,
			},
			route: 'classic',
			title: title,
			navigationOptions: {},
		}
	}

	// Constructs payload for UI navigation to CoreUI form view
	function getCoreUIFormNavigationPayload(coreUIParam, title) {
		return {
			context: {
				path: 'now/nav/ui'
			},
			params: {
				target: coreUIParam,
			},
			route: 'classic',
			title: title || 'Form Record',
			navigationOptions: {},
		};
	}

	// Constructs payload for UI navigation to Seismic list view
	function getSeismicListNavigationPayload(table, query, title, drilldownListView) {
		return {
			route: 'simplelist',
			fields: { table: table || '' },
			params: {
				query: query || '',
				listTitle: title || table,
				listView: drilldownListView || '-1',
			},
			title: title,
			navigationOptions: {},
		};
	}

	// Constructs payload for UI navigation to Seismic form view
	function getSeismicFormNavigationPayload(table, sysId, title) {
		return {
			route: 'record',
			fields: {
				table: table || '',
				sysId: sysId || '',
			},
			title: title || 'Form Record',
			navigationOptions: {},
		};
	}

	const navigateToCoreUI = (url, globalWindow) => {
		if (!globalWindow) return;
		globalWindow?.top?.NOW?.CustomEvent.fire("magellanNavigator.permalink.set", {
			title: globalWindow.document.title,
			relativePath: encodeURIComponent("/" + url),
		});

		globalWindow?.location?.assign(url);
	};

	return {
		getPayload(event, isPolarisDisabled, globalThis) {
			const { eventOrigin, componentProps, widgetProps, drilldownToCoreUI } = event.payload;
			const drilldownListView = widgetProps?.drilldownListView;
			const globalWindow = globalThis?.window;
			let payload;

			if (eventOrigin === 'NOW_VIS_WRAPPER#CLICKED') {
				const {
					params: {
						table,
						query,
						indicatorSysid,
						kpiSysId,
						breakdowns,
						aggregate,
						domain,
						scoreDate,
						scoreTime,
						calendarInfo,
						dataSourceType,
						dateRange,
					},
					title,
				} = event.payload;

				if (dataSourceType === 'metricBase') {
					const {
						params: {
							dateRange: {
								startTime,
								endTime,
							},
							ciSysId,
							ciType,
						},
					} = event.payload;
					payload = {
						route: 'metric-explorer',
						params: {
							ciSysId,
							ciType,
							startTime,
							endTime,
							chartIndex: -1,
						},
						title: 'Metric Explorer',
					};
				} else if (dataSourceType === 'hlaElasticSearchComponents') {
					payload = {
						route: 'log-viewer',
						params: {},
						title: 'Log viewer',
					};
				} else if (dataSourceType === 'table') {
				// Extract view name for the specific table from the object
					const viewName = getViewNameForTable(drilldownListView, table);
					const urlParams = [];
					if (query) {
						urlParams.push(`sysparm_query=${encodeURIComponent(query)}`);
					}
					if (viewName) {
						urlParams.push(`sysparm_view=${encodeURIComponent(viewName)}`);
						urlParams.push(
							`sysparm_userpref.${table}_list.view=${encodeURIComponent(
								viewName
							)}`
						);
					}

					let coreUIParam = `${table}_list.do?${urlParams.join('&')}`;

					if (drilldownToCoreUI && isMaxURLSizeExceeded(coreUIParam)) {
						coreUIParam = createTinyURLSync(coreUIParam, globalWindow);
					}
					payload = drilldownToCoreUI
						? getCoreUIListNavigationPayload(coreUIParam, title)
						: getSeismicListNavigationPayload(table, query, title || table, viewName);
				} else if (dataSourceType === 'indicator') {
					let startDate;
					let endDate;
					const getDateString = d => d.toISOString().split('T')[0];
					if (dateRange?.startTime) {
						startDate = getDateString(new Date(dateRange.startTime));
					}
					if (dateRange?.endTime) {
						endDate = getDateString(new Date(dateRange.endTime));
					}

					payload = {
						fields: {
			            uuid: indicatorSysid || '',
		            },
		            params: {
			            breakdowns: breakdowns || '',
			            aggregate: aggregate || '',
			            scoreDate: scoreDate || '',
			            scoreTime: scoreTime || '',
			            domain: domain || '',
			            startDate: startDate || '',
			            endDate: endDate || '',
			            calendarInfo: calendarInfo || '',
		            },

					route: 'ac_kpi_details',
					title: title || 'KPI Details',
					};
				}
			}

			if (eventOrigin === 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED') {
				const { table, row, title, currentRecordRowIndex, totalRecordCount, concatenatedQuery } = event.payload;
				const sysId = row?.sys_id?.value;
				const hasRecordNavigation =
					currentRecordRowIndex !== undefined &&
					currentRecordRowIndex !== null;
				const viewName = getViewNameForTable(drilldownListView, table);
				const params = [`sys_id=${sysId || '-1'}`];
				if (viewName) {
					params.push(`sysparm_view=${encodeURIComponent(viewName)}`);
				}
				if (hasRecordNavigation) {
					params.push(
						`sysparm_record_row=${currentRecordRowIndex}`,
						`sysparm_record_rows=${totalRecordCount}`
					);
				}
				if (concatenatedQuery) {
					params.push(`sysparm_record_list=${encodeURIComponent(concatenatedQuery)}`);
				} else if (hasRecordNavigation) {
					// Edge case: pass empty sysparm_record_list to enable navigation buttons
					params.push('sysparm_record_list');
				}
				let coreUIParam = `${table}.do?${params.join('&')}`;
				if (drilldownToCoreUI && isPolarisDisabled) {
					navigateToCoreUI(coreUIParam, globalWindow)
					return;
				}
				payload = drilldownToCoreUI ? getCoreUIFormNavigationPayload(coreUIParam, title) : getSeismicFormNavigationPayload(table, sysId, title);
			}

			if (eventOrigin === 'SN_PAR_CALENDAR_CONNECTED#EVENT_CLICKED') {
				const { table, title, sysId } = event.payload.event;
				const URLEncodedDrilldownListView = encodeURIComponent(drilldownListView);
				const coreUIParam = `${table}.do?sys_id=${sysId || '-1'}&sysparm_view=${URLEncodedDrilldownListView}`;
				if (drilldownToCoreUI && isPolarisDisabled) {
					navigateToCoreUI(coreUIParam, globalWindow)
					return;
				}
				payload = drilldownToCoreUI ? getCoreUIFormNavigationPayload(coreUIParam, title) : getSeismicFormNavigationPayload(table, sysId, title);
			}

			if (eventOrigin === 'NOW_RECORD_LIST_CONNECTED#VIEW_ALL_CLICKED') {
				const { table, query, listTitle, currentTabParFilters } = event.payload;
				const listFilters = fixedQuery || componentProps?.fixedQuery;
				const filterQueries = currentTabParFilters && currentTabParFilters.encodedQueries && currentTabParFilters.encodedQueries[table] ? `${currentTabParFilters.encodedQueries[table]}^` : '';
				let queryWithFilterClauses = `${filterQueries}${query || ''}`;
				if (listFilters)
					queryWithFilterClauses = `${queryWithFilterClauses}^${listFilters}`;

				const URLEncodedQuery = encodeURIComponent(queryWithFilterClauses);
				const URLEncodedDrilldownListView = encodeURIComponent(query);
				const coreUIParam = `${table}_list.do?sysparm_query=${URLEncodedQuery}&sysparm_view=${URLEncodedDrilldownListView}`;
				if (drilldownToCoreUI && isPolarisDisabled) {
					navigateToCoreUI(coreUIParam, globalWindow)
					return;
				}

				payload = drilldownToCoreUI ? getCoreUIListNavigationPayload(coreUIParam, listTitle) : getSeismicListNavigationPayload(table, queryWithFilterClauses, listTitle || 'List', drilldownListView);
			}

			if (event.payload.navigationOptions) {
				payload.navigationOptions = event.payload.navigationOptions;
			}
			return payload;
		},
	};
   }
