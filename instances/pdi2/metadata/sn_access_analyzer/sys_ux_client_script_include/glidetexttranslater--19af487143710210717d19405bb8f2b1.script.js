function include({ imports }, api) {

    function translate(msg, key = "translatedMessage") {
        var promises = [];
        var keys = [];
        for (let id in msg) {
            keys.push(id);
            promises.push(msg[id]);
        }

        return new Promise(resolve => {
            Promise.all(promises).then(values => {
                let prop = api.state[key] || {};
                keys.forEach((k, i) => prop[k] = values[i]);
                if (key) {
                    api.setState(key, ctx => ({
                        ...ctx.currentValue,
                        ...prop
                    }));
                }
                resolve(prop, values);
            });
        });

    }

    return {
        translate,
        translatedMessage: api.state.translatedMessage || {}
    }

}
