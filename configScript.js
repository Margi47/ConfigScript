$(document).ready(function(){
    var headers = $('h3').slice(0,28);
    $.each(headers, function(index, value){
        var firstRow= headers.eq(index).next().find('tbody').first('tr');

        var name = firstRow.first('td').find('code').text();
        var values = firstRow.find('td').eq(2).text().split(':');

        $('h3').eq(index).after(getText(name));

        setDefaults(name, values);

        printResults(name);
    })
});

function getText(name){
var text=` 
 <label>Value</label>
 <div id=`+ name +`>
    <input type="radio" name="` + name + `" value="true"/>True
    <input type="radio" name="` + name + `" value="false"/>False
 </div>

 <label>Severity</label>
 <div id=`+ name +`-level>
    <input type="radio" name="` + name + `-level" value="none"/>None
    <input type="radio" name="` + name + `-level" value="suggestion"/>Suggestion
    <input type="radio" name="` + name + `-level" value="warning"/>Warning
    <input type="radio" name="` + name + `-level" value="error"/>Error
 </div>
 `
 return text;
}

function setDefaults(name, values){
        $('input[name="' + name +'"][value="' + values[0] + '"]').prop('checked', true);
        $('input[name="' + name +'-level"][value="' + values[1] + '"]').prop('checked', true);
}

function printResults(name){
        var resultValue = $('input[name="' + name +'"]:checked').val();
        var resultLevel = $('input[name="' + name +'-level"]:checked').val();
        console.log(name + '=' + resultValue +':' + resultLevel);
}