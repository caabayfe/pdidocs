/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const selectedPageIndex = event.payload.value;
    const MAX_VISIBLE_PAGES = 4; //standard max visible page is 5, 
    //but in this case, if we set it to 5, the current selected is right in the middle and it shows 2 extra pages, and we can only let users go to current+1 and not current+2

    const {
        currentPageNumber,
        currentStartIndex,
        nextStartIndex,
        startIndexHistory,
        visiblePages
    } = api.state;

    api.setState('currentPageNumber', selectedPageIndex);
    let startIdxHistoryLength = startIndexHistory.length; 

    if (selectedPageIndex > currentPageNumber) { //Next page
        let newNextStartIndex = {"lastRowIdentifier": "", "lastRowSysId" : ""};
        //check to see if selectedPageIndex is already loaded in the startIndexHistory
        if (startIdxHistoryLength == 0 || selectedPageIndex >= startIdxHistoryLength) {
            //either we're starting from page 0 or we loaded 3 pages already and we clicked on page 4
            if(!startIndexHistory.some(element => element.lastRowSysId === currentStartIndex.lastRowSysId)) {
                //in addition to saving the currentStartIndex as part of the startIndexHistory, also store the nextStartIndex for this
                //so that when users hop back 
                startIndexHistory.push({
                    ...currentStartIndex,
                    ["nextStartIndex"] : nextStartIndex
                });
            }
            setCurrentStartIndex(nextStartIndex);
        } else {
            //calculate the new start index with what's loaded so far and what's currently selected
            let newCurrentStartIndex = startIndexHistory[selectedPageIndex];
            setCurrentStartIndex(newCurrentStartIndex);
            newNextStartIndex = newCurrentStartIndex["nextStartIndex"];
        }
        if(visiblePages < MAX_VISIBLE_PAGES) {
            let updatedVisiblePages = visiblePages + 1;
            api.setState("visiblePages", updatedVisiblePages);
        }
        api.setState('nextStartIndex', newNextStartIndex);

    } else { //prev page clicked
        let newPrevIncrement = currentPageNumber - selectedPageIndex;
        const prevStartIndex = startIndexHistory[startIdxHistoryLength - newPrevIncrement];
        setCurrentStartIndex(prevStartIndex);
        api.setState('nextStartIndex', currentStartIndex);
    }

    function setCurrentStartIndex(currentStartIndex) {
		api.setState('currentStartIndex', ({currentValue}) => {
        	return {
            	...currentValue,
            	["lastRowIdentifier"]: currentStartIndex["lastRowIdentifier"],
                ["lastRowSysId"]: currentStartIndex["lastRowSysId"]
        	};
    	});
	}
}
