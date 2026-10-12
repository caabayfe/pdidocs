/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let index = 0;
    const normalizedHistory =  [];
    const dedup = new Set();

    const createPrettyTime = (timestamp) => {
        const elapsedTime = Date.now() - timestamp;
        const timeMarker = Math.max(
            1,
            Math.floor(elapsedTime / (60000))
        );
        if(timeMarker < 60)
            return `${timeMarker} min ago`;
        else if(timeMarker >= 60 && timeMarker < 1440)
            return `${Math.floor(timeMarker / 60)} hr ago`;
        else {
            const days = Math.floor(timeMarker / 1440);
            return `${days > 1 ? `${days} days ago` : "yesterday"}`;
        }
    };

    const menus = api.data.landing_page_menu_getter.output.result;
    if  (menus && menus.length)  { 
        const history = menus.find(({ id }) =>  id === 'history');
        if (history && history.subItems && history.subItems.length) { 
            const filteredHistory = history.subItems;
            while (normalizedHistory.length < 6 && index < filteredHistory.length) {                     
                const label = filteredHistory[index].label;
                const description = filteredHistory[index].description ? `- ${filteredHistory[index].description}` : "";     
                if(!dedup.has(`${label} ${description}`)) {
                    normalizedHistory.push({
                        label: `${label} ${description} (${createPrettyTime(filteredHistory[index].createdTimestamp)})`, 
                        type: filteredHistory[index].route.url ? 'external' : 'route',
                        value: {...filteredHistory[index].route, href: `/${filteredHistory[index].route.url}`},
                        opensWindow: false,
                    });
                    dedup.add(`${label} ${description}`);
                }
                index++;
            }
            api.setState('historyList', normalizedHistory);
        }
    }
}
