'use strict';
require('dotenv').config();
const admin = require('firebase-admin');
const axios = require('axios');
const sleep = require('await-sleep');

const serviceAccount = require("./admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://general-open-project.firebaseio.com'
});

const db = admin.firestore();

const main = async () => {
  const tracking_checklist = await db.collection('tracking_checklist').get();
  tracking_checklist.forEach(async doc =>{
    const data = doc.data();
    const req_url = `https://api.shipengine.com/v1/tracking?carrier_code=${data.carrier.toLowerCase()}&tracking_number=${data.tracking_number}`;

    if (data.received || data.carrier == 'OTHER') return 0;

    console.log('getting status of ' + data.tracking_number);
    try {
      const tracking_req = await axios.get(req_url, {
        headers: {
          'API-Key': process.env.TRACKING_TOKEN
        }
      });

      data['status'] = tracking_req.data.status_description;
      console.log('saving ' + data.tracking_number);
      await db.collection('tracking_checklist').doc(data.tracking_number).set(data);
      await sleep(1000);
    } catch (e) {
      console.log(e);
    }

  });
}

main();