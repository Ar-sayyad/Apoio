
// Obtained from the UI
let arrayFilterParams = [
    {
        "index" : 1,
        "operator": ">",
        "value" : 100,
        "key" : "U"
    },
    {
        "index" : 1,
        "operator": "<",
        "value" : 1000,
        "key" : "U"
    },
    {
        "index" : 2,
        "operator": ">",
        "value" : 7,
        "key" : "PH"
    }
]

var filteredData = table
    .column( 1 )
    .data()
    .filter( function ( value, index ) {
        array.forEach(arrayFilterParam => {
            if(arrayFilterParam.index === index){
                globalCondition = getValue(value, arrayFilterParam.operator, index) && globalCondition
            }
        });
        return globalCondition ? true : false;
} );

    function getValue() {
        switch (key) {
            case gt:
                value > valueFromFilter
                break;
        
            default:
                break;
        }
        return b        
    }

    