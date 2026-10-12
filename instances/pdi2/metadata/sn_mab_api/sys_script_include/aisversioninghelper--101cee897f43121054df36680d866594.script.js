class AisVersioningHelper {
    constructor() {
        this.AIS_RAG_VERSION_INTRODUCTION = '27.1.0.0';
        this.currentAisNodeVersion = new sn_ais.AisUtil().getRequiredAisNodeVersion();
        this.isAisRagEnabled = this._isAisRagEnabled();
    }

    _isAisRagEnabled() {
        return this._compareVersions(this.AIS_RAG_VERSION_INTRODUCTION, this.currentAisNodeVersion) <= 0;
    }

    _compareVersions(version1, version2) {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);
    
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            if (num1 < num2) return -1;
            if (num1 > num2) return 1;
        }
        return 0;
    }
}

module.exports = AisVersioningHelper;
