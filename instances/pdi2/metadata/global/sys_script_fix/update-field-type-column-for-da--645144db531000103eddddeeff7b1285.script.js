updateFieldType();

function updateFieldType() {
    if (pm.isZboot())
        return;
    
    updateInternalType();
    generateChoices();
}

function updateInternalType() {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_declarative_action_assignment');
    gr.addQuery('element', 'field_type');
    gr.query();

    while(gr.next()) {
        gr.setValue('internal_type', 'choice');
        gr.setValue('choice', 3);
        gr.setValue('default_value', 'glide_date');
        gr.update();
    }
}

function generateChoices() {
    var choices = [
    {
        label: 'Date',
        value: 'glide_date'
    },
    {
        label: 'Date/Time',
        value: 'glide_date_time'
    },
    {
        label: 'Decimal',
        value: 'decimal'
    },
    {
        label: 'Email',
        value: 'email'
    },
    {
        label: 'Floating point number',
        value: 'float'
    },
    {
        label: 'Integer',
        value: 'integer'
    },
    {
        label: 'Password (1-way encrypted)',
        value: 'password'
    },
    {
        label: 'Phone Number',
        value: 'ph_number'
    },
    {
        label: 'Phone Number (E164)',
        value: 'phone_number_e164'
    },
    {
        label: 'Reference',
        value: 'reference'
    },
    {
        label: 'String',
        value: 'string'
    }];

    choices.map(function(choice, index) {
        var choiceGR = new GlideRecord('sys_choice');
        choiceGR.initialize();
        choiceGR.setValue('name', 'sys_declarative_action_assignment');
        choiceGR.setValue('element', 'field_type');
        choiceGR.setValue('language', 'en');
        choiceGR.setValue('label', choice.label);
        choiceGR.setValue('value', choice.value);
        choiceGR.setValue('sequence', index + 1);
        choiceGR.insert();
    });
}
