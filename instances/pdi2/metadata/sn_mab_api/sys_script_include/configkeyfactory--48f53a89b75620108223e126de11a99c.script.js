class ConfigKeyFactory {
  constructor() {
    this.type = 'ConfigKeyFactory';
  }

  /**
   * @param {String} tableName
   * @return {ConfigKeyGenerator}
   */
  getGenerator(tableName) {
    if (tableName === 'sys_sg_button') {
      return new ConfigKeyButtonGenerator();
    } else if (tableName === 'sys_sg_native_client') {
      return new ConfigKeyNativeClientGenerator();
    } else {
      return new ConfigKeyGenerator(tableName);
    }
  }
}

class ConfigKeyGenerator {
  constructor(tableName) {
    this.tableName = tableName;
    this.configKeyCache = new sn_mab_api.ConfigKeyCache();
    this.typeMap = new sn_mab_api.A_ConfigTypeMap().typeMap;
  }

  /**
   * @param {GlideRecord} gr
   * @param {Object} node
   * @return {TreeConfigurationNode}
   */
  getTreeConfiguration(gr, node) {
    const classNameOverride = this.getOverrideField(node, 'sys_class_name');
    const configKey = classNameOverride
      ? classNameOverride
      : gr.getValue('sys_class_name');
    return this.configKeyCache.getTreeConfigByConfigKeys([configKey]);
  }

  /**
   * @param {String} sysId
   * @return {TreeConfigurationNode}
   */
  getTreeConfigurationViaSysId(sysId) {
    const gr = new GlideRecord(this.tableName);
    if (!gr.get(sysId)) return undefined;

    const configKey = gr.getValue('sys_class_name') || this.tableName;
    return this.configKeyCache.getTreeConfigByConfigKeys([configKey]);
  }

  /**
   * @param {GlideRecord} gr
   * @return {String}
   */
  getType(gr) {
    const className = gr.getValue('sys_class_name');

    return this.typeMap[className]
      ? this.typeMap[className]
      : gr.getClassDisplayValue();
  }

  getTypeForRecord(record, table) {
    const className = record.sys_class_name
      ? record.sys_class_name.value
      : table;

    if (this.typeMap[className]) return this.typeMap[className];

    return ClassLabelGetterFactory.getInstance().getLabel(record, table);
  }

  getOverrideField(node, field) {
    if (node && node[field]) return node[field];

    return undefined;
  }
}

class ConfigKeyButtonGenerator extends ConfigKeyGenerator {
  constructor() {
    super();
    this.tableName = 'sys_sg_button';
  }

  /**
   * @param {String} sysId
   * @return {TreeConfigurationNode}
   */
  getTreeConfigurationViaSysId(sysId) {
    const gr = new GlideRecord(this.tableName);
    if (!gr.get(sysId)) return;

    return this.getTreeConfiguration(gr, {});
  }

  /**
   * @param {GlideRecord} gr
   * @param {Object} node
   * @return {TreeConfigurationNode}
   */
  getTreeConfiguration(gr, node) {
    const typeOverride = this.getOverrideField(node, 'type');
    const type = typeOverride ? typeOverride : gr.getValue('type');
    const possibleConfigKeys =
      type === 'spannable_rating' || type === 'select_one_rating'
        ? [`${this.tableName}_${type}`]
        : [this.tableName];
    return this.configKeyCache.getTreeConfigByConfigKeys(possibleConfigKeys);
  }

  /**
   * @param {GlideRecord} gr
   * @return {String}
   */
  getType(gr) {
    const type = gr.getValue('type');

    if (type === 'write_back') {
      return 'Action';
    } else if (type === 'redirection') {
      return 'Navigation';
    } else {
      return 'Smart button';
    }
  }

  getTypeForRecord(record) {
    return record.type.displayValue;
  }
}

class ConfigKeyNativeClientGenerator extends ConfigKeyGenerator {
  constructor() {
    super();
    this.tableName = 'sys_sg_native_client';
  }

  /**
   * @param {GlideRecord} gr
   * @return {String}
   */
  getType(gr) {
    const type = gr.getValue('type');

    // Capitalize First Letter
    if (type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }

    return 'Unknown Native Client';
  }

  getTypeForRecord(record) {
    const type = record.type ? record.type.value : '';

    // Capitalize First Letter
    if (type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }

    return 'Unknown Native Client';
  }
}

class ClassLabelGetterFactory {
  constructor() {
    if (!ClassLabelGetterFactory.instance) {
      this.displayValueCache = {};
      ClassLabelGetterFactory.instance = this;
    }
    return ClassLabelGetterFactory.instance;
  }

  /**
   * @param {Object} record
   * @param {String} table
   * @return {String}
   */
  getLabel(record, table) {
    const sysId = record.sys_id.value;
    const className = record.sys_class_name
      ? record.sys_class_name.value
      : table;

    if (this.displayValueCache[className])
      return this.displayValueCache[className];

    const gr = new GlideRecord(table);
    if (!gr.isValid())
      throw new ErrorHandler().getNotFoundError(
        'Does not exist for table: ' + table
      );

    gr.addQuery('sys_id', sysId);
    gr.query();
    this.displayValueCache[className] = gr.getClassDisplayValue();
    return this.displayValueCache[className];
  }

  static getInstance() {
    if (!ClassLabelGetterFactory.instance) {
      ClassLabelGetterFactory.instance = new ClassLabelGetterFactory();
    }
    return ClassLabelGetterFactory.instance;
  }

  static getLabel(record, table) {
    return ClassLabelGetterFactory.getInstance().getLabel(record, table);
  }
}

module.exports = ConfigKeyFactory;
