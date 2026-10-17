if (current.parent.nil()) {
   // update substatus to available because pre-allocated will prevent ci creation
   current.substatus = 'available';
} else {
   // inherit parent's state upon allocation
   current.install_status = current.parent.install_status;
   current.substatus = current.parent.substatus;
}

current.update();
// create CI as needed
(new AssetandCI()).createCI(current);
current.update();

action.setRedirectURL(current);
