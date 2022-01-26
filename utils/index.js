module.exports = {
  formatLifecycle:(lifecycle, flowMap, templateMap) => {
    // If flow with same name exists in target account, use that ID.
    if (flowMap[lifecycle.name]) {
      lifecycle.id = flowMap[lifecycle.name];
    } else {
      delete lifecycle.id;
    }

    // TODO - Map send steps to template ID's in target account
    for (const stepId in lifecycle.steps) {
      const step = lifecycle.steps[stepId];

      if (step.subtype === 'sendEmail') {
        const targetTemplateId = templateMap[step.taskAttributes.templateId];
        if (targetTemplateId) {
          lifecycle['steps'][stepId]['taskAttributes']['templateId'] = targetTemplateId;
        }
      }
    };

    // ALWAYS deactivate flows before transferring.
    lifecycle.status = 'inactive';
    return lifecycle;
  }
};
