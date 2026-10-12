/**
 * EFClientUtils - Shared utility functions for Error Framework client scripts
 * 
 * This is a GLOBAL client script include that can be imported by other client scripts.
 * 
 * Usage in other client scripts:
 * const utils = imports["global.EFClientUtils"]();
 * utils.escapeHtml(str);
 * utils.getStateColor('open');
 * 
 * Or destructure:
 * const { escapeHtml, STATE_COLOR_MAP, getStateColor } = imports["global.EFClientUtils"]();
 */
function include({imports}) {
    /**
     * Escape HTML special characters to prevent XSS vulnerabilities
     */
    const escapeHtml = (str) => {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    /**
     * State to color mapping for UI display
     */
    const STATE_COLOR_MAP = {
        open: 'critical',
        in_progress: 'warning',
        closed: 'positive',
        ignored: 'info',
        inactive: 'neutral'
    };

    /**
     * Severity to color mapping for UI display
     */
    const SEVERITY_COLOR_MAP = {
        critical: 'critical',
        high: 'warning',
        medium: 'moderate',
        low: 'positive',
        info: 'info'
    };

    /**
     * sys_id of the EF OOB source application, used to classify actions as EF vs app-specific
     */
    const ERROR_SOURCE_APP = '2eae2cab81336614f877085b2c4c55dd';

    /**
     * Get color for a given state value
     */
    const getStateColor = (state) => STATE_COLOR_MAP[state] || 'info';

    /**
     * Get color for a given severity value
     */
    const getSeverityColor = (severity) => SEVERITY_COLOR_MAP[severity?.toLowerCase()] || 'info';

    // Return all utilities as an object
    return {
        escapeHtml,
        STATE_COLOR_MAP,
        SEVERITY_COLOR_MAP,
        ERROR_SOURCE_APP,
        getStateColor,
        getSeverityColor
    };
}
