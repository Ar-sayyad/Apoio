app.controller('babaController', function($scope) {
    $scope.pagename = "BABA";
   // CreateTableFromJSON();

var baseServiceUrl = "https://10.101.71.181:4440/piwebapi/"; /***PI WEBAPI URL***/
var user = "cmdc";/***USERNAME***/
var pass = "system@01";/***PASSWORD***/
var afServerName = "BLDB";/***AF SERVER NAME***/
var afDatabaseName = "BALCOPOWER";//Aasif_Development//"Mayhar";/***DATABASE NAME***/
var rankingElements = [];
 var batch = {
            "database": {
                "Method": "GET",
                "Resource": baseServiceUrl + "assetdatabases?path=\\\\" + afServerName + "\\" + afDatabaseName + "\\VEDANTA\\BALCO\\WebPortal\\DASHBOARD\\MonthlyReceipt\\CoalReceipt&selectedFields=WebId;Links.Elements"
            },
            "elements": {
                "Method": "GET",
                "Resource": "{0}?selectedFields=Items.Name;Items.Path;&searchFullHierarchy=true",
                "ParentIds": ["database"],
                "Parameters": ["$.database.Content.Links.Elements"]
            },
            "attributes": {
                "Method": "GET",
                "RequestTemplate": {
                    "Resource": baseServiceUrl + "attributes/multiple?selectedFields=Items.Object.Name;Items.Object.Path;Items.Object.WebId"
                },
                "ParentIds": ["elements"],
                "Parameters": ["$.elements.Content.Items[*].Path"]
            },
            "values": {
                "Method": "GET",
                "RequestTemplate": {
                    "Resource": baseServiceUrl + "streams/{0}/value"
                },
                "ParentIds": ["attributes"],
                "Parameters": ["$.attributes.Content.Items[*].Content.Items[*].Object.WebId"]
            }
        };
        var batchStr = JSON.stringify(batch, null, 2)
        var batchResult = processJsonContent(baseServiceUrl + "batch", 'POST', batchStr);
        $.when(batchResult).fail(function () {
            warningmsg("Cannot Launch Batch!!!");
        });
        
         $.when(batchResult).done(function () {
        var batchResultItems = (batchResult.responseJSON.attributes.Content.Items);
        let valuesID = 0;
        $.each(batchResultItems, function (elementID) {
            var attrItems = batchResultItems[elementID].Content.Items;
            var elementName = batchResult.responseJSON.elements.Content.Items[elementID].Name;
            var elementItems = [];
            elementItems[0] = elementName;
            attrItems.forEach(function (attr, attrID) {
                let attrValue = "-"
                if (attr != undefined && attr.Object != undefined) {
                    attrName = attr.Object.Name;
                    const getNestedObject = (nestedObj, pathArr) => {
                        return pathArr.reduce((obj, key) =>
                            (obj && obj[key] != undefined) ? obj[key] : undefined, nestedObj);
                    }
                    if (batchResult.responseJSON.values.Content.Items != undefined &&
                        (batchResult.responseJSON.values.Content.Status == undefined || batchResult.responseJSON.values.Content.Status < 400) &&
                        batchResult.responseJSON.values.Content.Items[valuesID].Status == 200) {
                        var attrV = getNestedObject(batchResult.responseJSON.values,
                            ['Content', 'Items', valuesID, 'Content', 'Value'])
                        if (attrV !== "" && !isNaN(attrV)) {
                            attrValue = (Math.round((attrV) * 100) / 100);
                        }
                    }
                }
                elementItems[attrID + 1] = attrValue;
                valuesID++
            });
            rankingElements[elementID] = elementItems;
        });
        console.log(rankingElements);
    });
 });
function CreateTableFromJSON() {  
      var Array = {
    "Header": [{
        "Id": 1,
        "Name": "InspectionLot"
    }, {
        "Id": 2,
        "Name": "DateTime"
    }, {
        "Id": 3,
        "Name": "FCK+90"
    }, {
        "Id": 4,
        "Name": "FCPY+212"
    }, {
        "Id": 5,
        "Name": "FCPYIM"
    }, {
        "Id": 6,
        "Name": "FCPYASH"
    }],
    "Item": [
        [{
            "Id": 1,
            "Name": "30000089861"
        }, {
            "Id": 2,
            "Name": "25.02.2019 00:55:00"
        }, {
            "Id": 3,
            "Name": "21"
        }, {
            "Id": 4,
            "Name": "45"
        }, {
            "Id": 5,
            "Name": "15"
        }, {
            "Id": 6,
            "Name": "52"
        }],
        [{
            "Id": 1,
            "Name": "30000089861"
        }, {
            "Id": 2,
            "Name": "25.02.2019 04:55:00"
        }, {
            "Id": 3,
            "Name": "52"
        }, {
            "Id": 4,
            "Name": "13"
        }, {
            "Id": 5,
            "Name": "16"
        }, {
            "Id": 6,
            "Name": "32"
        }],
        [{
            "Id": 1,
            "Name": "30000089861"
        }, {
            "Id": 2,
            "Name": "25.02.2019 08:55:00"
        }, {
            "Id": 3,
            "Name": "66"
        }, {
            "Id": 4,
            "Name": "44"
        }, {
            "Id": 5,
            "Name": "17"
        }, {
            "Id": 6,
            "Name": "15"
        }],
        [{
            "Id": 1,
            "Name": "30000089861"
        }, {
            "Id": 2,
            "Name": "25.02.2019 12:55:00"
        }, {
            "Id": 3,
            "Name": "35"
        }, {
            "Id": 4,
            "Name": "14"
        }, {
            "Id": 5,
            "Name": "18"
        }, {
            "Id": 6,
            "Name": "25"
        }]
    ]
};
var head=[];
var rows=[];
$.each(Array.Header, function (key) {
    head.push({
        title: Array.Header[key].Name
    })
});
   $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['pageLength', 'copy', 'csv', 'excel', 'print'],
        columns: head
    });  

  $.each(Array.Item, function (key) {  
        var arr=[]; 
        for(var i=0;i<Array.Header.length;i++){ 
                arr.push(Array.Item[key][i].Name);
        }     
        rows.push(arr);
  });

 var t = $('#example').DataTable();
   $.each(rows, function (key) {
          t.row.add(rows[key]).draw(!1);
   });
     
}