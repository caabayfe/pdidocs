import { gs } from '@servicenow/glide';
import { SysProperties } from '../constants.js';
/**
 * Utility functions for visualization processing
 */
export class VisualizationUtils {
    /**
     * Checks if a string is a valid ServiceNow sys_id
     */
    static isServiceNowSysId(input) {
        const sysIdRegex = /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$|^[0-9a-fA-F]{32}$/;
        return sysIdRegex.test(input);
    }
    /**
     * Converts a period character to its display value
     */
    static getPeriod(periodChar) {
        if (!periodChar || periodChar === '') {
            return '';
        }
        switch (periodChar) {
            case 'D':
            case 'd':
                return 'Day';
            case 'M':
            case 'm':
                return 'Month';
            case 'Y':
            case 'y':
                return 'Year';
            default:
                return '';
        }
    }
    /**
     * Logs debug messages if logging is enabled
     */
    static debugLog(message) {
        if (gs.getProperty(SysProperties.LOGGING_ENABLED) === 'true') {
            gs.info(message);
        }
    }
    /**
     * Generates a cache key for field lookups
     */
    static getFieldCacheKey(table, field) {
        return `${table}:${field}`;
    }
    /**
     * Generates a cache key for table/record lookups
     */
    static getTableCacheKey(table, sysId) {
        return `${table}:${sysId}`;
    }
    /**
     * Extracts breakdown labels or sys_ids into a comma-separated string
     */
    static extractBreakdowns(breakdowns) {
        try {
            const result = [];
            if (Array.isArray(breakdowns)) {
                for (let i = 0; i < breakdowns.length; i++) {
                    const breakdown = breakdowns[i];
                    if (breakdown) {
                        if (breakdown.label) {
                            result.push(breakdown.label);
                        }
                        else if (breakdown.sysId) {
                            result.push(breakdown.sysId);
                        }
                    }
                }
            }
            return result.join(', ');
        }
        catch (e) {
            VisualizationUtils.debugLog(`[VisualizationUtils] Failed to extract breakdowns: ${e}`);
            return '';
        }
    }
    /**
     * Formats an array into a natural language list
     * Examples: "a", "a and b", "a, b, and c"
     */
    static formatNaturalLanguageList(items) {
        if (items.length === 0) {
            return '';
        }
        if (items.length === 1) {
            return items[0] || '';
        }
        if (items.length === 2) {
            return `${items[0]} and ${items[1]}`;
        }
        return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
    }
}
