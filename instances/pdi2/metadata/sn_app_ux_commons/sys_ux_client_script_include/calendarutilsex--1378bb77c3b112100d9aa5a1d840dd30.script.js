/**
 *
 * @param {*} importsIncludes
 * @param {UXFCalendarUtilsEx.ClientParams} param1
 * @returns
 */
function include(importsIncludes, { api, event, helpers, imports }) {

	/**
 	 * @template T
 	 * @param {T} obj
 	 * @returns {Partial<{[key in keyof T]: key}>}
 	 */
	function getKeyNames(obj) {
		const keyNames = {};
		Object.keys(obj ?? {}).forEach(keyName => keyNames[keyName] = keyName);
		return keyNames;
	}
	const GLIDE_INTERNAL_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
	const GLIDE_INTERNAL_DATE_TIME_FORMAT_WITH_TZ = `${GLIDE_INTERNAL_DATE_TIME_FORMAT} Z`;
	const { NowDateTime } = imports['sn_uxf.core_libraries']();
	const stateNames = getKeyNames(api.state);
	//console.log(`${event.name} - ${JSON.stringify(event.payload, null, 4)}`);
	const hostSize = Object.freeze({
		sm: 'sm',
		md: 'md',
		lg: 'lg',
		xlg: 'xlg'
	});
	const viewIds = {
		timeline: {
			day: 'TIMELINE_DAY',
			week: 'TIMELINE_WEEK'
		},
		calendar: {
			day: 'DAY',
			week: 'week',
			workWeek: 'work_week',
			month: 'MONTH'
		}
	};
	const durations = Object.freeze({
		hour: 60 * 60 * 1000,
		day: 24 * 60 * 60 * 1000
	})
	/**
	 *
	 * @param {Partial<UXFCalendarUtilsEx.State>} props
	 */
	function updateState(props){
		Object.entries(props).forEach( ([key, value]) => {
			/// @ts-ignore
			api.setState(key, value);
		})
	}

	/**
	 *
	 * @param {number=} index
	 * @returns
	 */
	function getNewEventTitle(index) {
		const coloredEmojis = ["⌚","⌛","⏰","⏳","☔","☕","🥊",
			"😎","😇","🥵","😡","🤡","👽","👻","🤛","🫀","🙏","👨‍🎓","🐼","🥎","🤼‍♀️",
			"⚫","⚽","⚾","⛄","⛅","⛎","⛔","⛪","⛲","⛳","⛵","⛹","⛺","⛽","✅",
			"🥋","❌","❎","❓","⚽️","🤼","❗","⛹️‍♀️","⛳️","🪂","🛼","🧘‍♂️","⬛","🏏","⭐","⭕",
			"⏩","⏪","⏫","⏬"];
		const emojiIndex = (index ?? Date.now()) % (coloredEmojis.length - 1);
		return `${coloredEmojis[emojiIndex]} - Event`;
	}
	/**
	 *
	 * @param {{calEvent: Calendar.RawCalendarEvent, timestamp: number}} param0
	 */
	function getPopoverContentState({calEvent, timestamp}) {
		/**
		 * @type {Calendar.CalendarEventPopoverContentState}
		 */
		const popoverContentState = {
			id: calEvent.id,
			value: 'ready',
			timestamp,
			showInSidebar: [hostSize.sm, hostSize.md].includes(api.state.hostSize)
		}
		const popoverContentItems = [
			{
				label: 'Title',
				value: {
					type: 'string',
					value: calEvent.title
				}
			},
			{
				label: 'Start',
				value: {
					type: 'string',
					value: NowDateTime.utc(calEvent.startMS).tz(api.state.timezone).format(GLIDE_INTERNAL_DATE_TIME_FORMAT)
				}
			},
			{
				label: 'End',
				value: {
					type: 'string',
					value: NowDateTime.utc(calEvent.startMS).tz(api.state.timezone).format(GLIDE_INTERNAL_DATE_TIME_FORMAT)
				}
			}
		]
		return {popoverContentState, popoverItems: popoverContentItems}
	}


	function dragEndForNewEvent() {
		/**
		 * @type {{event: Calendar.RawCalendarEvent, newStartMS: number, newEndMS: number, group?: string}}
		 */
		const {newStartMS, newEndMS, group} = event.payload;
		const events = [...api.state.events];
		const id = `${Date.now()}`;
		const newEvent = {id, title: getNewEventTitle(), startMS: newStartMS, endMS: newEndMS, group};
		events.push(newEvent);
		updateState({events});
	}

	function eventDoubleClicked() {
		/**
		 * @type {{event: Calendar.RawCalendarEvent}}
		 */
		const {event: calEvent} = event.payload;
		const popupState = getPopoverContentState({calEvent, timestamp: Date.now()});
		const editingEvent = calEvent;
		updateState({editingEvent, ...popupState});
	}
	function multiEventSelected() {
		/**
		 * @type {{selectedEvents: Array<Calendar.RawCalendarEvent>,
		 *  actionKeyReleased: boolean, escapeKeyPressed: boolean, nonSelectionClickDetected: boolean}}
		 */
		const {selectedEvents, actionKeyReleased, escapeKeyPressed, nonSelectionClickDetected} = event.payload;
		api.setState(stateNames.selectedEvents, selectedEvents);
		const selectedCardsPanel = {
			"id": "multi-event-select-panel",
			"icon": "list-fill",
			"open": true,
			label: 'Selected cards'
		};
		if (api.state.contextualPanelItems.findIndex(item => item.id === selectedCardsPanel.id) === -1) {
			const newPanelItems = api.state.contextualPanelItems.map( item => ({...item, open: false}));
			newPanelItems.push(selectedCardsPanel);
			api.setState(stateNames.contextualPanelItems, newPanelItems);
			api.setState(stateNames.selecedContexualPanel, selectedCardsPanel.id);
			api.setState(stateNames.manageContextualPanel, true);
		}
	}
	function clearMultiEventSelection() {
		const newItems = [...api.state.contextualPanelItems];
		const targetIndex = newItems.findIndex(item => item.id === 'multi-event-select-panel');
		if (targetIndex < 0)
			return;
		newItems.splice(targetIndex, 1);
		updateState({selectedEvents: [], contextualPanelItems: newItems, selecedContexualPanel: '', manageContextualPanel: false});
	}
	function gridDoubleClicked() {
		/**
		 * @type {{row: Calendar.RawRowItem, startTimeMS: number, endTimeMS}}
		 */
		const {row, startTimeMS, endTimeMS} = event.payload;
		const startMS = startTimeMS;
		let endMS = endTimeMS;
		switch(api.state.currentView) {
			case viewIds.calendar.day:
			case viewIds.timeline.day:
				endMS = startMS + durations.hour;
				break;
			case viewIds.calendar.month:
			case viewIds.calendar.week:
			case viewIds.calendar.workWeek:
				endMS = startMS + durations.day;
				break;
		};
		const id = `${Date.now()}`
		const newEvent = {
			id,
			startMS,
			endMS,
			title: getNewEventTitle(),
			group: row?.id
		}
		const newEvents = [...api.state.events];
		newEvents.push(newEvent);
		api.setState(stateNames.events, newEvents);
		helpers.timing.setTimeout( () => {
			const partialState = getPopoverContentState({calEvent: newEvent, timestamp: Date.now()});
			updateState({editingEvent: newEvent, ...partialState});
		}, 1000);
	}
	function eventMoved() {
		/**
		 * @type {{event: Calendar.RawCalendarEvent, newStartMS: number, newEndMS: number, group?: string}}
		 */
		const {event: calEvent, newStartMS, newEndMS, group} = event.payload;
		const events = [...api.state.events];
		const index = events.findIndex(item => item.id === calEvent.id);
		if (index < 0) {
			return;
		}
		const newEvent = {...calEvent, startMS: newStartMS, endMS: newEndMS, group};
		events[index] = newEvent;
		updateState({events});
	}
	function eventResized() {
		/**
		 * @type {{event: Calendar.RawCalendarEvent, newStartMS: number, newEndMS: number, group?: string}}
		 */
		const {event: calEvent, newStartMS, newEndMS} = event.payload;
		const events = [...api.state.events];
		const index = events.findIndex(item => item.id === calEvent.id);
		if (index < 0) {
			return;
		}
		const newEvent = {...calEvent, startMS: newStartMS, endMS: newEndMS};
		events[index] = newEvent;
		updateState({events});
	}
	function gridClickForNewEvent() {
		/**
		 * @type {{event: Calendar.RawCalendarEvent, newStartMS: number, newEndMS: number, group?: string}}
		 */
		const {newStartMS, newEndMS, group} = event.payload;
		const events = [...api.state.events];
		const id = `${Date.now()}`;
		const newEvent = {id, title: getNewEventTitle(), startMS: newStartMS, endMS: newEndMS, group};
		events.push(newEvent);
		updateState({events});
	}
	/**
	 * @description - this will be handled automatically by calendar
	 */
	function sectionToggled() {

		/**
		 * @type {{section: Calendar.RawSectionItem}}
		 */
		const {section} = event.payload;
		// there is no need to do anything here.
		const newEvents = [...api.state.events]
		const newSections = [...api.state.sections];
		const index = newSections.findIndex(item => Array.isArray(item.children) && item.id === section.id);
		if (index < 0)
			return;
		section.isCollapsed = !section.isCollapsed;
		newSections[index] = {...section};
		// there is small timing issue if you set immediately. just give sometime
		helpers.timing.setTimeout( () => {
			api.setState(stateNames.sections, newSections);
		}, 100);

	}
	function popoverClosed() {
		updateState({editingEvent: null, popoverContentState: {value: 'destroyed'}});
	}

	function popoverOpened() {
		/**
		 * @type {{event: Calendar.RawCalendarEvent, timestamp: number}}
		 */
		const {event: calEvent, timestamp} = event.payload;
		if (calEvent.id === 'new-temporary-event')
			return;
		updateState(getPopoverContentState({calEvent, timestamp}));
	}
	function rangeUpdated() {
		const {startMS, endMS} = event.payload;
		api.setState(stateNames.rangeStartMS, startMS);
		api.setState(stateNames.rangeEndMS, endMS);
	}
	function rejectedByMarkspan() {

	}
	function contextualPanelViewSelected() {
		const {viewId} = event.payload;
		api.setState(stateNames.selecedContexualPanel, viewId);
	}
	/**
	 * @description this will be handled by calendar automatically
	 */
	function viewChanged() {
		/**
		 * @type {{from: string, to: string}}
		 *
		 */
		const {to} = event.payload;
		api.setState(stateNames.currentView, to);
	}
	function genericTemplateEvent() {
		/**
		 * @type {{cmd?: string, payload: any}}
		 */
		const {cmd, payload} = event.payload;
		if(typeof cmd !== 'string')
			return;
		api.emit(cmd, payload);
	}
	/**
	 * @description this will be handled by calendar automatically
	 */
	function timezoneChanged() {
		/**
		 * @type {{from: string, to: string}}
		 */
		const {to} = event.payload;
		api.setState(stateNames.timezone, to);
	}

	function eventContextualMenuItemClicked() {
		/**
		 * @type {{event: Calendar.RawCalendarEvent, item: {id: string, lable: string}}}
		 */
		const {event: calEvent, item} = event.payload;
		const existingEvent = api.state.events;
		const newEvents = [...existingEvent];
		const index = newEvents.findIndex(item => item.id === calEvent.id);
		if (index < 0)
			return;
		const targetEvent = {...calEvent, id: `${Date.now()}`};
		const HOUR = durations.hour;
		switch(item.id) {
			case 'event_move_left':
				targetEvent.startMS -=  HOUR;
				targetEvent.endMS -= HOUR;
				newEvents[index] = targetEvent;
				break;
			case 'event_resize':
				targetEvent.startMS -=  HOUR;
				targetEvent.endMS += HOUR;
				newEvents[index] = targetEvent;
				break;
			case 'event_move_right':
				targetEvent.startMS +=  HOUR;
				targetEvent.endMS += HOUR;
				newEvents[index] = targetEvent;
				break;
			case 'event_delete':
				newEvents.splice(index, 1);
				break;
		}
		api.setState(stateNames.events, newEvents);
	}
	function hostSizeChanged() {
		/**
		 * @type {{size: string}}
		 */
		const {size} = event.payload;
		api.setState(stateNames.hostSize, size);
	}

	/**
	 * @description this will be handled by calendar automatically
	 */
	function contextDateChanged() {
		/**
		 *
		 * @type {{toMS: number}}
		 */
		const {toMS} = event.payload;
		NowDateTime(toMS);
		const date = NowDateTime.utc(toMS).tz(api.state.timezone);
		const isoString = date.toISOString();
		api.setState(stateNames.contextDate, isoString);
	}
	/**
	 *
	 * @param {Array<Record<string, {value: string, displayValue: string}>>} ar
	 * @param {string} startKey
	 * @param {string} endKey
	 */
	function getEvents(ar, startKey, endKey) {
		const specialId = `${Date.now()}`
		return ar.map( (item, index) => {
			const start = item[startKey];
			const end = item[endKey];
			if(!start || !end)
				return item;
			const startTimeTokens = start.value.split(/-|\ |:/).map((token, index) => {
				const r = parseInt(token);
				if (index === 1)
					return r - 1;
				return r;
			});
			const endTimeTokens = end.value.split(/-|\ |:/).map((token, index) => {
				const r = parseInt(token);
				if (index === 1)
					return r - 1;
				return r;
			});
			const startMS = Date.UTC.call(null,...startTimeTokens);
			const endMS = Date.UTC.call(null, ...endTimeTokens);
			return {
				...item,
				id: item.id || item?.sys_id?.value || `${specialId}_${index}`,
				startMS,
				endMS
			}
		});
	}

	function eventClicked() {

	}
	function toolbarButtonClicked() {

	}
	function titleColumnResized() {

	}
	function additionalTimezoneSelected() {

	}
	function initialized() {

	}
	/**
	 *
	 * @param {number} noOfEventsPerSection
	 * @param {number} startMS
	 * @param {number} endMS
	 * @returns
	 */
	function generateEvents(noOfEventsPerSection, startMS, endMS) {

		const color = [
			'#94baf7',
			'#94baf7',
			'#ffbdc5',
			'#ecdf93',
			'#e6f7c7',
			'#ccc',
			'#0f734e',
			'#f72585',
			'#b5179e',
			'#7209b7',
			'#560bad',
			'#480ca8',
			'#3a0ca3',
			'#3f37c9',
			'#4361ee',
			'#4895ef',
			'#4cc9f0'
		];
		/**
		 * @type {Array<Calendar.RawCalendarEvent>}
		 */
		const events = [];
		const diff = endMS - startMS;
		let noOfHours = 0;
		const MS_PER_HOUR = 60 * 60 * 1000;
		if ((endMS - startMS) >= (MS_PER_HOUR - 1))
			noOfHours = Math.random() * 36; // if it is week, span between atleast 2 days

		// 1 hour to 5 hour interval
		const INTERVAL = Math.max(MS_PER_HOUR, Math.random() * 5 * MS_PER_HOUR) + noOfHours * MS_PER_HOUR;
		let specialId = Date.now();
		for (let i = 0; i < noOfEventsPerSection; i++) {
			let newStartMS = Math.floor(Math.random() * diff + startMS);
			let newEndMS = Math.random() * (endMS - newStartMS) + newStartMS;
			newEndMS = Math.ceil(Math.min(newStartMS + INTERVAL, newEndMS));
			if (newStartMS > newEndMS) {
				const temp = newEndMS;
				newEndMS = newStartMS;
				newStartMS = temp;
			}
			const rowId = '';
			const id = `${++specialId}`;
			const bgColor = color[parseInt(id) % color.length ];
			events.push({
				group: rowId,
				id,
				start: newStartMS,
				end: newEndMS,
				allowMove: true,
				allowResize: true,
				bgColor,
				textColor: bgColor === '#fff' ? 'black' : 'white',
				title: getNewEventTitle()
			});
		}
		return events;
	}

	function scrollEnd() {
		if (!api.state.enableScrollEnd)
			return;
		const id = `${Date.now()}`
		const sectionId = `section_${id}`;
		const rowId = `row_${id}`;
		const newSection = {
			children: [],
			id: sectionId,
			title: `New section ${id}`
		}
		const newRow = {
			id: rowId,
			parent: sectionId,
			order: 0,
			title: `New row - ${id}`,
		}
		const rowEvents = generateEvents(50, api.state.rangeStartMS, api.state.rangeEndMS);
		rowEvents.forEach((item, index) => {
			item.group = newRow.id
			item.title = getNewEventTitle(index)
		});
		const sections = [...api.state.sections, newSection, newRow];
		const events = [...api.state.events, ...rowEvents];
		updateState({sections, events});

	}

	return {
		updateEvents(args) {
			const events = getEvents(...args);
			updateState({events});
		},
		contextDateChanged,
		titleColumnResized,
		additionalTimezoneSelected,
		initialized,
		dragEndForNewEvent,
		eventClicked,
		eventDoubleClicked,
		multiEventSelected,
		gridDoubleClicked,
		eventMoved,
		eventResized,
		gridClickForNewEvent,
		sectionToggled,
		popoverClosed,
		popoverOpened,
		rangeUpdated,
		rejectedByMarkspan,
		contextualPanelViewSelected,
		viewChanged,
		genericTemplateEvent,
		timezoneChanged,
		scrollEnd,
		eventContextualMenuItemClicked,
		hostSizeChanged,
		toolbarButtonClicked,
		getEvents,
		clearMultiEventSelection,
		eventEditingCompleted() {
			/**
			 * @type {{fieldValue: string}}
			 */
			const {fieldValue} = event.payload;
			const newEvents = [...api.state.events];
			const targetIndex = newEvents.findIndex(item => item.id === api.state.editingEvent.id);
			if (targetIndex >= 0 && fieldValue?.length > 0)
				newEvents[targetIndex] = {...api.state.editingEvent, title: fieldValue};
			updateState({events: newEvents});
			popoverClosed();
		}
	}
}
