gs.include("PrototypeServer");

var PGPSingleSignOn = Class.create();
PGPSingleSignOn.prototype = {

       process : function() {

          Packages.java.security.Security.addProvider( new Packages.org.bouncycastle.jce.provider.BouncyCastleProvider());

          var headerKey = GlideProperties.get("glide.authenticate.header.key", "SM_USER");
          var fieldName = GlideProperties.get("glide.authenticate.header.value", "user_name"); 

          gs.log("External authentication using: " + headerKey + " / " + fieldName);

          var encdata = request.getHeader(headerKey);
          if (encdata == null) {
            encdata = request.getParameter(headerKey);

            // maybe its a cookie
            if (encdata == null) {
                var CookieMan = GlideCookieMan;
        	var cookies = request.getCookies();
            	encdata = CookieMan.getCookieValue(cookies, headerKey);
            }
          }
      
          try {
            // Replace all spaces with plus(+)'s, converted in url         
            encdata = encdata.replaceAll(' ', '+');
          
            // Decode the data back to a byte array
            var base64Decoder = new Packages.sun.misc.BASE64Decoder();
            var newEncdata = base64Decoder.decodeBuffer(encdata);

            // ----- Decrypt the file
            var privateKeyFile = new Packages.java.io.File("/glide/instances/instance_port/webapps/glide/itil/WEB-INF/update/customer/uploads/PGPPrivateKeyFile.skr");

            var privateKeyPassword = GlideProperties.get("glide.authenticate.secret_key");

	    var encdataByteArray = new Packages.java.io.ByteArrayInputStream(newEncdata);
	    var privateKeyInputStream = new Packages.java.io.FileInputStream(privateKeyFile);
 
            var key = this.decrypt(encdataByteArray, privateKeyInputStream, privateKeyPassword.split(''));

            gs.log("Decrypted Key=" + key);
          } catch(e) {
              gs.log(e);
          }

          if (key != null) {
            var ugr = new GlideRecord("sys_user");
            ugr.initialize();
            if (!ugr.isValidField(fieldName)) {
                var Log = GlideLog;
                Log.warn("External authorization is set to use field: '"
                        + fieldName + "' which doesn't exist");

                return "failed_missing_requirement";
            }
            ugr.addQuery(fieldName, key);
            ugr.query();
            if (!ugr.next()) {
                var User = GlideUser;
                var userLoad = User.getUser(key);
                if (userLoad == null)
                    return "failed_authentication";
                ugr.initialize();
                ugr.addQuery(fieldName, key);
                ugr.query();
                if (!ugr.next())
                    return "failed_authentication";
            }
            var userName = ugr.getValue("user_name");
            
            return userName;
          } else {
            return "failed_missing_requirement";
          }
        },

        decrypt : function( encdataByteArray, privateKeyInputStream, privateKeyPassword ) {

                //org.bouncycastle.openpgp.PGPUtil
		decodStream = Packages.org.bouncycastle.openpgp.PGPUtil.getDecoderStream( encdataByteArray );
                var pgpObjFact = new Packages.org.bouncycastle.openpgp.PGPObjectFactory( decodStream );

		var enc;

		var o = pgpObjFact.nextObject();

		//
		// the first object might be a PGP marker packet.
		//
		if (o instanceof Packages.org.bouncycastle.openpgp.PGPEncryptedDataList) {
			enc = o;
		} else {
			enc = pgpObjFact.nextObject();
		}

		//
		// find the secret key
		//
		var it = enc.getEncryptedDataObjects();
		var sKey = null;
		var pbe = null;

		while (sKey == null && it.hasNext()) {
			pbe = it.next();
			gs.print("pbe id=" + pbe.getKeyID());
			sKey = this.findSecretKey(privateKeyInputStream, pbe.getKeyID(), privateKeyPassword);
		}

		if (sKey == null) {
			gs.print("secret key for message not found.");
                        return null;
		}

		var clear = pbe.getDataStream(sKey, "BC");
		var plainFact = new Packages.org.bouncycastle.openpgp.PGPObjectFactory(clear);
		var message = plainFact.nextObject();

		if (message instanceof Packages.org.bouncycastle.openpgp.PGPCompressedData) {
			var pgpFact = new Packages.org.bouncycastle.openpgp.PGPObjectFactory(message.getDataStream());
                        message = pgpFact.nextObject();
		}
                gs.print('After message: ' + message );
		var baos = new java.io.ByteArrayOutputStream();

		if (message instanceof Packages.org.bouncycastle.openpgp.PGPLiteralData) {
			var unc = message.getInputStream();
			var ch;

			while ((ch = unc.read()) >= 0) {
				baos.write(ch);
			}
		} else if (message instanceof Packages.org.bouncycastle.openpgp.PGPOnePassSignatureList) {
			gs.print("encrypted message contains a signed message - not literal data.");
                        return null;
		} else {
			gs.print("message is not a simple encrypted file - type unknown.");
                        return null;
		}

		if (pbe.isIntegrityProtected()) {
			if (!pbe.verify()) {
				gs.print("message failed integrity check");
			} else {
				gs.print("message integrity check passed");
			} 
                } else {
			gs.print("no message integrity check");
		}
		return baos.toString();
        },

        findSecretKey : function(privKey, pbe, privateKeyPassword) {

                var pgpSec = new Packages.org.bouncycastle.openpgp.PGPSecretKeyRingCollection(Packages.org.bouncycastle.openpgp.PGPUtil.getDecoderStream(privKey));

		var pgpSecKey = pgpSec.getSecretKey(pbe);

		if (pgpSecKey == null) {
			return null;
		}
		return pgpSecKey.extractPrivateKey(privateKeyPassword, "BC");
        }

}
