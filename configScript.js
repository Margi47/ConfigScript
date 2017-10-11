$(document).ready(function(){    
    var headers = $('h1').eq(1).nextUntil($('h1').eq(5),'h3');
    $.each(headers, function(index, value){
        var firstRow= headers.eq(index).next().find('tbody').first('tr');
        var name = firstRow.first('td').find('code').text();
        var defaultValues = firstRow.find('td').eq(2).text().split(':');

        var values=[];
        var secondRows = headers.eq(index).nextUntil('h3','table').eq(1).find('tbody').find('tr');
        $.each(secondRows, function(index, value){
            values.push(secondRows.eq(index).find('td').first().text());
        })

        headers.eq(index).after(getText(name, values, defaultValues[1]!=undefined));

        setDefaults(name, defaultValues);
    })

    createButton();
    $('#resultButton').click(function(){
        $.each(headers, function(index, value){
            var name = headers.eq(index).nextUntil('h3','table').first().find('tbody').first('tr').first('td').find('code').text();
            printResults(name);
        });
    });
});

function getText(name, values, hasLevel){
    var options ="";
    $.each(values, function(index, value){
        options += '<input type="radio" name="' + name + '" value="' + value.toLowerCase() + '"/>' + value;
    });

    var text ='<label>Value</label><div>' + options + '</div>';
    var levelText =`
        <label>Severity</label>
        <div>
            <input type="radio" name="` + name + `-level" value="none"/>None
            <input type="radio" name="` + name + `-level" value="suggestion"/>Suggestion
            <input type="radio" name="` + name + `-level" value="warning"/>Warning
            <input type="radio" name="` + name + `-level" value="error"/>Error
        </div>`;

    if(hasLevel){
        text += levelText;
    }
    return text;
}

function createButton(){
    var button=`
    <div id="resultButton">
        Get Results
    </div>
    `

    $('body').first().prepend(button);
    $('#resultButton').css({
        'position':'fixed', 
        'top': '0', 
        'right':'0', 
        'border':'3px solid red',
        'font-size':'40px',
        'background-color':'white',
        'padding':'5px'
    });
}

function setDefaults(name, values){
    $('input[name="' + name +'"][value="' + values[0] + '"]').prop('checked', true);

    if(values[1] != undefined){
        $('input[name="' + name +'-level"][value="' + values[1] + '"]').prop('checked', true);
    }
}

function printResults(name){
    var resultValue = $('input[name="' + name +'"]:checked').val();
    var resultLevel = $('input[name="' + name +'-level"]:checked').val();
    console.log(name + '=' + resultValue +':' + resultLevel);
}