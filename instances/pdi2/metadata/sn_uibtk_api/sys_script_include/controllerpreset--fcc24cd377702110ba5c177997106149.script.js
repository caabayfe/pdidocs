const ControllerPreset = Class.create();
ControllerPreset.prototype = Object.extendsObject(PresetBase, {
    TABLE: 'sys_ux_controller_preset',
    FIELDS: ['name', 'description', 'controller', 'connected_controller', 'properties', 'event_handlers', 'connected_controller_event_handlers', 'host_event_handlers'],
    FIELD_TYPES: {
        name: 'translated_field',
        description: 'translated_text',
        controller: 'reference',
        connected_controller: 'reference',
        properties: 'json',
        event_handlers: 'json',
        connected_controller_event_handlers: 'json',
        host_event_handlers: 'json'
    },

    type: 'ControllerPreset'
});
