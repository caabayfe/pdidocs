class MobileDAOCache {
  constructor() {
    this.cache = {};
  }

  getDAO(tableName) {
    if (!tableName) {
      throw 'Bad tablename specified';
    }
    if (!this.isTableAccessible(tableName)) {
      throw 'Table is not accessible';
    }

    var mobileDao = this.cache[tableName];
    if (!mobileDao) {
      mobileDao = new sn_mab_api.MobileAppBuilderDAO(tableName);
      this.cache[tableName] = mobileDao;
    }

    return mobileDao;
  }

  isTableAccessible(tableName) {
    return MobileAppBuilderDAO.isTableAccessible(tableName);
  }
}

module.exports = MobileDAOCache;
