function include({ imports }) {
    // clones a json object or array by walking the tree and recursively building a new object
    const _cloneDeep = (entity, cache = new WeakMap) => {
        //this clones array items too
        const referenceTypes = ['Array', 'Object', 'Map', 'Set', 'Date'];
        const entityType = Object.prototype.toString.call(entity);
        if (
            !new RegExp(referenceTypes.join('|')).test(entityType) ||
            entity instanceof WeakMap ||
            entity instanceof WeakSet
        ) return entity;
        if (cache.has(entity)) {
            return cache.get(entity);
        }
        const c = new entity.constructor;

        if (entity instanceof Map) {
            entity.forEach((value, key) => c.set(_cloneDeep(key), _cloneDeep(value)));
        }
        if (entity instanceof Set) {
            entity.forEach((value) => c.add(_cloneDeep(value)));
        }
        if (entity instanceof Date) {
            return new Date(entity);
        }
        cache.set(entity, c);
        return Object.assign(c, ...Object.keys(entity).map((prop) => ({
            [prop]: _cloneDeep(entity[prop], cache)
        })));
    };

    return {
        cloneDeep: _cloneDeep
    }
}
