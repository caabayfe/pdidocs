/**
 * @callback GetPageRegistryId
 * @returns {string} The sysId of the sys_ux_page_registry record in scope.
 *
 * @typedef {object} QualificationContext
 * @property {GetPageRegistryId} getPageRegistryId
 * 
 * @callback GetDataBrokerResult
 * @returns {object} Results of the data broker evaluation
 * 
 * @callback GetMacroponentIds
 * @returns {Array} The macroponent sys_ids in scope
 * 
 * @typedef {object} CommandContext
 * @property {GetDataBrokerResult} getDataBrokerResult
 * @property {GetMacroponentIds} getMacroponentIds
 * 
 * @typedef {object} Command
 * @property {string} commandType - 'load_assets' | 'load_macroponents' | 'load_components'
 * @property {Array} payload - The identifiers to load based on the commandType:
 * 	- 'load_assets' - Array of asset names (eg @servicenow/asset1/index)
 * 	- 'load_macroponents' - Array of macroponent sys_ids to seed
 * 	- 'load_components' - Array of component tag names to get drivers for
 * 
 * @typedef {object} Trigger
 * @property {string} triggerType - 'data_broker' | 'macroponent' - The type of trigger
 * 	- 'data_broker' - sys_id of the desired early evaluated data broker.
 * 	- 'macroponent' - sys_id of the desired screen macroponent
 * @property {string} triggerValue - The sys_id of the relevant object type declared in triggerType 
 */

var UxAppExtension = Class.create();

UxAppExtension.prototype = {

    initialize: function() {},

    /**
     * Called after triggers qualify and allows for further qualification based on the incoming context.
     * 
     * @param {QualificationContext} qualificationContext - The qualification context for this extension execution
     * @returns {boolean} true if this extension should process, false otherwise
     */
    handles: function(qualificationContext) {
        // TODO: You most likely will want to return true here if your triggers are specific
        return qualificationContext.getPageRegistryId() === 'abc';
    },

    /**
     * Get the commands to be executed.
     * 
     * @param {CommandContext} commandContext - The command context for thsi extension execution
     * @return {Command[]} - The commands to execute
     */
    getCommands: function(commandContext) {
        const macroponentIds = commandContext.getMacroponentIds();
        const dataBrokerResult = commandContext.getDataBrokerResult(); // If you are triggering on a data broker

        // TODO: Determine what commands you want to run and return them
        return [{
                commandType: 'load_assets',
                payload: ['@servicenow/asset1/index', '@servicenow/asset2/index']
            },
            {
                commandType: 'load_macroponents',
                payload: ['sys_id_1', 'sys_id_2']
            },
            {
                commandType: 'load_components',
                payload: ['sn-component-tag-1', 'sn-component-tag-2']
            }
        ];
    },

    /**
     * Get the set of triggers used to qualify this extension for execution. Triggers will be AND'ed together
     * 
     * @returns {Trigger[]} - The set of triggers used to qualify
     */
    getTriggers: function() {
        // TODO: Determine what your triggers are
        return [{
                triggerType: 'data_broker',
                triggerValue: '70189b82877a101045957d3d87cb0ba8'
            },
            {
                triggerType: 'macroponent',
                triggerValue: 'a2b0596cec6b9d49dd1ff9bf76b5084b'
            }
        ]
    },

    type: 'UxAppExtension'
};
