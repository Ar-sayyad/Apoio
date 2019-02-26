app.controller("summaryController", ['$scope', function ($scope) {
    $scope.pagename = "Home";
    $scope.divname1 = "Dashboard and Maps";
    $scope.divname2 = "Data Inputs";
    $scope.setMaster = function(section) {
        $scope.selected = section;
    }
    $scope.isSelected = function(section) {        
         return $scope.selected === section;        
     }    
 }]);