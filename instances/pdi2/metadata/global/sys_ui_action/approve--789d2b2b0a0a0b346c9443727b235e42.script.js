var hap = new HAPairing(current);

hap.log("Pairing request approved by " + gs.getUser().getName());

// open DB access
var credentials = hap.applyPairingRequest();
if (credentials != null) {
  hap.log("Grant privileges successfully applied");

  var username = credentials[0];
  var password = credentials[1];

  // send response
  hap.response(username, password);
  hap.log("Pairing approved response sent to primary");
}

current.state = 'Approved';
current.approved = true;
current.update();
