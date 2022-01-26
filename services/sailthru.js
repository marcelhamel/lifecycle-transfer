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
  const Client = sailthruClient.createSailthruClient(config.apiKey, config.secret);

  // Sailthru's Node client is not currently Promise-ready...
  return new Promise((resolve, reject) => {
    Client.apiGet('lifecycle', {}, (err, res) => {
      if (err || res.error) {
        reject(err || res.error);
      } else {
        const flowList = res.reduce((obj, flow) => ({ ...obj, [flow.name]: flow.id }), {});
        if (flowList.length == 0) {
          reject('No Lifecycle Optimizer flows found!');
        } else {
          resolve(flowList);
        }
      }
    });
  });
};

/*
  Part of the import process, gets a single LO flow by its ID
*/

Sailthru.getFlowById = (config, flowId) => {
  Client = sailthruClient.createSailthruClient(config.apiKey, config.secret);

  return new Promise((resolve, reject) => {
    Client.apiGet('lifecycle',{id: flowId}, (err, res) => (err || res.error) ? reject(err || res.error) : resolve(res));
  });
};

/*
  POST single Lifecycle Optimizer Flow object to Sailthru. Return upload status in repsonse.
*/

Sailthru.postFlow = (config, flow) => {
  const Client = sailthruClient.createSailthruClient(config.apiKey, config.secret);

  return new Promise((resolve, reject) => {
    Client.apiPost('lifecycle', flow, (err, res) => {
      if (err || res.errormsg) {
        resolve(`Error submitting ${flow.name} to Sailthru: ${res.errormsg}`);
      } else {
        resolve(`Successfully posted \"${flow.name}\" to Sailthru.`);
      }
    });
  });
}

/*
  Create map of template ID's in target and source accounts:
*/
Sailthru.createTemplateIDMap = async(src_config, dest_config) => {
  const source = sailthruClient.createSailthruClient(src_config.apiKey,src_config.secret);
  const target = sailthruClient.createSailthruClient(dest_config.apiKey,dest_config.secret);

  const getTemplates = (client) => {
    return new Promise((resolve, reject) => {
      client.apiGet('template', {}, (err,res) => (err || res.error) ? reject(err || res.error) : resolve(res.templates));
    });
  };

  const sourceIds = await getTemplates(source);
  let sourceMap = sourceIds.reduce((obj, x) => ({ ...obj, [x.name]: x.template_id }), {});

  const targetIds =  await getTemplates(target);

  const finalMap = targetIds.reduce((obj, x) => {
    return sourceMap[x.name] ? { ...obj, [sourceMap[x.name]]: x.template_id } : obj;
  }, {});

  return finalMap;
}

module.exports = Sailthru;
