const Sailthru = require('../services/sailthru');
const LO_Utils = require('../utils');
let controller = {};

// Transfers LO flows specified by user from source acct to target acct.
controller.transferFlows = (req, res) => {
  // Map out request body...
  const src_config = { apiKey: req.body.src.apiKey, secret: req.body.src.secret };
  const dest_config = { apiKey: req.body.dest.apiKey, secret: req.body.dest.secret };
  const flowIds = req.body.list;

  // Declare variables for
  let templateMap, lifecycleMap;

  // Create map of template ID's
  Sailthru.createTemplateIDMap(src_config,dest_config)
  .then(templateIdMap => {
    console.log("Mapping templates... ", templateIdMap);
    templateMap = templateIdMap;
    return Sailthru.getList(dest_config);
  })
  // Then create map of Lifecycle Optimzer names/ID's in target account.
  // Used to differentiate between updating and creating flows.
  .then(targetLOMap => {
    lifecycleMap = targetLOMap;
    return;
  })
  // Retrieve JSON for all LO flows from SOURCE account.
  .then(() => {
    console.log("Getting all flows");
    return Promise.all(flowIds.map(flow => Sailthru.getFlowById(src_config, flow)))
  })
  // Modify all JSON payloads and post to destination.
  .then(allFlows => {
    const targetFlows = allFlows.map(x => LO_Utils.formatLifecycle(x, lifecycleMap, templateMap));
    return Promise.all(targetFlows.map(x => Sailthru.postFlow(dest_config, x)));
  })
  .then(responseMessages => res.status(200).send(responseMessages))
  .catch(err => res.status(500).send('Yeah something went wrong, sorry... ' + err));
};


// Retrieves list of LO flows from source account.
controller.getList = (req, res) => {
  console.log('GETTING LIST')

  let SailthruConfig = {
    apiKey: req.query.apiKey,
    secret: req.query.secret
  }

  Sailthru.getList(SailthruConfig)
  .then(list => {
    // Return err if list is empty, otherwise return list
    if (list.length == 0) {
      res.status(500).send('No flows here.');
    } else {
      res.status(200).send(list);
    }
  })
  .catch(err => {
    console.log('Err: ', err);
    err.action = 'retrieving a LO flow list from';
    err.service = 'Sailthru';
    res.status(500).send(err);
  });
};

module.exports = controller;
