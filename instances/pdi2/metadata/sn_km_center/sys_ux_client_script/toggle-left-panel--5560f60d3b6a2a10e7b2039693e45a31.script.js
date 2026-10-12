/**
 * Knowledge Center - Left Panel Toggle Handler
 * 
 * This script handles the toggling of the left navigation panel in the Knowledge Center UI.
 * It manages panel state based on different trigger events:
 * - Initial page load (respects user preferences)
 * - Button click to toggle panel state
 * - New vs existing record behavior
 *
 * @async
 * @param {Object} params - The parameters object
 * @param {Object} params.api - API for interacting with the UI state and data
 * @param {Object} params.api.state - Current UI state values
 * @param {Object} params.api.data - Data access layer
 * @param {Object} params.helpers - Helper utilities
 * @param {Function} params.helpers.translate - Translation function for i18n
 * @param {Object} params.event - The event that triggered this handler
 * @param {string} params.event.name - Name of the triggering event
 */
async function handler({
    api,
    helpers,
    event
}) {
    // Fetch translated labels for accessibility and tooltips
    const OPEN_LABEL = await helpers.translate("Collapse Knowledge Details");
    const CLOSE_LABEL = await helpers.translate("Expand Knowledge Details");

    // Icon definitions for panel toggle states
    const ICONS = {
        COLLAPSE: "chevron-left-outline", // Icon indicating panel can be collapsed
        EXPAND: "chevron-right-outline"   // Icon indicating panel can be expanded
    };

    // Panel configuration presets with all UI properties
    const PANEL_STATES = {
        OPEN: {
            leftPanel: {
                minRatio: 10,     // Percentage of screen width (minimum)
                minPixels: 320   // Absolute minimum width in pixels
            },
            rightPanel: {
                minRatio: 70,    // Percentage of screen width (minimum)
                minPixels: 400   // Absolute minimum width in pixels
            },
            dividerConfig: {
                position: "top", // Position of the divider button
                buttonProps: {
                    bare: false,
                    variant: "tertiary",
                    size: "sm",
                    icon: ICONS.COLLAPSE, 
                    configAria: {
                        "aria-label": OPEN_LABEL
                    },
                    tooltipContent: OPEN_LABEL,
                }
            }
        },
        CLOSED: {
            leftPanel: {
                minRatio: 1      // Minimal ratio for collapsed state
            },
            rightPanel: {
                minRatio: 99     // Almost full width when panel is closed
            },
            dividerConfig: {
                position: "top",
                buttonProps: {
                    bare: false,
                    variant: "tertiary",
                    size: "sm",
                    icon: ICONS.EXPAND,
                    configAria: {
                        "aria-label": CLOSE_LABEL
                    },
                    tooltipContent: CLOSE_LABEL,
                }
            }
        }
    };

    /**
     * Retrieves a preference value by name from the preferences array
     * @param {Array} preferencesArray - Array of preference objects
     * @param {string} preferenceName - The name of the preference to find
     * @param {*} defaultValue - Value to return if preference is not found
     * @return {*} The preference value or the default value
     */
    const getPreferenceByName = function(preferencesArray, preferenceName, defaultValue = null) {
        if (!Array.isArray(preferencesArray)) {
            return defaultValue;
        }
        const preference = preferencesArray.find(pref => pref.name === preferenceName);
        return preference && preference.value !== null ? preference.value : defaultValue;
    };

    // Determine what triggered this handler
    const isNew = api.data.record.isNew === true || api.data.record.isNew === 'true';
    const isButtonToggle = event.name === "NOW_RESIZBLE_PANES#DIVIDER_BUTTON#CLICKED";
    const isInitialLoad = event.name === "CTRL_RECORD#RECORD_DATA_FETCH_COMPLETED";
    
    // Default to open panel state
    let newState = PANEL_STATES.OPEN;

    // Handle state determination based on event type
    if (!isNew || isButtonToggle) {
        if (isInitialLoad) {
            // On initial load, retrieve and respect user preference
            try {
                const userData = api.data.lookupUserPreference.result;
                const leftPanelCollapsed = getPreferenceByName(
                    userData?.preferences, 
                    "workspace.layout.kb.leftPanelCollapsed", 
                    "true"
                );
                newState = leftPanelCollapsed === "true" ? PANEL_STATES.CLOSED : PANEL_STATES.OPEN;
            } catch (error) {
                // If preference retrieval fails, default to open state
                console.warn("Failed to retrieve user preferences:", error);
            }
        } else if (isButtonToggle) {
            // Handle toggle button click
            const dividerIcon = api.state.leftPanelDividerConfig?.buttonProps?.icon;
            const isPanelOpen = dividerIcon === ICONS.COLLAPSE;
            newState = isPanelOpen ? PANEL_STATES.CLOSED : PANEL_STATES.OPEN;

            // Save user preference for future visits
            try {
                await api.data.saveUserPreference.execute({
                    "name": "workspace.layout.kb.leftPanelCollapsed",
                    "value": isPanelOpen
                });
            } catch (error) {
                // Continue even if preference saving fails
                console.warn("Failed to save user preference:", error);
            }
        }
    }

    // Update panel collapsed state for other components to reference
    api.setState('leftPanelCollapsed', newState === PANEL_STATES.CLOSED);

    // Update all panel-related properties atomically
    api.setState('leftPanelWidth', newState.leftPanel);
    api.setState('rightPanelWidth', newState.rightPanel);
    api.setState('leftPanelDividerConfig', newState.dividerConfig);
}
