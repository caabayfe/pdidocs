var FeatureFlag = Class.create();
FeatureFlag.prototype = {
    initialize: function() {
        this.sysId = null;
        this.name = null;
        this.description = null;
        this.key = null;
        this.type = 'boolean'; // default
        this.overview = null;
        this.capabilities = null;
        this.appScope = null;
        this.appMinVersion = null;
    },

    initializeWithGr: function(gr) {
        this.setSysId(gr.getUniqueValue())
            .setName(gr.getValue("name"))
            .setDescription(gr.getValue("description"))
            .setKey(gr.getValue("key"))
            .setType(gr.getValue("type"))
            .setOverview(gr.getValue("overview"))
            .setCapabilities(gr.getValue("capabilities"))
            .setAppScope(gr.getValue("app_scope"))
            .setAppMinVersion(gr.getValue("app_min_version"));

        return this;
    },

    // --- Setters ---
    setSysId: function(sysId) {
        this.sysId = sysId;
        return this;
    },
    setName: function(name) {
        this.name = name;
        return this;
    },
    setDescription: function(description) {
        this.description = description;
        return this;
    },
    setKey: function(key) {
        this.key = key;
        return this;
    },
    setType: function(type) {
        this.type = type;
        return this;
    },
    setOverview: function(overview) {
        this.overview = overview;
        return this;
    },
    setCapabilities: function(capabilities) {
        this.capabilities = capabilities;
        return this;
    },
    setAppScope: function(appScope) {
        this.appScope = appScope;
        return this;
    },
    setAppMinVersion: function(appMinVersion) {
        this.appMinVersion = appMinVersion;
        return this;
    },

    // --- Getters ---
    getSysId: function() {
        return this.sysId;
    },
    getName: function() {
        return this.name;
    },
    getDescription: function() {
        return this.description;
    },
    getKey: function() {
        return this.key;
    },
    getType: function() {
        return this.type;
    },
    getOverview: function() {
        return this.overview;
    },
    getCapabilities: function() {
        return this.capabilities;
    },
    getAppScope: function() {
        return this.appScope;
    },
    getAppMinVersion: function() {
        return this.appMinVersion;
    },

    // --- JSON methods ---
    toJSON: function() {
        return {
            sysId: this.sysId,
            name: this.name,
            description: this.description,
            key: this.key,
            type: this.type,
            overview: this.overview,
            capabilities: this.capabilities,
            appScope: this.appScope,
            appMinVersion: this.appMinVersion
        };
    },

    type: 'FeatureFlag'
};

FeatureFlag.fromJSON = function(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('Invalid JSON input for FeatureFlag');
    }

    var featureFlag = new FeatureFlag();
    if (json.sysId !== undefined) featureFlag.setSysId(json.sysId);
    if (json.name !== undefined) featureFlag.setName(json.name);
    if (json.description !== undefined) featureFlag.setDescription(json.description);
    if (json.key !== undefined) featureFlag.setKey(json.key);
    if (json.type !== undefined) featureFlag.setType(json.type);
    if (json.overview !== undefined) featureFlag.setOverview(json.overview);
    if (json.capabilities !== undefined) featureFlag.setCapabilities(json.capabilities);
    if (json.appScope !== undefined) featureFlag.setAppScope(json.appScope);
    if (json.appMinVersion !== undefined) featureFlag.setAppMinVersion(json.appMinVersion);

    return featureFlag;
}
