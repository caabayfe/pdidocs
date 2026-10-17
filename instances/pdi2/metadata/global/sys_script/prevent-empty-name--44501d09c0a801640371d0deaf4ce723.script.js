/**
 Service-now.com 

 Description:  Do not allow a new view with a (empty) name OR a title of default view
**/ 

var abortMe = false;

if (current.name.nil())
    abortMe = true;

if (current.title.toLowerCase() == "default view")
    abortMe = true;

if (abortMe) {
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("A view with a Name of (empty) or Title of 'Default view' already exists"));
}
