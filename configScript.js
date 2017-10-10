$(document).ready(function(){
    $.each($('h3'), function(index, value){
        var name = ($('h3').eq(index).next().find('tbody').first('tr').first('td').find('code').text());
        console.log(name);
        $('h3').eq(index).after(getText(name));
    })
});

function getText(name){
var text=`<label>Value</label>
 <input type="radio" name="` + name + `" value="true" checked>True</input>
 <input type="radio" name="` + name + `" value="false">False</input>`

 return text;
}
