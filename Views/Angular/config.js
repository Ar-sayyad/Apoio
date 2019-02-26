/***CONFIGURATION SETTING***/

var baseServiceUrl = "https://192.168.1.28:1706/piwebapi/"; /***PI WEBAPI URL***/
var user = "Asif";/***USERNAME***/
var pass = "ECG@123";/***PASSWORD***/
var afServerName = "ECG-DEV-SERVER";/***AF SERVER NAME***/
var afDatabaseName = "Aasif_Development";//Aasif_Development//"Mayhar";/***DATABASE NAME***/
var EnumerationSets = "CONNECTED_TO_PLANT";/***ENUMERATION SET NAME***/
var masterTemplateName = "BLOCK";/***MASTER TEMPLATE NAME***/
var templateName = "BLOCK";/***DEFAULT TEMPLATE NAME***/
var newtemplateName = "MAGISTRAL";/***DEFAULT TEMPLATE NAME***/
var catNameGenrate = "asset_design_";/***CATEGORY NAME GENRATION IN CODING NOT REMOVE THIS***/
var trendCat = "masterdashboard_trend";/***TREND DATA CATEGORY NAME***/
var valueCat = "masterdashboard_value";/***CATEGORY FOR VALUE***/
var timestampCat = "masterdashboard_timestamp";/***CATEGORY FOR TIMESTAMP***/
var filterCategoryName = "asset_design";/****CATEGORY NAME FOR FILTER ELEMENT TEMPLATE****/
var allocationAttributeName = "PLANT";/****The Plant Attributes Name for save the allocation page data***/
var iframeConfigUrl = "http://www.google.com"; //IFRAME URL 
var rankingParent = "Zones"; /**** Ranking Parent Name ****/
var defaultRankingTemplate = "ZONE";/****Default Zone for Ranking Page****/
var rankingParameters = [
    { name:"U",  sid: 1, top: "desc", bottom: "asc" },
    { name:"PH", sid: 2, top: "asc", bottom: "desc" },
    { name:"KU", sid: 3, top: "desc", bottom: "asc" },
    { name:"PR", sid: 4, top: "desc", bottom: "asc" },
    { name:"VR", sid: 5, top: "desc", bottom: "asc" }
];
var operators = [
    { operator:"="},
    { operator:">"},
    { operator:"<"},
    { operator:">="},
    { operator:"<="}       
];
var eventsColorsData = [
    {
        "name":"BALANCE","color":"#058DC7","min":0,"max":200 
    },
    {
        "name":"U","color":"#50B432","min":0,"max":130 
    },
    { 
        "name":"KU","color":"#ED561B","min":0,"max":170 
    },
    { 
        "name":"PH","color":"#DDDF00", "min":0, "max":200 
    },
    { 
        "name":"PR","color":"#24CBE5",  "min":0, "max":210
    },
    {
        "name":"VR","color":"#64E572","min":0,"max":220 
    },
    { 
        "name":"ACIDIFICATION","color":"#FF9655","min":0,"max":200
    },
    { 
        "name":"PLANT","color":"#FFF263","min":0,"max":200
    },
    { 
        "name":"STATUS","color":"#6AF9C4","min":0,"max":200
    }
]; ///CHART ELEMENT ATTRIBUTES JSON ARRAY KEEP MIN=0 AND ALL ATTRIBUTES SHOULD IN PROPER FORMAT

var EFData = [
    {
        "efName":"EFT1","color":"#058DC7"
    },
    {
        "efName":"EFT2","color":"#50B432"
    },
    { 
        "efName":"EFT3","color":"#ED561B"
    },
    { 
        "efName":"EFT4","color":"#DDDF00"
    },
    { 
        "efName":"EFT5","color":"#24CBE5"
    }
]; ///EVENT FRAME DATA JSON ARRAY 
var defaultColor="#ccc";
var minLTclr="#FF0000";
var btwnLTHTclr="#2196F3";
var maxHTclr="#1ce74a";
var tableAttrColors = [
    {
        "name":"U","LT":20,"HT":50
    },
    {
        "name":"KU","LT":50,"HT":120
    },
    { 
        "name":"PH","LT":1.8,"HT":2.1 
    },   
    { 
        "name":"PR","LT":50, "HT":130
    },
    {
        "name":"VR","LT":10,"HT":130 
    },
    { 
        "name":"BALANCE","LT":10,"HT":200
    }
]; ///TABLE ELEMENT ATTRIBUTES 

var enableBasicAuth=true
/***CONFIGURATION SETTING***/
