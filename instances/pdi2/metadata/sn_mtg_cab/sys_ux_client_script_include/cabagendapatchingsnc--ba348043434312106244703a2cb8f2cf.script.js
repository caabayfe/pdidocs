function include({
    imports
}) {
    class CABAgendaPatchingSNC {
        constructor(pageSize) {
            this._pageSize = pageSize;
        }

        getFilter(filters, selectedTab, selectedFilter) {
            let filter;
            switch (selectedTab) {
                case 'id=up_next':
                    filter = filters?.upNext;
                    break;
                case 'id=deferred':
                    filter = filters.deferred;
                    break;
                case 'id=all':
                    if (selectedFilter === 'myAgendaItems') filter = filters.myItems;
                    else if (selectedFilter === 'completed') filter = filters.completed;
                    else filter = filters.all;
                    break;
                default:
                    filter = null;
            }

            return filter;
        }

        getAgendaIdsToFetch(agenda, nri, filter, pageNum) {
            if (!nri || nri.length === 0) return null;

            const requiredItemsNum = this._pageSize * pageNum;

            const mergedAgenda = [...agenda, ...nri].sort((item1, item2) => {
                const order1 = item1.order.value || item1.order;
                const order2 = item2.order.value || item2.order;

                return order1 - order2;
            });

            const allFilteredItems = this.__filterItems(mergedAgenda, filter, requiredItemsNum);
            return allFilteredItems
                .map(item => item.sysId)
                .filter(sysId => sysId !== null && sysId !== undefined)
                .join(',');
        }

        patchStateWithAgenda(agendaState, fetchedAgenda, filter, pageNum) {
            if (fetchedAgenda.length === 0)
                return agendaState;

            let updatedAgendaState = JSON.parse(JSON.stringify(agendaState));
            updatedAgendaState.agenda = this.patchAgendaItems(updatedAgendaState.agenda, fetchedAgenda);
            updatedAgendaState.nriState = this.removeAgendaItemsFromNri(updatedAgendaState.nriState, fetchedAgenda);

            const {
                totalCount,
                currentPage
            } = this.getCurrentPageAndCount(
                updatedAgendaState.agenda,
                updatedAgendaState.nriState,
                filter,
                pageNum
            );

            updatedAgendaState.agenda = this.addFirstPendingAgenda(updatedAgendaState.agenda);
            updatedAgendaState.totalFilteredAgenda = totalCount;
            updatedAgendaState.currentPageData = currentPage;

            return updatedAgendaState;
        }

        patchAgendaItems(agenda, fetchedAgenda) {
            if (!fetchedAgenda || fetchedAgenda.length === 0)
                return false;
            const updatedAgenda = JSON.parse(JSON.stringify(agenda));
            fetchedAgenda.forEach(item => {
                const agendaItemIndex = agenda.findIndex(agendaItem =>
                    agendaItem.sys_id.value === item.sys_id.value
                );
                if (agendaItemIndex !== -1)
                    updatedAgenda[agendaItemIndex] = item; // Replace existing agenda item
                else
                    updatedAgenda.push(item); // Add new agenda item
            });

            const sortedAgenda = updatedAgenda.sort(this.__sort);
            return sortedAgenda;
        }

        removeAgendaItemsFromNri(nri, fetchedAgenda) {
            if (fetchedAgenda.length === 0) return nri;

            const fetchedIds = fetchedAgenda.map(({
                sys_id: {
                    value
                }
            }) => value);

            return nri.filter(({
                sysId
            }) => fetchedIds.indexOf(sysId) === -1);
        }

        getCurrentPageAndCount(agenda, nri, filter, pageNum) {
            const filteredAgenda = this.__filterItems(agenda, filter);
            const filteredNri = this.__filterItems(nri, filter);
            const totalCount = [...filteredAgenda, ...filteredNri].length;

            const currentPage = this.getItemsForPage(filteredAgenda, pageNum);

            return {
                totalCount,
                currentPage,
            };
        }

        getItemsForPage(agenda, pageNum, filter) {
            const page = pageNum || 1;
            let filteredAgendaItems = agenda;
            if (filter) filteredAgendaItems = this.__filterItems(agenda, filter);

            const startIndex = this._pageSize * (page - 1);
            const endIndex = startIndex + this._pageSize;

            return filteredAgendaItems.slice(startIndex, endIndex);
        }

        __filterItems(items, filter, num) {
            if (items.length === 0)
                return [];

            if (!filter || Object.keys(filter).length === 0)
                return items;

            const filterFields = Object.keys(filter);
            const filteredItems = items.filter((item) => {
                let decision = true;
                for (let index = 0; index < filterFields.length; index++) {
                    const fieldName = filterFields[index];

                    const field =
                        fieldName === 'assigned_to' ?
                        item?.assignment?.assigned_to || item.task.record[fieldName] :
                        item[fieldName];
                    if (!field) {
                        decision = false;
                        break;
                    }

                    const fieldValue = field.value || field;
                    if (fieldValue !== filter[fieldName]) {
                        decision = false;
                        break;
                    }
                }

                return decision;
            });
            return num ? filteredItems.slice(0, num) : filteredItems;
        }

        removeDeletedAgendaFromList(agendaList, agendaToRemoveSysId) {
            return agendaList.filter(function(item) {
                return item.sys_id.value !== agendaToRemoveSysId;
            });
        }

        updateTaskRecordWithWatcherData(agendaList, watcherData) {
            const watcherRecord = watcherData.record;
            const sysId = watcherData.sys_id;

            const updatedAgendaItem = agendaList.find(
                ({
                    task: {
                        value: taskSysId
                    }
                }) => taskSysId === sysId
            );

            if (updatedAgendaItem) {
                updatedAgendaItem.task.record = Object.assign({}, updatedAgendaItem.task.record, watcherRecord);
                if (watcherData.record.__highlightedValue) {
                    var taskTable = updatedAgendaItem.task.record.sys_class_name.value;
                    watcherData.changes.forEach(field => {
                        updatedAgendaItem.task.record[field].highlightedValueConfig = watcherData.record.__highlightedValue[taskTable][field];
                    });
                }
            }
        }

        updateAgendaWithWatcherRecord(agendaList, watcherData) {
            const watcherRecord = watcherData.record;
            const sysId = watcherData.sys_id;

            const updatedItemIndex = agendaList.findIndex(
                ({
                    sys_id: {
                        value: agendaItemSysId
                    }
                }) => agendaItemSysId === sysId
            );

            if (updatedItemIndex === -1)
                return agendaList;

            let updatedAgendaList = JSON.parse(JSON.stringify(agendaList));

            let mergedAgendaData = Object.assign({}, updatedAgendaList[updatedItemIndex], watcherRecord);

            const isUpdateRelevantToTimers = watcherData.changes.filter(
                field => ['state', 'alotted_time', 'elapsed_time'].includes(field)
            ).length > 0;
            if (isUpdateRelevantToTimers)
                mergedAgendaData = this.hydrateAgendaTimer(
                    mergedAgendaData,
                    mergedAgendaData.sys_updated_on.value,
                    0
                );

            updatedAgendaList[updatedItemIndex] = mergedAgendaData;

            updatedAgendaList.sort(this.__sort);

            updatedAgendaList = this.addFirstPendingAgenda(updatedAgendaList);

            return updatedAgendaList;
        }

        __isCurrentAgendaItem(agendaItem) {
            const currentAgendaStates = ['in_progress', 'paused'];

            return currentAgendaStates.includes(agendaItem?.state?.value);
        }

        getCurrentAgendaItem(agendaItems, currentAgendaItem, watcherData) {
            const isCurrentItemUpdated = currentAgendaItem?.sys_id?.value === watcherData.sys_id;
            const isStateUpdated = watcherData.changes.includes('state');
            const nextCurrentAgendaItem = this.__getNextCurrentAgendaItem(agendaItems);

            if (isCurrentItemUpdated && isStateUpdated && !nextCurrentAgendaItem)
                return null;
            else
                return nextCurrentAgendaItem;
        }

        __getNextCurrentAgendaItem(agendaItems) {
            const currentAgendaItem = agendaItems.filter(
                ({
                    state: {
                        value
                    }
                }) => value === 'in_progress' || value === 'paused'
            );

            if (currentAgendaItem && currentAgendaItem.length > 0)
                return currentAgendaItem[0];

            return null;
        }



        addFirstPendingAgenda(agendaItems) {
            const agendaList = JSON.parse(JSON.stringify(agendaItems));

            const pendingAgendaItems = agendaList.filter(
                ({
                    state: {
                        value
                    }
                }) => value === 'pending');

            const firstPendingItemId = pendingAgendaItems?.length > 0 ?
                pendingAgendaItems[0].sys_id.value : '';

            agendaList.forEach(agendaItem => {
                const isFirstPendingAgenda = agendaItem.sys_id.value === firstPendingItemId;
                agendaItem.isFirstPendingAgenda = isFirstPendingAgenda;
            });

            return agendaList;
        }

        hydrateTimers(agendaItems) {
            let hydratedAgenda = JSON.parse(JSON.stringify(agendaItems));

            hydratedAgenda = hydratedAgenda.map(agendaItem =>
                this.hydrateAgendaTimer(agendaItem, agendaItem.sys_updated_on.value, 0)
            );

            return hydratedAgenda;
        }

        hydrateAgendaTimer(agendaItem, startTime, requestTime) {
            if (!agendaItem)
                    return {};
            const hydratedAgendaItem = JSON.parse(JSON.stringify(agendaItem));
            const {
                alotted_time: {
                    value: alottedTime
                },
                elapsed_time: {
                    value: elapsedTime,
                    value_ms: elapsedTimeMs
                },
                state: {
                    value: state
                }
            } = hydratedAgendaItem;


            const totalDuration = this.__durationToMs(alottedTime);
            const elapsed = elapsedTimeMs || this.__durationToMs(elapsedTime);
            const remaining = totalDuration - elapsed;
            let duration;

            if (state !== 'in_progress' && state !== 'paused')
                duration = remaining;
            else {
                const nowUTC = this.__getNowInUTC();
                const requestDuration = requestTime ? nowUTC - requestTime : 0;
                const start = this.__durationToMs(startTime);
                const end = start + remaining;

                duration = end - nowUTC - requestDuration;
            }

            hydratedAgendaItem.timer = {
                totalDuration,
                duration
            };

            return hydratedAgendaItem;
        }

        __getNowInUTC() {
            const now = new Date();
            const nowUTC = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds(),
                now.getUTCMilliseconds()
            );

            return Math.round(nowUTC / 1000) * 1000;
        }

        __durationToMs(duration) {
            if (!duration || typeof duration !== 'string') return 0;

            const [date, time] = duration.split(' ');
            const [year, month, day] = date.split('-');
            const [hours, minutes, seconds] = time.split(':');

            const dateObj = new Date(
                Date.UTC(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hours),
                    parseInt(minutes),
                    parseInt(seconds),
                    0
                )
            );
            return dateObj.getTime();
        }

        __sort({
            order: {
                value: order1
            }
        }, {
            order: {
                value: order2
            }
        }) {
            return order1 - order2;
        }
    }

    return CABAgendaPatchingSNC;
}
