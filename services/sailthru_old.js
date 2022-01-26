/*
  This contains all calls to the Sailthru API. Please note that the "lifecycle" endpoint
  is undocumented. Since none of our client libraries have built-in helper functions for
  this endpoint, all of these calls utilize low-level GET and POST functions from our NodeJS
  client library: https://getstarted.sailthru.com/developers/api-client/node-js/#Low_Level_Functions
*/

const sailthruClient = require('sailthru-client')

let Sailthru = {}

/*
  This is the initial GET call to the lifecycle endpoint. It retrieves a complete list of LO flows
  from the source account specified in the app UI.
*/

Sailthru.getList = (config) => {
  const SRC = sailthruClient.createSailthruClient(config.apiKey, config.secret);

  // Sailthru's Node client is not currently Promise-ready...
  return new Promise((resolve, reject) => {
    SRC.apiGet('lifecycle', {}, (err, res) => {
      if (err || res.error) {
        console.log("Error getting list:", err || res.error)
        reject(err || res.error);
      } else {
        // Create list of template names
        const templateList = {};
        res.forEach(lifecycle => templateList[lifecycle.name] = lifecycle.id);
        // Return err if list is empty
        templateList.length == 0 ? reject({errormsg: 'No templates found!'}) : resolve(templateList);
      }
    })
  })
}

/*
  Once a list is retrieved in this app, the user can select which LO flows they'd like to transfer
  by clicking a corresponding checkbox in the UI. The list of flows to be transfered is sent to the
  back-end an array of id's. In order to transfer each flow with all of its metadata, its necessary
  to do individual GET calls for each, do any necessary parsing (read: set active flows to inactive
  prior to posting them anywhere) and POST it to the target account.
*/
Sailthru.importFromList = (src_config, dest_config, list) => {
  const SRC = sailthruClient.createSailthruClient(src_config.apiKey, src_config.secret);
  const DEST = sailthruClient.createSailthruClient(dest_config.apiKey, dest_config.secret);

  console.log('List in importFromList: ', list)

  return new Promise((resolve, reject) => {
    // This array exists as a check on whether all POST calls have completed.
    var uploadResponses = [];

    // For each id in the "list" array...
    list.forEach(list_item => {
      // GET this flow from the API
      getLifecycle(list_item, SRC)
      // POST to target account
      .then(lifecycle => submitLifecycle(formatLifecycle(lifecycle), uploadResponses, DEST))
      // Check to see if this is the last POST call to complete
      .then(res => checkForTransferCompletion(uploadResponses, list))
      // If the previous step sees that all POST calls have completed, it resolves and the
      // results of each are returned to the UI to be displayed.
      .then(messages_array => resolve(messages_array))
      .catch(err => console.log(err));
    })
  })
}

// Helper function - gets LO flow by id.
function getLifecycle(name, src) {
  return new Promise((resolve, reject) => {
    src.apiGet('lifecycle',{id: name}, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  })
}

// Helper function - sets flow status to "inactive", and deletes existing id from source account.
function formatLifecycle(lifecycle) {
  delete lifecycle.id;
  lifecycle.status = 'inactive';
  return lifecycle;
}

// Helper function - POST's LO flow to target account
function submitLifecycle(lifecycle, arr, dest) {
  console.log("Uploading ", lifecycle.name)
  return new Promise((resolve, reject) => {
    dest.apiPost('lifecycle', lifecycle, (err, res) => {
      console.log(err ? `ERR: ${err.errormsg}` : `RES: ${res}`);
      if (err) {
        arr.push(`Error posting ${lifecycle.name}: ${err.errormsg}`);
      } else {
        arr.push(`Successfully posted \"${lifecycle.name}\" to Sailthru.`);
      }
      resolve(res);
    })
  })
}

// Check to see that all POST calls have completed.
function checkForTransferCompletion(arr1, arr2) {
  return new Promise((resolve, reject) => {
    if (arr1.length == arr2.length) {
      console.log("All done here!");
      resolve(arr1);
    }
  })
}

module.exports = Sailthru;
