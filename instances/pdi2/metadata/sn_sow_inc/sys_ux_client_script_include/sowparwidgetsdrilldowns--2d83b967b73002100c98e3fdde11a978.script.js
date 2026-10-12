function include() {
	return {
		getPayload (event) {
			const {eventOrigin, currentTabParFilters} = event.payload;
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
						dataSourceType,
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
					const coreUIParam = `${table}_list.do?sysparm_query=${query}`;
					payload = {
						context: {
							path: 'now/nav/ui'
						},
						params: {
							target: coreUIParam,
						},
						route: 'classic',
						title: title || table,
					};
				} else if (kpiSysId) {
					payload = {
						fields: {
							dataSourceId: kpiSysId,
							dataSource: 'analyticalmodel',
						},
						params: {
							breakdowns,
							aggregate,
							scoreDate,
							domain,
						},
						route: 'kpi-details',
						title: title || 'KPI Details',
					};
				} else if (dataSourceType === 'indicator') {
					payload = {
						fields: {
							dataSourceId: indicatorSysid,
							dataSource: 'kpid',
						},
						params: {
							breakdowns,
							aggregate,
							scoreDate,
							domain,
						},
						route: 'kpi-details',
						title: title || 'KPI Details',
					};
					if (currentTabParFilters) {
						const {parFilters} = currentTabParFilters;
						payload.params.startDate = parFilters.length ? parFilters[0].start : null;
						payload.params.endDate = parFilters.length ? parFilters[0].end : null;
					}
				}
			}

			if (eventOrigin === 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED') {
				const {table, row, title} = event.payload;
				const coreUIParam = `${table}.do?sys_id=${row?.sys_id?.value || '-1'}`;
				payload = {
					context: {
						path: 'now/nav/ui'
					},
					params: {
						target: coreUIParam,
					},
					route: 'classic',
					title: title || 'Form Record',
				};
			}

			if (eventOrigin === 'SN_PAR_CALENDAR_CONNECTED#EVENT_CLICKED') {
				const {table, title, sysId} = event.payload.event;

				const coreUIParam = `${table}.do?sys_id=${sysId || '-1'}`;
				payload = {
					context: {
						path: 'now/nav/ui'
					},
					params: {
						target: coreUIParam,
					},
					route: 'classic',
					title: title || 'Form Record',
				};
			}

			if (eventOrigin === 'NOW_RECORD_LIST_CONNECTED#VIEW_ALL_CLICKED') {
				const {table, query, listTitle, currentTabParFilters, listFilters} = event.payload;
				const filterQueries = currentTabParFilters && currentTabParFilters.encodedQueries && currentTabParFilters.encodedQueries[table] ? `${currentTabParFilters.encodedQueries[table]}^` : '';
				let queryWithFilterClauses = `${filterQueries}${query || ''}`;
				if (listFilters)
					queryWithFilterClauses = `${queryWithFilterClauses}^${listFilters}`;
					
				const coreUIParam = `${table}_list.do?sysparm_query=${queryWithFilterClauses}`;
				payload = {
					context: {
						path: 'now/nav/ui'
					},
					params: {
						target: coreUIParam,
					},
					route: 'classic',
					title: listTitle || 'List',
				};
			}

			return payload;
		},
	};
}
