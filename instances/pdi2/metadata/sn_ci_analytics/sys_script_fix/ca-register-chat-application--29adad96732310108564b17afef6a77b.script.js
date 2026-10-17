var sender = new CASender();
var caPopulateFlattenFields = new CAPopulateFlattenFields();
try {
    sender.registerApplication();
} catch (error) {
    gs.error("Error while registering the application :" + error);
}
try {
    caPopulateFlattenFields.populateFlattenFields();
} catch (error) {
    gs.error("Error while populating the flatten fields :" + error);
};
