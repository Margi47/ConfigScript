$(document).ready(function(){  
    $('head').append('<script src="https://rawgit.com/eligrey/FileSaver.js/master/FileSaver.js"></script>');  

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

    $('input[name="csharp_new_line_before_open_brace"]').change(function(){
        if ($(this).val() == 'select') {
            var boxes = addCheckboxOptions($(this).parent().next().next().find('tbody').find('tr').first().find('td').first().text());
            $(this).parent().append(boxes);
        }
        else{
            $('#selectBoxes').remove();
        }
    });
       
    $('#resultButton').click(function(){
        var text= getResults();
        var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "config.txt");
    });
});

function getText(name, values, hasLevel){
    var options ="";
    $.each(values, function(index, value){
        if(name == "csharp_new_line_before_open_brace" && index == 0){
            options += '<input type="radio" name="' + name + '" value="select"/>select';
        }
        else{
            options += '<input type="radio" name="' + name + '" value="' + value.toLowerCase() + '"/>' + value;
        }
    });

    if(name == "csharp_space_between_parentheses"){
        options += '<input type="radio" name="' + name + '" value="false"/>False';
    }

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

function setDefaults(name, values){
    $('input[name="' + name +'"][value="' + values[0] + '"]').prop('checked', true);

    if(values[1] != undefined){
        $('input[name="' + name +'-level"][value="' + values[1] + '"]').prop('checked', true);
    }
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
        'padding':'5px',
        'z-index':'2'
    });
}

function addCheckboxOptions(values){
    var text = "";
    $.each(values.slice(0, values.indexOf(".")).split(', '), function(index, value) {
        text += '<input type="checkbox" name="csharp_new_line_before_open_brace-select" value="'+ value +'">'+ value + '<br>';
    });
    return '<div id="selectBoxes"><br>' + text + '</div>';    
}

function getResults(){
    var result = "";
    var previousMainHeader = "";
    var previousHeader = "";
    var headers = $('h1').eq(1).nextUntil($('h1').eq(5),'h3');
    $.each(headers, function(index, value){
        var mainHeader = headers.eq(index).prevAll('h1').first().text();
        if(previousMainHeader != mainHeader){
            result += '\r\n//' + mainHeader;
            previousMainHeader = mainHeader;
        }

        var header = headers.eq(index).prevAll('h2').first().text();
        if(previousHeader != header){
            result += '\r\n//' + header + '\r\n';
            previousHeader = header;
        }

        var name = headers.eq(index).nextUntil('h3','table').first().find('tbody').first('tr').first('td').find('code').text();
          
        var resultValue = $('input[name="' + name +'"]:checked').val();
        var resultLevel = $('input[name="' + name +'-level"]:checked').val();

        if(name == 'csharp_new_line_before_open_brace' && resultValue == 'select'){
            var boxValues = "";
            var checkedValues = $('input[name="csharp_new_line_before_open_brace-select"]:checked');
            console.log(checkedValues);
            if(checkedValues.length == 0){
                resultValue = 'all';
            }
            else{
                $.each(checkedValues, function(index,value){
                    boxValues += checkedValues.eq(index).val()+',';
                });
                resultValue = boxValues.slice(0, boxValues.length-1);
            }
        }

        var resultLine = name + '=' + resultValue;
        if(resultLevel != undefined){
            resultLine += ':' + resultLevel;
        }
        result += resultLine + '\r\n';
    });

    return result;
}