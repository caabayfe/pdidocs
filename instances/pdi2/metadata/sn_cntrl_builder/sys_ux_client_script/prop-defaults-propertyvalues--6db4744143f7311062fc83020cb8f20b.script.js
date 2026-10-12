function evaluateProperty({
    api,
    helpers
}) {
if(api.elements.controller_builder.controllerModel && api.elements.controller_builder.controllerModel.controllerConfigGuidance){
    return {
        controllerConfigGuidance: {
            type: "JSON_LITERAL",
            value: api.elements.controller_builder.controllerModel.controllerConfigGuidance
        }
    };
}
return {};
}
