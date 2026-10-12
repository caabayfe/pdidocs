function include({
    imports
}, api = {}) {
    return {
        redirectUrl: (targetUrl) => {
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: targetUrl,
                   "target": "_self"
                 }
            });
        }
    }
}
