var soapatt = new SoapAttachments(current);

if (current.payload == "<see_attachment/>"){
   //The attachment string was too big for the ecc_queue
   //so it was created as a text file containing the 
   //base64 encoded string.  Decode the string and attach
   //to the appropriate record
   soapatt.createAttachmentFromAttachedEncodedString()
}
else{
   //take the base64 encoded data and create an attachment
   soapatt.createAttachmentFromEccQueue();
}

current.state = "processed";
