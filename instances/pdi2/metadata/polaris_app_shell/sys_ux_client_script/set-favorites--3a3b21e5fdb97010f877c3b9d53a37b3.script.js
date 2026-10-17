/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let index = 0;
    const normalizedFavorites =  [];

    const flattenMenuItems = (head, returnArray = [], prefix = '') => {
	    if (head) {
		    returnArray.push({...head, label: prefix + head.label});
		    head['subItems'] && head['subItems'].forEach((item) => flattenMenuItems(item, returnArray, `${prefix}${head.label} > `));
	    }
	    return returnArray.map((item) => ({...item, label: item.label.replace("Favorites > ", "")}));
    };

    const menus = api.data.landing_page_favorites_getter_1.output.result;
    if  (menus && menus.length)  { 
        const favorites = menus.find(({ id }) =>  id === '1b682fe1c3133010cbd77096e940dd18');
        if (favorites && favorites.subItems && favorites.subItems.length) { 
            const filteredFavorites  = flattenMenuItems(favorites).filter(({ subItems, route }) => route && (!subItems || !subItems.length));
            if (filteredFavorites && filteredFavorites.length) { 
                while (index < 6 && index < filteredFavorites.length) { 
                    normalizedFavorites.push({
                        label: filteredFavorites[index].label, 
                        type: filteredFavorites[index].route.url ? 'external' : 'route',
                        value: {...filteredFavorites[index].route, href: `/${filteredFavorites[index].route.url}`},
                        opensWindow: false,
                        startsWith: { 
                            icon: api.state.iconMap[filteredFavorites[index].icon]
                        }
                    });
                    index++;
                }
                api.setState('favoriteList', normalizedFavorites);
            }
        }
    }
    if (normalizedFavorites.length === 0) { 
        api.setState('favoriteListEmpty', true); 
    }
}
