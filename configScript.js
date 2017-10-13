$(document).ready(function(){  
    $('head').append('<script src="https://rawgit.com/eligrey/FileSaver.js/master/FileSaver.js"></script>');  

    var headers = $('h1').eq(1).nextUntil($('h1').eq(5),'h3');
    $.each(headers, function(index, value){
        var header = headers.eq(index);
        var name = getName(header);
        var defaultValues = getDefaults(header);
        var possibleValues = getPossibleValues(header);

        header.after(getText(name, possibleValues, defaultValues[1] != undefined));
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

    $('#applyFile').click(function(){
        var file = $('#fileInput')[0].files[0];
        var fr = new FileReader();
        fr.onload = function(event) {
            parseText(event.target.result);
        };
        fr.readAsText(file);
    });

});

function getName(header){
    return header.nextUntil('h3','table').eq(0).find('tbody').first('tr').first('td').find('code').text();
}

function getDefaults(header){
    return header.nextUntil('h3','table').eq(0).find('tbody').first('tr').find('td').eq(2).text().split(':');
}

function getPossibleValues(header){
    var values=[];
    var possibleValues = header.nextUntil('h3','table').eq(1).find('tbody').find('tr');
    $.each(possibleValues, function(index, value){
        values.push(possibleValues.eq(index).find('td').first().text());
    });
    return values;
}

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
    <div id="resultOptions">
        <div id="resultButton">
            Get Results
        </div>
        <div>
            <input id="fileInput" type="file" class="x-hidden-focus"/>
            <button id="applyFile">Apply</button>
        </div>
    </div>
    `
    $('body').first().prepend(button);
    $('#resultOptions').css({
        'position':'fixed', 
        'top': '0', 
        'right':'0', 
        'border':'3px solid red',
        'font-size':'40px',
        'background-color':'white',
        'padding':'5px',
        'z-index':'1'
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
        var header = headers.eq(index);
        var name = getName(header);
        var defaultSettings = getDefaults(header);
        var resultValue = $('input[name="' + name +'"]:checked').val();
        var resultLevel = $('input[name="' + name +'-level"]:checked').val();

        if(defaultSettings[0] != resultValue || defaultSettings[1] != resultLevel){

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

            if(name == 'csharp_new_line_before_open_brace' && resultValue == 'select'){
                var boxValues = "";
                var checkedValues = $('input[name="csharp_new_line_before_open_brace-select"]:checked');
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
        }
    });

    return result;
}

function parseText(text){
    var lines = text.split('\n');
    $.each(lines, function(index, value){
        value = value.trim();
        if(!value.startsWith('//') && value.length !=0){
            var parts = value.split("=");
            var values = parts[1].split(":");
            $('input[name="' + parts[0] +'"][value="' + values[0] + '"]').prop('checked', true);

            if(values[1] != undefined){
                $('input[name="' + parts[0] +'-level"][value="' + values[1] + '"]').prop('checked', true);
            }
        }
    });
}