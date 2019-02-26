/// <reference path="../../js/kapp-0.1/kapp.js" />
/// <reference path="kapp-pi.js" />

kApp.wells = (function() {

  var self = {};

  self.$lstParents = $('<select />');
  self.$lstAssets = $('<ul />');
  self.$lstElements = $('<ul />');
  self.$chart = $('<canvas />');
  self._chart = null;

  self.chartConfig = {
    type: 'bar'
    ,data: {
      datasets: []  
    }
    ,options: {
      scales: {
        xAxes: [{ id: 't', type: 'time' }]
        ,yAxes: []
      }
      ,tooltips: {
        mode: 'index'
        ,intersection: false
        ,position: 'nearest'
      }
    }
  };

  self.datasets = {};
  
  self.updateActions = {};

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.initElementList = function() {
    
    if (self.$lstElements.selectable('instance')) self.$lstElements.selectable('destroy');

    self.$lstElements.empty();

    self.$lstElements.attr('selection', 'element');

    $.each(self.configElements, function (key, value) {
      self.$lstElements.append($('<li />').attr('element', key).html(self.configElements[key].label));
    });

    self.$lstElements.children().sort(function(a, b) {
      return $(a).html() > $(b).html();
    }).appendTo(self.$lstElements);

    self.$lstElements.selectable({
      start: self.startSelection
      ,selected: self.itemSelected
      ,unselected: self.itemUnselected
      ,stop: self.stopSelection
    });
    self.$lstElements.disableSelection();

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.loadParentList = function(template, asset, callback) {

    var req = {};
    req[template] = { Method: 'GET', Resource: self.genAssetElementsUrl(template, '') + '?templateName=' + self.config[template].templateName + '&maxcount=50000&selectedFields=items.name;items.webid;items.links.self' };

    kApp.pi.piBatchQuery(req, function(data){

      if (kApp.params.debug) {
        console.log('load parent list');
        console.log(data);
      }

      kApp.pi.parseBatchResult(data[template], 'Failed to load ' + self.config[template].templateName, function(item) {
        self.$lstParents.append($('<option />').attr('webid', item.WebId).html(item.Name));
      });

      if (asset) {
        self.$lstParents.val(asset);
      } else {
        kApp.setParam('asset', self.$lstParents.val(), true);
      }
      
      self.$lstAssets.attr('selection', 'asset');

      if (self.$lstAssets.selectable('instance')) self.$lstAssets.selectable('destroy');
      self.$lstAssets.empty();
  
      self.$lstAssets.append($('<li />').attr('type', template).addClass('child0').html(asset));
      self.loadAssets(template, asset, self.$lstAssets, 'appendTo', 1);
    
    });

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.loadAssets = function(template, asset, $content, action, iteration) {

    // if(kApp.params.debug) {
      console.log('loadAssets');
      console.log([template, asset, action, iteration]);
    // }

    if (!iteration) {
      if (self.$lstAssets.selectable('instance')) self.$lstAssets.selectable('destroy');
      self.$lstAssets.empty();
      iteration = 0;
    }

    var req = {};
    self.config[template].children.forEach(child => {
      req[child] = { Method: 'GET', Resource: self.genAssetElementsUrl(template, asset) + '?templateName=' + self.config[child].templateName + '&maxcount=50000&selectedFields=items.name;items.webid;items.links.self' };
    });

    kApp.pi.piBatchQuery(req, function(data){

      if (kApp.params.debug) {
        console.log('load assets');
        console.log(data);
      }

      self.config[template].children.forEach(child => {
        
        kApp.pi.parseBatchResult(data[child], 'Failed to load ' + self.config[child].templateName, function(item) {
          var $li = $('<li />').attr('type', child).addClass('child' + iteration).html(item.Name);
          if (self.config[child].children.length > 0) { self.loadAssets(child, item.Name, $li, 'insertAfter', iteration + 1); };
          // self.config[child].children.forEach(child2 => { self.loadAssets(child, item.Name, $li, 'insertAfter', iteration + 1); });
          $li[action]($content);
        }, action === 'insertAfter');
        
      });
      
      self.$lstAssets.selectable({
        start: self.startSelection
        ,selected: self.itemSelected
        ,unselected: self.itemUnselected
        ,stop: self.stopSelection
      });
      self.$lstAssets.disableSelection();

    });

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.initChart = function() {

    if (self.chartConfig.options.scales.yAxes.length === 0) {
      $.each(self.configElements, function(key, value) {
        self.chartConfig.options.scales.yAxes.push(self.configElements[key].yAxe);
      });
    }
    
    $.each(self.chartConfig.options.scales.yAxes, function(key, value) {
      self.chartConfig.options.scales.yAxes[key].scaleLabel.labelString = self.configElements[self.chartConfig.options.scales.yAxes[key].id].label;
    });
    
    self.chartConfig.data.datasets = [];
    $.each(self.datasets, function(key, value) {
      self.chartConfig.data.datasets.push(self.datasets[key])
    });

    if (!self._chart) {
      self._chart = new Chart(self.$chart[0].getContext('2d'), self.chartConfig);
    } else {
      self._chart.update();
    }

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.startSelection = function(event, ui) {
    self.updateActions = {
      selection: $(this).attr('selection')
      ,datasetToAdd: {}
      ,datasetToRemove: {}
    };
    return;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.itemSelected = function(event, ui) {
    
    var $li = $(ui.selected);
    
    if (self.updateActions.selection === 'asset') {
      self.$lstElements.children('.ui-selected').each(function(id, element) {
        
        var $element = $(element);
        var key = [$li.html(), $li.attr('type'), $element.attr('element')]

        if (self.config[key[1]].elements[key[2]]) {

          key = key.join('|');

          if (!self.datasets[key]) {
            if (!self.updateActions.datasetToAdd[key]) { self.updateActions.datasetToAdd[key] = true; }
          }

        }

      });
    }
    
    if (self.updateActions.selection === 'element') {
      self.$lstAssets.children('.ui-selected').each(function(id, asset) {

        var $asset = $(asset);
        var key = [$asset.html(), $asset.attr('type'), $li.attr('element')];

        if (self.config[key[1]].elements[key[2]]) {

          key = key.join('|');

          if (!self.datasets[key]) {
            if (!self.updateActions.datasetToAdd[key]) { self.updateActions.datasetToAdd[key] = true; }
          }

        }

      });
    }

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.itemUnselected = function(event, ui) {

    var $li = $(ui.unselected);
    
    if (self.updateActions.selection === 'asset') {
      self.$lstElements.children('.ui-selected').each(function(id, element) {
        
        var $element = $(element);
        var key = [$li.html(), $li.attr('type'), $element.attr('element')].join('|');

        if (self.datasets[key]) {
          if (!self.updateActions.datasetToRemove[key]) { self.updateActions.datasetToRemove[key] = true; }
        }

      });
    }
    
    if (self.updateActions.selection === 'element') {
      self.$lstAssets.children('.ui-selected').each(function(id, asset) {

        var $asset = $(asset);
        var key = [$asset.html(), $asset.attr('type'), $li.attr('element')].join('|');

        if (self.datasets[key]) {
          if (!self.updateActions.datasetToRemove[key]) { self.updateActions.datasetToRemove[key] = true; }
        }

      });
    }

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.stopSelection = function(event, ui) {

    $.each(self.updateActions.datasetToRemove, function (key, value) {
      delete self.datasets[key];
    });

    var req = {};
    var prev = null;

    $.each(self.updateActions.datasetToAdd, function (key, value) {
      
      prev = key;
      key = key.split('|');

      req[prev] = { Method: 'GET', Resource: self.genStreamUrl(key[1], key[0], key[2]) + 'recorded?starttime=t-30mo&endtime=t&interval=1w&selectedfields=items.value;items.timestamp' }
      
    });

    if (prev) {

      kApp.pi.piBatchQuery(req, function(data) {
        
        if (kApp.params.debug) {
          console.log("load stream");
          console.log(data);
        }

        $.each(self.updateActions.datasetToAdd, function (key, value) {
          self.configElements[key.split('|')[2]].parseData(key, data[key]);
        });

        self.initChart();

      });

    } else {
      self.initChart();
    }

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.loadDataset = function(key, data) {
    
    var k = key.split('|');
    var dataset = jQuery.extend(true, {}, self.configElements[k[2]].dataset);
    dataset.label = k[0]; // + ' [' + self.configElements[k[2]].label + ']';
    kApp.pi.parseBatchResult(data, 'Unable to load ' + k[2] + ' for ' + k[0], function(item) {
      dataset.data.push({x: moment(item.Timestamp), y: item.Value });
    });
    self.datasets[key] = dataset;
    return;
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.genStreamUrl = function(assetType, assetName, element) {
    return 'https://bkztkdsas31.bdom.ad.corp/piwebapi/streams/P1AbE' + window.btoa(self.config[assetType].path + (assetName ? '\\' + assetName: '') + self.config[assetType].elements[element]).replace(/=/gi, '') + '/';
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.genAssetElementsUrl = function(assetType, assetName) {
    return 'https://bkztkdsas31.bdom.ad.corp/piwebapi/elements/P1Em' + window.btoa(self.config[assetType].path + (assetName ? '\\' + assetName: '')).replace(/=/gi, '') + '/elements';
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.config = {
    tuz: {
      path: 'BKZTKDSAS32\\DEM\\TUZ'
      ,templateName: 'TUZ'
      ,children: ['prline', 'vrline']
      ,elements: {
        ph: '|PH'
        ,u: '|U'
        ,fr: '|PR'
        ,ku: '|KU'
        ,frsum: '|PR|SUMMATOR'
      }
    }
    ,block: {
      path: 'BKZTKDSAS32\\DEM\\BLOCKS'
      ,templateName: 'BLOCK'
      ,children: ['cell', 'vrline_b', 'acline']
      ,elements: {
        ph: '|PH'
        ,u: '|U'
        ,fr: '|PR'
        ,ku: '|KU'
        ,frsum: '|PR|SUMMATOR'
      }
    }
    ,cell: {
      path: 'BKZTKDSAS32\\DEM\\CELLS'
      ,templateName: 'CELL'
      ,children: ['producer', 'injector']
      ,elements: {
        ph: '|PH'
        ,u: '|U'
        ,fr: '|PR'
        ,ku: '|KU'
      }
    }
    ,acline: {
      path: 'BKZTKDSAS32\\DEM\\ACID_LINES'
      ,templateName: 'ACID_LINE'
      ,children: []
      ,elements: {}
    }
    ,prline: {
      path: 'BKZTKDSAS32\\DEM\\PR_LINES'
      ,templateName: 'PR_LINE'
      ,children: ['producer']
      ,elements: {}
    }
    ,vrline: {
      path: 'BKZTKDSAS32\\DEM\\VR_LINES'
      ,templateName: 'VR_LINE'
      ,children: ['injector', 'injectorc']
      ,elements: {
        fr: '|VR'
        ,frsum: '|VR|SUMMATOR'
      }
    }
    ,vrline_b: {
      path: 'BKZTKDSAS32\\DEM\\VR_LINES'
      ,templateName: 'VR_LINE'
      ,children: []
      ,elements: {
        fr: '|VR'
        ,frsum: '|VR|SUMMATOR'
      }
    }
    ,producer: {
      path: 'BKZTKDSAS32\\DEM\\PRODUCERS'
      ,templateName: 'PRODUCER'
      ,children: []
      ,elements: {
        ph: '|PH'
        ,u: '|U'
        ,fr: '|PR'
        ,ku: '|KU'
        ,frsum: '|PR|SUMMATOR'
      }
    }
    ,injector: {
      path: 'BKZTKDSAS32\\DEM\\INJECTORS'
      ,templateName: 'INJECTOR'
      ,children: []
      ,elements: {
        fr: '|VR'
        ,frsum: '|VR|SUMMATOR'
      }
    }
    ,cinjector: {
      path: 'BKZTKDSAS32\\DEM\\INJECTORS'
      ,templateName: 'CONNECTED_INJECTOR'
      ,children: []
      ,elements: {
        fr: '|VR'
      }
    }
    ,injectorc: {
      path: 'BKZTKDSAS32\\DEM\\INJECTOR_CONNECTIONS'
      ,templateName: 'INJECTOR_CONNECTION'
      ,children: []
      ,elements: {
        fr: '|VR'
        ,frsum: '|VR|SUMMATOR'
      }
    }
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  self.configElements = {
    ph: {
      label: 'pH'
      ,yAxe: { id: 'ph', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 7 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'ph', data: [], borderColor: 'lightskyblue', borderWidth: 2, fill: false }
      ,parseData: self.loadDataset
    }
    ,u: {
      label: 'U (mg/L)'
      ,yAxe: { id: 'u', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 100 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'u', data: [], borderColor: 'purple', borderWidth: 2, fill: false }
      ,parseData: self.loadDataset
    }
    ,fr: {
      label: 'Flowrate (m3/h)'
      ,yAxe: { id: 'fr', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 16 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'fr', data: [], borderColor: 'lightblue', borderWidth: 2, fill: false }
      ,parseData: self.loadDataset
    }
    ,ku: {
      label: 'KU (kg/d)'
      ,yAxe: { id: 'ku', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 100 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'ku', data: [], borderColor: 'brown', borderWidth: 2, fill: false }
      ,parseData: self.loadDataset
    }
    ,frsum: {
      label: 'Flowrate summator (m3)'
      ,yAxe: { id: 'frsum', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 10000 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'frsum', data: [], backgroundColor: 'azureblue', borderWidth: 0, fill: false }
      ,parseData: self.loadDataset
    }
  };

  return self;

})();