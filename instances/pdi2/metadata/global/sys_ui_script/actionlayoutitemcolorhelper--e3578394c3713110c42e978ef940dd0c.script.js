var ActionLayoutItemColorHelper = Class.create();

var gwt = new GwtMessage();
var COLOR_CHOICE_LABELS = ["AI primary", "AI secondary", "AI tertiary", "Primary", "Primary positive", "Primary negative", "Primary selection", "Secondary", "Secondary positive", "Secondary negative", "Secondary selection", "Tertiary", "Tertiary selection"];
var COLOR_CHOICE_TRANSLATIONS = gwt.getMessages(COLOR_CHOICE_LABELS);

ActionLayoutItemColorHelper.prototype = {

    GROUP_TYPE_SPLIT_BUTTON: "1",
    COLUMN_NAME_COLOR: "color",
    COLUMN_NAME_VARIANT: "variant",
    BUTTON_OPTIONS: [{
            "value": "primary",
            "displayValue": "Primary"
        },
        {
            "value": "primary-positive",
            "displayValue": "Primary positive"
        },
        {
            "value": "primary-negative",
            "displayValue": "Primary negative"
        },
        {
            "value": "secondary",
            "displayValue": "Secondary"
        },
        {
            "value": "secondary-positive",
            "displayValue": "Secondary positive"
        },
        {
            "value": "secondary-negative",
            "displayValue": "Secondary negative"
        },
        {
            "value": "tertiary",
            "displayValue": "Tertiary"
        },
        {
            "value": "primary-ai",
            "displayValue": "AI primary"
        }, {
            "value": "secondary-ai",
            "displayValue": "AI secondary"
        }, {
            "value": "tertiary-ai",
            "displayValue": "AI tertiary"
        }
    ],
    MENU_OPTIONS: [{
            "value": "primary",
            "displayValue": "Primary"
        },
        {
            "value": "primary-selection",
            "displayValue": "Primary selection"
        },
        {
            "value": "secondary",
            "displayValue": "Secondary"
        },
        {
            "value": "secondary-selection",
            "displayValue": "Secondary selection"
        },
        {
            "value": "tertiary",
            "displayValue": "Tertiary"
        },
        {
            "value": "tertiary-selection",
            "displayValue": "Tertiary selection"
        },
        {
            "value": "primary-ai",
            "displayValue": "AI primary"
        }, {
            "value": "secondary-ai",
            "displayValue": "AI secondary"
        }, {
            "value": "tertiary-ai",
            "displayValue": "AI tertiary"
        }
    ],

    initialize: function() {},

    setButtonOptions: function(fieldName, initialValue) {
        g_form.clearOptions(fieldName);
        this.BUTTON_OPTIONS.forEach(option => {
            g_form.addOption(fieldName, option.value, COLOR_CHOICE_TRANSLATIONS[option.displayValue]);
        });
        if (initialValue && this.BUTTON_OPTIONS.find(option => option.value === initialValue)) {
            g_form.setValue(fieldName, initialValue);
        }
    },

    setDropdownOptions: function(fieldName, initialValue) {
        g_form.clearOptions(fieldName);
        this.MENU_OPTIONS.forEach(option => {
            g_form.addOption(fieldName, option.value, COLOR_CHOICE_TRANSLATIONS[option.displayValue]);
        });
        if (initialValue && this.MENU_OPTIONS.find(option => option.value === initialValue)) {
            g_form.setValue(fieldName, initialValue);
        }
    },

    loadVariantOptions: function(layoutItemSysId, initialValue) {
        var layoutItem = new GlideRecord("sys_ux_form_action_layout_item");
        layoutItem.get(layoutItemSysId);
        if (layoutItem.getValue("item_type") === "action") {
            this.setButtonOptions(this.COLUMN_NAME_VARIANT, initialValue);
        } else {
            var layoutGroup = new GlideRecord('sys_ux_form_action_layout_group');
            layoutGroup.get(layoutItem.getValue("layout_group"));
            if (layoutGroup.getValue("type") === this.GROUP_TYPE_SPLIT_BUTTON) {
                this.setButtonOptions(this.COLUMN_NAME_VARIANT, initialValue);
            } else {
                this.setDropdownOptions(this.COLUMN_NAME_VARIANT, initialValue);
            }
        }
    },

    loadColorOptions: function(initialValue) {
        if (g_form.getValue("item_type") === "action") {
            this.setButtonOptions(this.COLUMN_NAME_COLOR, initialValue);
        } else {
            var gr = new GlideRecord('sys_ux_form_action_layout_group');
            gr.get(g_form.getValue("layout_group"));
            if (gr.getValue("type") === this.GROUP_TYPE_SPLIT_BUTTON) {
                this.setButtonOptions(this.COLUMN_NAME_COLOR, initialValue);
            } else {
                this.setDropdownOptions(this.COLUMN_NAME_COLOR, initialValue);
            }
        }
    },

    handleActionItemTypeChange: function(itemType) {
        if (itemType === "action") {
            this.setButtonOptions(this.COLUMN_NAME_COLOR);
        }
        if (itemType === "group") {
            // Clear the options and wait for the user to select an action group to set the correct options
            // which is handled by handleActionItemGroupChange()
            g_form.clearOptions(this.COLUMN_NAME_COLOR);
        }
    },

    handleActionItemGroupChange: function(layoutGroupSysId) {
        var gr = new GlideRecord('sys_ux_form_action_layout_group');
        gr.get(layoutGroupSysId);
        if (gr.getValue("type") === this.GROUP_TYPE_SPLIT_BUTTON) {
            this.setButtonOptions(this.COLUMN_NAME_COLOR);
        } else {
            this.setDropdownOptions(this.COLUMN_NAME_COLOR);
        }
    },

    type: "ActionLayoutItemColorHelper"
};
