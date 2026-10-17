class SysAppInfoService {
    static SYS_APP_INFO_TABLE = 'sys_app_info';
    static createSysAppInfo(scopeId) {
        try {
            // if record exists, merge the BA flag into existing properties
            const gr = new GlideRecordSecure(SysAppInfoService.SYS_APP_INFO_TABLE);
            if (gr.get('sys_scope', scopeId)) {
                const props = SysAppInfoService._getSysAppInfoProperties(gr);
                if (!props.success) {
                    return { success: false, error: props.error };
                }
                gr.setValue('properties', JSON.stringify({
                    ...props.data,
                    generated_using_ba: true
                }));
                gr.update();
                return {
                    success: true,
                    sysId: gr.getValue('sys_id')
                };
            }

            const sysAppInfo = new GlideRecordSecure(SysAppInfoService.SYS_APP_INFO_TABLE);
            sysAppInfo.newRecord();
            sysAppInfo.setValue(
                'properties',
                JSON.stringify({
                    generated_using_ba: true
                })
            );
            const sysId = sysAppInfo.insert();
            if (gs.nil(sysId)) {
                return {
                    success: false,
                    error: gs.getMessage('Error in saving sys_app_info record: {0}', [sysAppInfo.getLastErrorMessage()])
                };
            }
            return {
                success: true,
                sysId: sysId
            };
        } catch (error) {
            const errorDetails = error?.message || error?.getMessage();
            gs.error(errorDetails);
            return {
                success: false,
                error: errorDetails
            };
        }
    }

    static createSysAppInfoDeprecated() {
        try {
            const sysAppInfo = new GlideRecordSecure(SysAppInfoService.SYS_APP_INFO_TABLE);
            sysAppInfo.newRecord();
            sysAppInfo.setValue(
                'properties',
                JSON.stringify({
                    generated_using_ai: true
                })
            );
            const sysId = sysAppInfo.insert();
            if (gs.nil(sysId)) {
                return {
                    success: false,
                    error: gs.getMessage('Error in saving sys_app_info record: {0}', [sysAppInfo.getLastErrorMessage()])
                };
            }
            return {
                success: true,
                sysId: sysId
            };
        } catch (error) {
            const errorDetails = error?.message || error?.getMessage();
            gs.error(errorDetails);
            return {
                success: false,
                error: errorDetails
            };
        }
    }

    static _getSysAppInfoProperties(gr) {
        const propertiesStr = gr.getValue('properties');
        if (!propertiesStr) {
            return {
                success: false,
                error: gs.getMessage('sys_app_info missing properties field')
            };
        }
        let sysAppInfoProperties;
        try {
            sysAppInfoProperties = JSON.parse(propertiesStr);
        } catch (parseError) {
            return {
                success: false,
                error: gs.getMessage('Invalid JSON in sys_app_info properties field: {0}', [parseError.message])
            };
        }
        return {
            success: true,
            data: sysAppInfoProperties
        };
    }

    static _getGeneratedFlag(scopeId, propertyKey) {
        try {
            const gr = new GlideRecordSecure(SysAppInfoService.SYS_APP_INFO_TABLE);
            if (!gr.get('sys_scope', scopeId)) {
                return { success: true, value: false };
            }
            const props = SysAppInfoService._getSysAppInfoProperties(gr);
            if (!props.success) {
                return { success: true, value: false };
            }
            return { success: true, value: props.data?.[propertyKey] || false };
        } catch (error) {
            const errorDetails = error?.message || error?.getMessage();
            gs.error(errorDetails);
            return { success: false, error: errorDetails };
        }
    }

    static getIsGeneratedByAI(scopeId) {
        const result = SysAppInfoService._getGeneratedFlag(scopeId, 'generated_using_ai');
        if (!result.success) {
            return result;
        }
        return { success: true, generatedWithAI: result.value };
    }

    static getIsGeneratedByBA(scopeId) {
        const result = SysAppInfoService._getGeneratedFlag(scopeId, 'generated_using_ba');
        if (!result.success) {
            return result;
        }
        return { success: true, generatedWithBA: result.value };
    }
}
