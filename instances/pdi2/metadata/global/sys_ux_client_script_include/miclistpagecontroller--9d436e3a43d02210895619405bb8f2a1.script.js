function include({imports}, api, helpers, conf) {

    const micClient = imports["global.MICClient"](api, helpers);

    const EVENT_HANDLERS = {
        'MACROPONENT_READY': pageReadyHandler,
        'mi_data_broker': miDataBrokerHandler,
        'NOW_LIST#CELL_LINK_CLICKED': onCellLinkClickedHandler
    };

    function execHandler(name, ...args) {
        let handler = EVENT_HANDLERS[name];
        if (handler) {
            return handler.apply(this, args);
        }
        console.warn('No handler to execute')
        return null;
    }

    function addHandler(eventName, handler) {
        EVENT_HANDLERS[eventName] = handler;
    }

    function pageReadyHandler() {
        if (!checkFeatureState()) return;
        micClient.newMIDataBroker().exec('getScoreDetailForCategory', {
            category: conf.category
        });
        execHandler('PAGE_READY');
    }

    function checkFeatureState() {
        if (!micClient.isApplicationEnabled() || conf.disabled) {
            micClient.redirectToHomePage();
            return false;
        }
        return true;
    }

    function updateHeader(data) {
        Promise.all([data.title, data.subTitle]).then(values => {
            api.setState('recordListProps', {
                title: values[0],
                subTitle: values[1]
            });
        });
    }

    function miDataBrokerHandler(event) {
        var scoreDetail = event.payload.data.output.response;
        var stateVar = "scoreInformation";
        Promise.all([
            helpers.translate("Score impact"),
            helpers.translate("Score"),
            helpers.translate("Last updated")
        ]).then(values => {
            var lastUpdated = !scoreDetail.lastUpdated ? '-' : scoreDetail.lastUpdated;
            const detail = [
                scoreDetail.scoreImpact + '%',
                scoreDetail.score + '%',
                lastUpdated
            ];
            var res = values.map((label, index) => ({
                label: label,
                value: {
                    type: "string",
                    value: detail[index]
                }
            }));
            api.setState(stateVar, res);
        });
    }

    function onCellLinkClickedHandler(event) {
        navigateToDetailPage(event.payload.cell.metadata.referenceSysId);
    }

    function navigateToDetailPage(id) {
        helpers.navigate.to(conf.route, {
            viewType: "detail"
        }, {
            machineIdentity: id
        });
    }

    function handle(event) {
        const fn = EVENT_HANDLERS[event.elementId] || EVENT_HANDLERS[event.name];
        if (fn)
            fn(event);
    }

    return {
        handle: handle,
        addHandler: addHandler,
        navigateToDetailPage: navigateToDetailPage,
        updateHeader: updateHeader
    }
}
