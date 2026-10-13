var DiscoveryWorkflowIcons = Class.create();

DiscoveryWorkflowIcons.prototype = {
    initialize: function(ref) {
        this.elementName = ref;
        this.element = eval(ref);
        this.goodFinishers = {
            'completed': true
        };
        this.allFinishers = {
            'offline': true,
            'rejected': true,
            'completed': true
        };
    },

    process: function(c) {
        var choices = c.clone();

        for (var i = 0; i < choices.getSize(); i++) {
            var c = choices.getChoice(i);
            this.processChoice(c, i, choices.getSelectedIndex(), this. getElement());

            if (c.selected && this.isFinisher(c.value)) {
                for (var n = choices.getSize() - 1; n > i; n--)
                    choices.removeChoice(n);
                i = choices.getSize();
            }
        }

        return choices;
    },

    getElement: function() {
        return this.element;
    },

    isBadFinisher: function(x) {
        return !this.goodFinishers[x];
    },

    isFinisher: function(x) {
        return this.allFinishers[x];
    },

    processChoice: function(choice, index, selectedIndex, selectedValue) {
        var selected = (index == selectedIndex);

        if (index > selectedIndex) {
            choice.image = 'icon-empty-circle';
            return;
        }

        if (selected) {
            choice.image = 'icon-arrow-right';

            if (choice.value == 'rejected')
                choice.image = 'icon-clear';
            else if (choice.value == 'completed')
                choice.image = 'icon-check-circle';
            else if (choice.value == 'offline')
                choice.image = 'icon-step-over';
        } else {
            if (this.isBadFinisher(selectedValue))
                choice.image = 'icon-step-over';
            else
                choice.image = 'icon-check-circle';
        }
    },

    type: 'DiscoveryWorkflowIcons'
};
