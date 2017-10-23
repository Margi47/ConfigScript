$(document).ready(function(){  
    $('head').append('<script src="https://rawgit.com/eligrey/FileSaver.js/master/FileSaver.js"></script>');  

    var headers = $('h2').eq(0).nextUntil($('h2').eq(2),'h4');   
    $.each(headers, function(index, value){
        var header = headers.eq(index);
        var defaultIndex = getIndex(header);
        var rows = header.nextUntil('h4','table').eq(0).find('tbody').find('tr');
        $.each(rows, function(index, value){
            var row = rows.eq(index);       
            var name = getName(row);
            var defaultValues = getDefaults(row, defaultIndex);
            console.log(defaultIndex);
            var possibleValues = getPossibleValues(defaultValues);

            row.find('td').eq(0).append(getOptionsText(name, possibleValues, defaultValues[1] != undefined));
            setDefaults(name, defaultValues);
        })
    })

    createButton();

    $('input[name="csharp_new_line_before_open_brace"]').change(function(){
        if ($(this).val() == 'select') {
            var boxes = getCheckboxOptions($(this).parents('table').next().next().find('tbody').find('tr').eq(0).find('td').eq(0).text());
            
            $(this).parents('div').eq(0).append(boxes);
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

    $('#fileInput').change(function(){
        if(this.value.length != 0){
            $('#applyFileButton').removeAttr("disabled");
        }
        else{
            $('#applyFileButton').attr("disabled", "disabled");
        };    
    });

    $('#applyFileButton').click(function(){
        var file = $('#fileInput')[0].files[0];
        var fr = new FileReader();
        fr.onload = function(event) {
            parseText(event.target.result);
        };
        fr.readAsText(file);
    });

});

function getName(row){
    return row.find('td').eq(0).text();
}

function getIndex(header){
    var i;
    var tableHeaders = header.nextUntil('h4','table').eq(0).find('thead').find('tr').eq(0).find('th');
    $.each(tableHeaders, function(index, value){
        if(tableHeaders.eq(index).text().startsWith('Visual Studio'))
            i = index;    
    });
    return i;
}

function getDefaults(row, index){
    return row.find('td').eq(index).text().split(':');
}

function getPossibleValues(defaultVal){
    var values=[];
    switch(defaultVal[0]){
        case 'true':
        case 'false':
            values.push('true', 'false');
            break;
        case 'all':
            values.push('none', 'all', 'select');
            break;
        case 'no_change':
            values.push('flush_left', 'one_less_than_current', 'no_change');
            break;
    }
    return values;
}

function getOptionsText(name, values, hasLevel){
    var options ="";
    $.each(values, function(index, value){
        options += '<label><input type="radio" name="' + name + '" value="' + value + '"/>' + value + '</label>&nbsp;';
    });

    var text =`
        <div class="editor-config-ex-value">
            <label><strong>Value:</strong></label>&nbsp;` + options + `
        </div>`;

    var levelText =`<br>
    <div class="editor-config-ex-level">
        <label><strong>Severity:</strong></label>&nbsp;
        <label><input type="radio" name="` + name + `-level" value="none"/>None</label>&nbsp;
        <label><input type="radio" name="` + name + `-level" value="suggestion"/>Suggestion</label>&nbsp;
        <label><input type="radio" name="` + name + `-level" value="warning"/>Warning</label>&nbsp;
        <label><input type="radio" name="` + name + `-level" value="error"/>Error</label>&nbsp;
    </div>`;

    if(hasLevel){
        text += levelText;
    }
    return '<div class="editor-config-ex">' + text + '</div>';
}

function getCheckboxOptions(values){
    var text = "";
    $.each(values.slice(0, values.indexOf(".")).split(', '), function(index, value) {
        text += '<input type="checkbox" name="csharp_new_line_before_open_brace-select" value="'+ value +'">'+ value + '<br>';
    });
    return '<div id="selectBoxes"><br>' + text + '</div>';    
}

function setDefaults(name, values){
    $('input[name="' + name +'"][value="' + values[0] + '"]').prop('checked', true);

    if(values[1] != undefined){
        $('input[name="' + name +'-level"][value="' + values[1] + '"]').prop('checked', true);
    }
}

function createButton(){
    var button=`
    <div class="editor-config-ex-results">
        <input type="file" id="fileInput"/>
        <button id="applyFileButton" disabled>Apply</button><br>
        <button id="resultButton" style="width:100%">Get Results</button><br>
    </div>
    `
    $('body').first().prepend(button);
    $('.editor-config-ex-results').css({
            'border-width': '3px',
            'background-color': '#B0C4DE',
            'border-style': 'solid',
            'border-radius': '4px',
            'border-color': '#0724B9',
            'position': 'fixed',
            'padding': '7px',
            'top': '0',
            'right': '0',
            'max-width': '400px',
            'z-index': '999'
    });
}



function getResults(){
    var result = "";
    var previousMainHeader = "";
    var previousMiddleHeader = "";
    var previousHeader = "";
    var headers = $('h2').eq(0).nextUntil($('h2').eq(2),'h4');
    $.each(headers, function(index, value){
        var header = headers.eq(index);
        var defaultIndex = getIndex(header);
        var rows = header.nextUntil('h4','table').eq(0).find('tbody').find('tr');
        $.each(rows, function(index, value){
            var row = rows.eq(index);       
            var nameData = getName(row);
            var name = nameData.slice(0, nameData.indexOf("Value:")).trim();
            var defaultSettings = getDefaults(row, defaultIndex);
            var resultValue = $('input[name="' + name +'"]:checked').val();
            var resultLevel = $('input[name="' + name +'-level"]:checked').val();

            //if(defaultSettings[0] != resultValue || defaultSettings[1] != resultLevel){
                var mainHeader = header.prevAll('h2').eq(0).text();
                if(previousMainHeader != mainHeader){
                    result += '\r\n//' + mainHeader;
                    previousMainHeader = mainHeader;
                }

                var middleHeader = header.prevAll('h3').eq(0).text();
                if(previousMiddleHeader != middleHeader){
                    result += '\r\n//' + middleHeader;
                    previousMiddleHeader = middleHeader;
                }
                
                if(header.text() != previousHeader){
                    result += '\r\n//' + header.text() + '\r\n';
                    previousHeader = header.text();
                }

                if(name == 'csharp_new_line_before_open_brace' && resultValue == 'select'){
                    var boxValues = "";
                    var checkedValues = $('input[name="csharp_new_line_before_open_brace-select"]:checked');
                    if(checkedValues.length == 0){
                        resultValue = 'none';
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
            //}
        });
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