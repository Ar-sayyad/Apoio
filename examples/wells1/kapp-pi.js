/// <reference path="../../js/kapp-0.1/kapp.js" />

/**
 * kApp.pi sub-module: Contains helper function for dealing with PiWebApi batch queries
 * @version 0.1
 */

kApp.pi = (function() {

  var self = {};

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Launch a PIWebApi batch query
   * @param {any} requestData Configuration of the batch query
   * @param {function} successCallback
   */
  self.piBatchQuery = function(requestData, successCallback) {
    kApp.queryJSON('https://bkztkdsas31.bdom.ad.corp/piwebapi/batch', requestData, 'POST', successCallback, true); 
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  /**
   * Check a PIWebApi batch result and process it if eachCallback function in defined
   * @param {any} result Result of the PiWebApi batch query
   * @param {string} errorMessage Error message to display if the PIWebApi batch query failed
   * @param {function} eachCallback Function to call for the enumeration of the result
   * @param {boolean} reverse If true, parse the list in revese mode
   * @returns {object} Return simplified version of the PiWebApi result (*.Content or *.Content.Items)
   */
  self.parseBatchResult = function(result, errorMessage, eachCallback, reverse) {
    if (result) {
      if ([200, 201, 202, 204, 207].indexOf(result.Status) >= 0) {
        if (result.Content) {
          if (result.Content.Items) {
            if (eachCallback) {
              if (reverse) result.Content.Items.reverse();
              result.Content.Items.forEach(eachCallback);
            }
            return result.Content.Items;
          } else if (result.Content.Rows){
            if (eachCallback) {
              if (reverse) result.Content.Rows.reverse();
              result.Content.Rows.forEach(eachCallback);
            }
            return result.Content.Items;
          }
          if (eachCallback) { eachCallback(result.Content); }
        }
        return result.Content;
      } else {
        kApp.showAlert('danger', errorMessage ? [errorMessage, result.Content].join('<br />') : 'Undefined error', 'Error!');
        console.log(errorMessage);
        console.log(result);
      }
    } else {
      kApp.showAlert('danger', [errorMessage, 'Results are empty!'].join('<br />'), 'Error!');
    }
    return false;
  }
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  self.genAssetElementsUrl = function(assetType, assetName) {
    return 'https://bkztkdsas31.bdom.ad.corp/piwebapi/elements/P1Em' + window.btoa(self.config[assetType].path + (assetName ? '\\' + assetName: '')).replace(/=/gi, '') + '/elements';
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  self.genAssetElementsChildrenQuery = function(assetType, assetName, selectedFields) {
    if (!selectedFields) selectedFields = ['items.links.elements', 'items.name'];
    return { Method: 'GET', Resource: self.genAssetElementsUrl(assetType, assetName) + (selectedFields instanceof Array ? '?selectedFields=' + selectedFields.join(';') : '') };
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  self.genAssetElementsChildrenSubQuery = function(parentQuery, selectedFields) {
    if (!selectedFields) selectedFields = ['items.links.elements', 'items.name'];
    return { Method: 'GET', RequestTemplate: { Resource: '{0}' + (selectedFields instanceof Array ? '?selectedFields=' + selectedFields.join(';') : '') }, ParentIds: [ parentQuery ], Parameters: [ '$.' + parentQuery + '.Content.Items[*].Links.Elements' ]};
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  self.config = {
    tuz: {
      path: 'BKZTKDSAS32\\DEM\\TUZ'
      ,templateName: 'TUZ'
      ,children: ['prline', 'vrline']
    }
    ,zone: {
      path: 'BKZTKDSAS32\\DEM\\ZONES'
      ,templateName: 'ZONE'
      ,children: ['tuz']
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  return self;
  
})();