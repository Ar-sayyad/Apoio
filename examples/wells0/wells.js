(function() {

  kApp.wells = {};
  kApp.wells.$lstParents = $('<select />');
  kApp.wells.$lstAssets = $('<ul />');
  kApp.wells.$lstElements = $('<ul />');
  kApp.wells.$chart = $('<canvas />');
  kApp.wells._chart = null;
  
  kApp.wells.chartConfig = {
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

  kApp.wells.datasets = {};
  
  kApp.wells.updateActions = {};

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.initElementList = function() {
    
    if (kApp.wells.$lstElements.selectable('instance')) kApp.wells.$lstElements.selectable('destroy');

    kApp.wells.$lstElements.empty();

    kApp.wells.$lstElements.attr('selection', 'element');

    $.each(kApp.wells.configElements, function (key, value) {
      kApp.wells.$lstElements.append($('<li />').attr('element', key).html(kApp.wells.configElements[key].label));
    });

    kApp.wells.$lstElements.children().sort(function(a, b) {
      return $(a).html() > $(b).html();
    }).appendTo(kApp.wells.$lstElements);

    kApp.wells.$lstElements.selectable({
      start: kApp.wells.startSelection
      ,selected: kApp.wells.itemSelected
      ,unselected: kApp.wells.itemUnselected
      ,stop: kApp.wells.stopSelection
    });
    kApp.wells.$lstElements.disableSelection();

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.loadParentList = function(template, asset, callback) {

    var req = {};
    req[template] = { Method: 'GET', Resource: kApp.wells.genAssetElementsUrl(template, '') + '?templateName=' + kApp.wells.config[template].templateName + '&maxcount=50000&selectedFields=items.name;items.webid;items.links.self' };

    kApp.pi.piBatchQuery(req, function(data){

      if (kApp.params.debug) {
        console.log('load parent list');
        console.log(data);
      }

      kApp.pi.parseBatchResult(data[template], 'Failed to load ' + kApp.wells.config[template].templateName, function(item) {
        kApp.wells.$lstParents.append($('<option />').attr('webid', item.WebId).html(item.Name));
      });

      if (asset) {
        kApp.wells.$lstParents.val(asset);
      } else {
        kApp.setParam('asset', kApp.wells.$lstParents.val(), true);
      }
      
      kApp.wells.$lstAssets.attr('selection', 'asset');

      kApp.wells.$lstAssets.append($('<li />').attr('type', template).addClass('child0').html(asset));
      kApp.wells.loadAssets(template, asset, kApp.wells.$lstAssets, 'appendTo', 1);
    
    });

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.loadAssets = function(template, asset, $content, action, iteration) {

    if (kApp.wells.$lstAssets.selectable('instance')) kApp.wells.$lstAssets.selectable('destroy');

    var req = {};
    kApp.wells.config[template].children.forEach(child => {
      req[child] = { Method: 'GET', Resource: kApp.wells.genAssetElementsUrl(template, asset) + '?templateName=' + kApp.wells.config[child].templateName + '&maxcount=50000&selectedFields=items.name;items.webid;items.links.self' };
    });

    kApp.pi.piBatchQuery(req, function(data){

      if (kApp.params.debug) {
        console.log('load assets');
        console.log(data);
      }

      kApp.wells.config[template].children.forEach(child => {
        
        kApp.pi.parseBatchResult(data[child], 'Failed to load ' + kApp.wells.config[child].templateName, function(item) {
          var $li = $('<li />').attr('type', child).addClass('child' + iteration).html(item.Name);
          kApp.wells.config[child].children.forEach(child2 => { kApp.wells.loadAssets(child, item.Name, $li, 'insertAfter', iteration + 1); });
          $li[action]($content);
        });
        
      });
      
      kApp.wells.$lstAssets.selectable({
        start: kApp.wells.startSelection
        ,selected: kApp.wells.itemSelected
        ,unselected: kApp.wells.itemUnselected
        ,stop: kApp.wells.stopSelection
      });
      kApp.wells.$lstAssets.disableSelection();

    });

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.initChart = function() {

    if (kApp.wells.chartConfig.options.scales.yAxes.length === 0) {
      $.each(kApp.wells.configElements, function(key, value) {
        kApp.wells.chartConfig.options.scales.yAxes.push(kApp.wells.configElements[key].yAxe);
      });
    }

    $.each(kApp.wells.chartConfig.options.scales.yAxes, function(key, value) {
      kApp.wells.chartConfig.options.scales.yAxes[key].scaleLabel.labelString = kApp.wells.configElements[kApp.wells.chartConfig.options.scales.yAxes[key].id].label;
    });

    kApp.wells.chartConfig.data.datasets = [];
    $.each(kApp.wells.datasets, function(key, value) {
      kApp.wells.chartConfig.data.datasets.push(kApp.wells.datasets[key])
    });

    if (!kApp.wells._chart) {
      kApp.wells._chart = new Chart(kApp.wells.$chart[0].getContext('2d'), kApp.wells.chartConfig);
    } else {
      kApp.wells._chart.update();
    }

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.startSelection = function(event, ui) {
    kApp.wells.updateActions = {
      selection: $(this).attr('selection')
      ,datasetToAdd: {}
      ,datasetToRemove: {}
    };
    return;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.itemSelected = function(event, ui) {
    
    var $li = $(ui.selected);
    
    if (kApp.wells.updateActions.selection === 'asset') {
      kApp.wells.$lstElements.children('.ui-selected').each(function(id, element) {
        
        var $element = $(element);
        var key = [$li.html(), $li.attr('type'), $element.attr('element')]

        if (kApp.wells.config[key[1]].elements[key[2]]) {

          key = key.join('|');

          if (!kApp.wells.datasets[key]) {
            if (!kApp.wells.updateActions.datasetToAdd[key]) { kApp.wells.updateActions.datasetToAdd[key] = true; }
          }

        }

      });
    }
    
    if (kApp.wells.updateActions.selection === 'element') {
      kApp.wells.$lstAssets.children('.ui-selected').each(function(id, asset) {

        var $asset = $(asset);
        var key = [$asset.html(), $asset.attr('type'), $li.attr('element')];

        if (kApp.wells.config[key[1]].elements[key[2]]) {

          key = key.join('|');

          if (!kApp.wells.datasets[key]) {
            if (!kApp.wells.updateActions.datasetToAdd[key]) { kApp.wells.updateActions.datasetToAdd[key] = true; }
          }

        }

      });
    }

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.itemUnselected = function(event, ui) {

    var $li = $(ui.unselected);
    
    if (kApp.wells.updateActions.selection === 'asset') {
      kApp.wells.$lstElements.children('.ui-selected').each(function(id, element) {
        
        var $element = $(element);
        var key = [$li.html(), $li.attr('type'), $element.attr('element')].join('|');

        if (kApp.wells.datasets[key]) {
          if (!kApp.wells.updateActions.datasetToRemove[key]) { kApp.wells.updateActions.datasetToRemove[key] = true; }
        }

      });
    }
    
    if (kApp.wells.updateActions.selection === 'element') {
      kApp.wells.$lstAssets.children('.ui-selected').each(function(id, asset) {

        var $asset = $(asset);
        var key = [$asset.html(), $asset.attr('type'), $li.attr('element')].join('|');

        if (kApp.wells.datasets[key]) {
          if (!kApp.wells.updateActions.datasetToRemove[key]) { kApp.wells.updateActions.datasetToRemove[key] = true; }
        }

      });
    }

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.stopSelection = function(event, ui) {

    $.each(kApp.wells.updateActions.datasetToRemove, function (key, value) {
      delete kApp.wells.datasets[key];
    });

    var req = {};
    var prev = null;

    $.each(kApp.wells.updateActions.datasetToAdd, function (key, value) {
      
      prev = key;
      key = key.split('|');

      req[prev] = { Method: 'GET', Resource: kApp.wells.genStreamUrl(key[1], key[0], key[2]) + 'interpolated?starttime=t-30mo&endtime=t&interval=1w&selectedfields=items.value;items.timestamp' }
      
    });

    if (prev) {

      kApp.pi.piBatchQuery(req, function(data) {
        
        if (kApp.params.debug) {
          console.log("load stream");
          console.log(data);
        }

        $.each(kApp.wells.updateActions.datasetToAdd, function (key, value) {
          kApp.wells.configElements[key.split('|')[2]].parseData(key, data[key]);
        });

        kApp.wells.initChart();

      });

    } else {
      kApp.wells.initChart();
    }

    return;

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.loadDataset = function(key, data) {
    
    var k = key.split('|');
    var dataset = jQuery.extend(true, {}, kApp.wells.configElements[k[2]].dataset);
    dataset.label = k[0]; // + ' [' + kApp.wells.configElements[k[2]].label + ']';
    kApp.pi.parseBatchResult(data, 'Unable to load ' + k[2] + ' for ' + k[0], function(item) {
      dataset.data.push({x: moment(item.Timestamp), y: item.Value });
    });
    kApp.wells.datasets[key] = dataset;
    return;
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.genStreamUrl = function(assetType, assetName, element) {
    return 'https://bkztkdsas31.bdom.ad.corp/piwebapi/streams/P1AbE' + window.btoa(kApp.wells.config[assetType].path + (assetName ? '\\' + assetName: '') + kApp.wells.config[assetType].elements[element]).replace(/=/gi, '') + '/';
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.genAssetElementsUrl = function(assetType, assetName) {
    return 'https://bkztkdsas31.bdom.ad.corp/piwebapi/elements/P1Em' + window.btoa(kApp.wells.config[assetType].path + (assetName ? '\\' + assetName: '')).replace(/=/gi, '') + '/elements';
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  kApp.wells.config = {
    tuz: {
      path: 'BKZTKDSAS32\\DEM\\TUZ'
      ,templateName: 'TUZ'
      ,children: ['prline', 'vrline']
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
  kApp.wells.configElements = {
    ph: {
      label: 'pH'
      ,yAxe: { id: 'ph', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 7 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'ph', data: [], borderColor: 'lightskyblue', borderWidth: 2, fill: false }
      ,parseData: kApp.wells.loadDataset
    }
    ,u: {
      label: 'U (mg/L)'
      ,yAxe: { id: 'u', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 100 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'u', data: [], borderColor: 'purple', borderWidth: 2, fill: false }
      ,parseData: kApp.wells.loadDataset
    }
    ,fr: {
      label: 'Flowrate (m3/h)'
      ,yAxe: { id: 'fr', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 16 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'fr', data: [], borderColor: 'lightblue', borderWidth: 2, fill: false }
      ,parseData: kApp.wells.loadDataset
    }
    ,ku: {
      label: 'KU (kg/d)'
      ,yAxe: { id: 'ku', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 100 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'ku', data: [], borderColor: 'brown', borderWidth: 2, fill: false }
      ,parseData: kApp.wells.loadDataset
    }
    ,frsum: {
      label: 'Flowrate summator (m3)'
      ,yAxe: { id: 'frsum', position: 'left', scaleLabel: { display: true, labelString: '' }, ticks: { beginAtZero: true, suggestedMax: 10000 }, gridLines: { display: false } }
      ,dataset: { type: 'line', pointRadius:2, label: '', yAxisID: 'frsum', data: [], backgroundColor: 'azureblue', borderWidth: 0, fill: false }
      ,parseData: kApp.wells.loadDataset
    }
  };

})();
