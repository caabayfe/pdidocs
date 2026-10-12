
function include() {
	const getNumberSeparators = () => {
		return {
			decimal: '.',
			grouping: ',',
		};
	};

	const getSafeLocale = (locale, fallback) => {
		try {
			const [supported] = Intl.NumberFormat.supportedLocalesOf(locale);

			if (supported) {
				return supported;
			}

			const [language] = locale.split('-');
			const [supportedLanguage] = Intl.NumberFormat.supportedLocalesOf(language);
			return supportedLanguage || fallback;
		} catch (e) {
			return fallback;
		}
	};

	const getI18nNumber = (number = 0, locale) => {
		const separators = getNumberSeparators();
		// Because we use custom formatting, we convert to a known format and
		// replace the separators manually
		return new Intl.NumberFormat(getSafeLocale(locale, 'en-US')).format(number)
			.replace(',', separators.grouping)
			.replace('.', separators.decimal);
	};

	const formatNumber = (number = 0, options = {}) => {
		const {
			units: {
				k = 'k',
				m = 'm',
				b = 'b',
			} = {},
			locale = 'en-US',
		} = options;

		// If we need to display the full number, then just display the number
		if (options.full)
			return getI18nNumber(number, locale);

		if (number >= 10 ** 9)
			return getI18nNumber(Math.round(number / (10 ** 8)) / 10, locale) + b;

		if (number >= 10 ** 6)
			return getI18nNumber(Math.round(number / (10 ** 5)) / 10, locale) + m;

		if (number >= 10 ** 3)
			return getI18nNumber(Math.round(number / (10 ** 2)) / 10, locale) + k;

		return getI18nNumber(number, locale);
	};

	/**
	 * Formats a duration in milliseconds into a human-readable string (e.g., "2h 30m").
	 * @param {number} milliseconds - The duration to format.
	 * @param {Object} [options] - Formatting options.
	 * @param {number} [options.count=1] - Max number of time units to display (e.g., 2 → "1h 30m").
	 * @param {Object} [options.units] - Custom labels for units (e.g., { s: 'sec', m: 'min' }).
	 * @returns {string} Formatted duration string.
	 *
	 * Rounding behavior:
	 * - When units are cropped (parts > count), the last displayed unit is rounded
	 *   to nearest, but ONLY if the first cropped unit is immediately adjacent in
	 *   the d→h→m→s hierarchy (e.g., seconds rounds minutes, but not hours).
	 * - Examples: 1m 55s (count=1) → "2m", 1m 1s (count=1) → "1m",
	 *            23h 0m 55s (count=1) → "23h" (gap, no rounding).
	 */
	const formatDuration = (milliseconds, options = {}) => {
		const {
			count = 1,
			units: {
				s = 's',
				m = 'm',
				h = 'h',
				d = 'd',
			} = {},
		} = options;

		// Unit definitions ordered largest → smallest, each with its ms divisor
		const unitDivisors = [
			{ suffix: d, divisor: 86400000 },
			{ suffix: h, divisor: 3600000 },
			{ suffix: m, divisor: 60000 },
			{ suffix: s, divisor: 1000 },
		];

		// If milliseconds comes as 0 or sub-second, just return '0s'
		if (!milliseconds || milliseconds < 1000)
			return '0' + s;

		// Decomposes ms into an array of non-zero { value, suffix, divisor } objects
		const buildUnits = (ms) => {
			const result = [];
			let remainder = ms;
			for (const { suffix, divisor } of unitDivisors) {
				const value = Math.floor(remainder / divisor);
				remainder %= divisor;
				if (value)
					result.push({ value, suffix, divisor });
			}
			return result;
		};

		const parts = buildUnits(milliseconds);

		// Round the last kept unit only if the immediately adjacent smaller unit is being cropped.
		// e.g., if last kept is minutes and first cropped is seconds → round (adjacent).
		//        if last kept is hours and first cropped is seconds → don't round (gap, minutes=0).
		if (parts.length > count) {
			const lastKeptDivisor = parts[count - 1].divisor;
			const firstCroppedDivisor = parts[count].divisor;
			const lastKeptIdx = unitDivisors.findIndex(u => u.divisor === lastKeptDivisor);
			if (firstCroppedDivisor === unitDivisors[lastKeptIdx + 1]?.divisor) {
				// Round to nearest multiple of the last kept unit's granularity, then recompute
				const rounded = Math.round(milliseconds / lastKeptDivisor) * lastKeptDivisor;
				const roundedParts = buildUnits(rounded);
				return roundedParts.slice(0, count).map(p => p.value + p.suffix).join(' ');
			}
		}

		return parts.slice(0, count).map(p => p.value + p.suffix).join(' ');
	};


	const getNewCIMFormPayload = (input) => {
		const params = {
			parent: input.parent,
			source_id: input.sourceId,
			source_table: input.sourceTable,
			sys_domain: input.domain,
			short_description: input.shortDescription,
			what_should_be_measured: input.whatShouldBeMeasured,
			...(input.currentKPIValue === undefined ?  {} : { current_kpi_value: input.currentKPIValue } ),
			requested_for: input.requestedFor,
			start_date: input.startDate,
			state: input.state
		};
		return {
			redirect: true,
			route: 'record',
			fields: {
				table: 'sn_cim_register',
				sysId: '-1',
			},
			params: {
				query: Object.entries(params).map(item => `${item[0]}=${item[1]}`).join('^'),
				selectedTabIndex: '0',
			},
		};
	};

	const getNewCOEFormPayload = (input) => {
		const params = {
			source_table: input.sourceTable,
			source_record: input.sourceRecord,
			intake_source: input.intakeSource,
			process_name: input.processName,
			description: input.description,
			requested_for: input.requestedFor,
			state: input.state,
			...(input.numberOfSteps === undefined ?  {} : { number_of_steps: input.numberOfSteps } ),
			actual_time: input.actualTime,
			volume_of_transactions: input.volumeOfTransactions,
		};

		return {
			redirect: true,
			route: 'record',
			fields: {
				table: 'sn_ac_automation_request',
				sysId: '-1',
			},
			params: {
				query: Object.entries(params).map(item => `${item[0]}=${item[1]}`).join('^'),
				selectedTabIndex: '0',
			},
		};
	};

	const getEntityName = (entity) => {
		return entity.name;
	};

	const getTransitionActivityLabel = (item, nodes, entities) => {
		const from = nodes[item.from] || {};
		const to = nodes[item.to] || {};
		const showEntityName = Object.values(entities).length > 1;

		if (from.entityId === to.entityId)
			return from.fieldLabel + ' - ' + to.fieldLabel + (showEntityName ? ' (' + getEntityName(entities[to.entityId]) + ')' : '');

		return from.fieldLabel + ' (' + getEntityName(entities[from.entityId]) + ') - ' + to.fieldLabel + ' (' + getEntityName(entities[to.entityId]) + ')';
	};

	const makeTransitions = ({
		edges,
		nodes,
		entities,
		type,
		metric,
		search,
		includeStartStop,
	}) => {
		const allEdges = edges.reduce((acc, item) => {
			const nodeFrom = nodes[item.from] || {};
			const nodeTo = nodes[item.to] || {};
			const label = nodeFrom.label + ' - ' + nodeTo.label;

			// Transitions are filtered according to the following rules:
			// 1. Their `label` must match (at least partially) the `search` term
			// 2. The `type` from state is equal to `ALL_TYPES_ID` or to the transition's `from.activityId` and `to.activityId`
			// 3. They are not "start/stop" transitions depending if the `includeStartStop` flag is false
			if (
				label.toLowerCase().includes(search.toLowerCase()) &&
							(type === 'ALL' || (type === nodeFrom.activityId && type === nodeTo.activityId)) &&
							(includeStartStop || (!nodeFrom.isStart && !nodeFrom.isEnd && !nodeTo.isStart && !nodeTo.isEnd))
			) {
				const activityLabel = getTransitionActivityLabel(item, nodes, entities);
				acc.push({
					...item,
					label,
					activityLabel,
				});
			}

			return acc;
		}, []);

		return allEdges.sort((a, b) => {
			return b[metric] - a[metric];
		});
	};

	const getTransitions = ({
		transitions,
		nodes,
		projectEntities,

		// Pagination
		itemsPerPage,
		totalPages,
		currentPage,
		caseCount,
		versionId,
	}) => {
		// Get the items
		const currentTransitions = transitions.slice(itemsPerPage * currentPage, itemsPerPage * (currentPage + 1));
		return {
			page_cursor: `page-${currentPage}`,
			page_size: itemsPerPage,
			page_number: currentPage,
			is_last_page: (currentPage === totalPages - 1),
			items: currentTransitions.map(item => ({
				template: 'sn-promin-transition-item',
				propValues: {
					item,
					nodes,
					projectEntities,
					caseCount,
					versionId,
				},
			})),
		};
	};

	const getRootModel = ({
		projectEntities,
		aggregates,
	}) => {
		const rootEntity = (projectEntities || []).find(entity => entity.parentId === null); // To get root entity
		const rootAggregate = (aggregates || []).find(aggregate => aggregate.entityId === rootEntity.entityId);

		return {
			rootEntity,
			rootAggregate,
		};
	};


	function getWindowObject() {
		const fnConstr = (function () {}).constructor;
		return fnConstr('return this')();
	}

	return ({
		formatNumber: formatNumber,
		formatDuration: formatDuration,
		getNewCIMFormPayload: getNewCIMFormPayload,
		getNewCOEFormPayload: getNewCOEFormPayload,
		makeTransitions: makeTransitions,
		getTransitions: getTransitions,
		getRootModel: getRootModel,
		getEntityName: getEntityName,
		getTransitionActivityLabel: getTransitionActivityLabel,
		getWindowObject: getWindowObject,
	});
}
