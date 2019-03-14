var baseServiceUrl = "https://10.101.71.181:4440/piwebapi/"; /***PI WEBAPI URL***/
var user = "cmdc";/***USERNAME***/
var pass = "system@01";/***PASSWORD***/
var afServerName = "BLDB";/***AF SERVER NAME***/
var afDatabaseName = "BALCOPOWER";/***DATABASE NAME***/

app.controller('babaController', function($scope) {
    $scope.pagename = "BABA";
   // CreateTableFromJSON();
var rankingElements = [];
 var batch = {
            "database": {
                "Method": "GET",
                "Resource": baseServiceUrl + "elements?path=\\\\" + afServerName + "\\" + afDatabaseName + "\\VEDANTA\\BALCO\\WebPortal\\DASHBOARD\\KPIS\\AuxConsumption\\MonthlyAchievement&selectedFields=WebId;Links.Elements"
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
                    "Resource": baseServiceUrl + "attributes/multiple?selectedFields=Items.Object.Name;Items.Object.Path;Items.Object.WebId&path={0}|color&path={0}|value"
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
        var batchStr = JSON.stringify(batch, null, 2);
        var batchResult = procesJsonContent(baseServiceUrl + "batch", 'POST', batchStr);
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
                if (attr !== undefined && attr.Object !== undefined) {
                    attrName = attr.Object.Name;
                    const getNestedObject = (nestedObj, pathArr) => {
                        return pathArr.reduce((obj, key) =>
                            (obj && obj[key] !== undefined) ? obj[key] : undefined, nestedObj);
                    };
                    if (batchResult.responseJSON.values.Content.Items !== undefined &&
                        (batchResult.responseJSON.values.Content.Status === undefined || batchResult.responseJSON.values.Content.Status < 400) &&
                        batchResult.responseJSON.values.Content.Items[valuesID].Status === 200) {
                        var attrV = getNestedObject(batchResult.responseJSON.values,
                            ['Content', 'Items', valuesID, 'Content', 'Value']);                    
                    }
                }
                elementItems[attrID + 1] = attrV;
                valuesID++;
            });
            rankingElements[elementID] = elementItems;
        });
        console.log(rankingElements);
    });
 });
var enableBasicAuth=true;
var procesJsonContent=function(url,type,data){
    return $.ajax({
        url:encodeURI(url),
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        type:type,
        data:data,
        contentType:"application/json; charset=UTF-8",
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend:function(xhr){
            if(enableBasicAuth){
                xhr.setRequestHeader("Authorization",makBasicAuth(user,pass));
            }
        }
    });
};

var makBasicAuth=function(user,password){
    var tok=user+':'+password;
    var hash=window.btoa(tok);
    return"Basic "+hash;
};