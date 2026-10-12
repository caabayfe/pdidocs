class ConfigKeyCache {
  constructor() {
    this.cache = {};
    this.configKeyDAO = new sn_mab_api.ConfigKeyDAO();
  }

  getTreeConfigByConfigKeys(configKeys) {
    const cacheKey = this.createCacheKey(configKeys);
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] =
        this.configKeyDAO.getTreeConfigByConfigKeys(configKeys);
    }

    return this.cache[cacheKey];
  }

  createCacheKey(configKeys) {
    return JSON.stringify(configKeys);
  }
}

module.exports = ConfigKeyCache;
