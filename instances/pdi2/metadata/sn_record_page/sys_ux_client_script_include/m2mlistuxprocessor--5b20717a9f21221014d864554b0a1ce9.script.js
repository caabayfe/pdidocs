function include({imports}, helpers) {
    const fetchGlidelistData = async function(helpers, params) {

        const data = helpers.snHttp(
            '/xmlhttp.do', {
                method: 'POST',
                batch: false,
                body: {},
                params: params,
                headers: {
                    'X-WantSessionNotificationMessages': 'true',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                }
            }
        ).then(async ({
            response
        }) => {
            const xml = Object.values(response).join('');

            const glideListData = _parseItem(xml);
            const transformData = _transformGlideListData(glideListData);
            return transformData;
        });
        return data;
    }
    const _parseItem = function(xml) {
        var nodes = [];
        const rxml = new DOMParser().parseFromString(xml, 'text/xml');
        var items = rxml.getElementsByTagName('item');
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let node = {
                id: item.getAttribute('name'),
                label: item.getAttribute('label'),

            };
            nodes.push(node);
        }
        return nodes;
    }
    const _transformGlideListData = function(glideListData) {
        return glideListData.reduce((result, item) => {
            const label = item.label;
            result[item.id] = {
                label: label,
                reference: null
            }
            return result;
        }, {});
    }
    return {
        fetchGlidelistData
    }
}
