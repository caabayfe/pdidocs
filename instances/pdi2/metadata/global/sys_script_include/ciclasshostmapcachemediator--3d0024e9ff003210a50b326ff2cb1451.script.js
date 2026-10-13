var CiClassHostMapCacheMediator = Class.create();
CiClassHostMapCacheMediator.prototype = {
    initialize: function() {
        this._cache = new SNC.CiClassHostMapCacheAPI();

    },

	/**
     * Returns true if the supplied CMDB CI class typically runs on a host.
     *
     * @param  {String} ciClassName – a CMDB CI class name
     * @return {Boolean}
     */
    runs_on_host: function (ciClassName) {
        if (!ciClassName)
            return false;

        return this._cache.runsOnHost(ciClassName);
    },

    type: 'CiClassHostMapCacheMediator'
};
