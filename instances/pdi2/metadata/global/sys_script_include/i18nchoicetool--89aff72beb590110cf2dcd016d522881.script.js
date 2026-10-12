var I18NChoiceTool = Class.create();
I18NChoiceTool.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    _getAFreshChoice : function(name, element, value) {
        return {
            c_name: name + '',
            c_element: element + '',
            c_value: value + '',
            c_inactive: 'SKIP',

            setInactive : function(inactive) {
                this.c_inactive = !!inactive && ['1', 'true', 1, true].indexOf(inactive.toLowerCase()) > -1;
            }
        };
    },

    _getUniqueName : function(choice) {
        var fd = '__'; //forbidden delimiter
        return choice.getValue('name') + fd + choice.getValue("element") + fd + choice.getValue('value') + fd;
    },

    _updateInactiveField : function(c) {
        if (c.c_inactive === 'SKIP') 
            return;
        var choice = new GlideRecord('sys_choice');
        choice.addQuery('name', c.c_name);
        choice.addQuery('element', c.c_element);
        choice.addQuery('value', c.c_value);
        choice.setValue('inactive', c.c_inactive);
        choice.setSystem(true);

        choice.updateMultiple();
    },

    _shouldSkip: function(choice) {
        var sciptyLabel = "I18nUtils().getUserLanguage()";

        // let's keep away the fuzzy script choices surrounding languages choices
        if ((choice.getValue('label') + '').indexOf(sciptyLabel)  > -1) {
            return true;
        }

        // let's also steer clear of messing with the preferred_language choices as this should never need to be corrected
        if ('sys_user' == choice.getValue('name') && 'preferred_language' == choice.getValue('element')) {
            return true;
        }

        return false;
    },

    makeAllTheChoicesRight: function() {
        var trigger_name = 'I18N: Re-activate trs choices';
        var published_trigger_name = 'ASYNC: ' + trigger_name;

        var script = 'new global.I18NChoiceTool().findAndRepairChoices();';
        
        var trigger = new GlideRecord('sys_trigger');
		if (trigger.isValid()) {
			trigger.addQuery('name', published_trigger_name);
			trigger.query();

            if (!trigger.next()) {
				var when = new GlideDateTime();
				when.addSeconds(60 * 15); // 15 min
				
				GlideRunScriptJob.scheduleScript(script, trigger_name, when);
            }
        }


    },

    // Looks for clumps of choices we need to fix
    findAndRepairChoices: function() {
        var sciptyLabel = "avascript:'System (' + new I18nUtils().getUserLanguage() + ')'";

        var choicesToCleanUp = [];  // our clumps go here
        var choice = new GlideRecord('sys_choice');
        choice.orderBy('name');
        choice.orderBy('element');
        choice.orderBy('value');

        choice.query();
        var uniqueName = '';
        var currentChoice = this._getAFreshChoice('', '', '');

        var canSkip = true;
        var lastInactive;

        while(choice.next()) {
            // At this very moment we've moved on to a new choice
            if (uniqueName != (this._getUniqueName(choice) + '')) {
                if (currentChoice.c_inactive != 'SKIP' && !canSkip) {
                    choicesToCleanUp.push(currentChoice);
                }

                currentChoice = this._getAFreshChoice(choice.getValue('name'), choice.getValue('element'), choice.getValue('value'));
                uniqueName = this._getUniqueName(choice);
                lastInactive = choice.getValue('inactive') + '';
                canSkip = true;
            }

            // We only care if the choices are not in sync;
            var currentValueOfInactive = choice.getValue('inactive') + '';
            if (canSkip === true && currentValueOfInactive != lastInactive) {
                canSkip = false;
            }

            if ('en' === choice.getValue('language') + '') {
                if (!this._shouldSkip(choice)) {
                    currentChoice.setInactive(currentValueOfInactive + '');
                }
            }
        }

        // Process the clumps
        for (var i = 0; i < choicesToCleanUp.length; i++) {
            this._updateInactiveField(choicesToCleanUp[i]);
        }

        return JSON.stringify(choicesToCleanUp);
    },

    type: 'I18NChoiceTool'
});
