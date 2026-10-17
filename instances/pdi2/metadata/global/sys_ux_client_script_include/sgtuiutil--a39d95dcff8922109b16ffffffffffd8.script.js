function include({imports}, api) {

    function showLoader(message) {
        setObjectState('loader', {
            show: true,
            message: message || 'Loading...'
        });
    }

    function hideLoader() {
        setObjectState('loader', 'show', false);
    }

    function showSuccessNotification(message) {
        _showNotification(message, 'positive', 'circle-check-outline');
    }

    function showErrorNotification(message) {
        _showNotification(message, 'critical', 'info-circle-outline');
    }

    function showWarningNotification(message) {
        _showNotification(message, 'warning', 'info-circle-outline');
    }

    function clearNotifications() {
        api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS');
    }

    function _showNotification(content, status, icon) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'notification',
                status: status,
                icon: icon,
                content: content,
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }

    function translate(messages) {
        const _translate = resolve => {
            let msgs = messages.map(m => m[1]);
            Promise.all(msgs).then(values => {
                var result = {};
                messages.forEach((m, i) => result[m[0]] = values[i]);
                resolve(result);
            });
        };
        return new Promise(_translate);
    }

    function setObjectState(name, attr, value) {
        var props = typeof (attr) == 'object' ? attr : {[attr]: value};
        api.setState(name, ctx => ({
            ...ctx.currentValue,
            ...props
        }));
    }

    function formatNumber(number, maximumFractionDigits) {
        maximumFractionDigits = maximumFractionDigits || 0;
        const fmt = Intl.NumberFormat('en-US', {
            maximumFractionDigits: maximumFractionDigits
        });
        return fmt.format(number);
    }

    class SGTDataBroker {
        constructor(api) {
            this.api = api;
            this.requests = [];
        }

        addRequest(action, params) {
            this.requests.push({action, params});
            return this;
        }

        getCSWMembersCount(scanId) {
            this.addRequest('getCSWMembersCount', {scanId: scanId});
            this.execute();
        }

        execute() {
            this.api.data.sgt_data_broker.execute({
                requests: this.requests
            });
        }
    }

    return {
        translate,
        setObjectState,
        showLoader,
        hideLoader,
        showSuccessNotification,
        showErrorNotification,
        showWarningNotification,
        clearNotifications,
        formatNumber,
        newDataBroker: () => new SGTDataBroker(api)
    }
}
