(function() {
    $(document).ready(function(){  
        addExternalScripts();       
        addRadioboxesForOptions();   
        createResultBox();   
    });
    
    function addExternalScripts(){
        $('head').append(`<script src="https://rawgit.com/eligrey/FileSaver.js/master/FileSaver.js"></script> 
            <link rel="stylesheet" href="https://rawgit.com/Margi47/ConfigScript/master/configScript.css">`); 
    }
    
    function addRadioboxesForOptions(){
        var headers = $('h2').eq(0).nextUntil($('h2').eq(2),'h4');   
        $.each(headers, function(index, value){
            var header = headers.eq(index);
            var defaultIndex = getIndex(header);
            var rows = header.nextUntil('h4','table').eq(0).find('tbody tr');
            $.each(rows, function(index, value){              
                var row = rows.eq(index);       
                var name = getName(row);
                var defaultValues = getDefaults(row, defaultIndex);
                var possibleValues = getPossibleValues(defaultValues);
            
                row.find('td').eq(0).append(getOptions(name, possibleValues, defaultValues[1] != undefined));
                setDefaults(name, defaultValues);
            })
        })
        
        addListenerForCheckboxes();
    }
    
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
    
    function getOptions(name, values, hasLevel){
        var options ="";
        $.each(values, function(index, value){
            options += '<label><input type="radio" name="' + name + '" value="' + value + '"/>' + value + '</label>&nbsp;';
        });
    
        var text =`
            <div class="editor-config-ex-value">
                <label>Value:</label>&nbsp;` + options + `
            </div>`;
        
        var levelText =`
        <div class="editor-config-ex-value">
            <label>Severity:</label>&nbsp;
            <label><input type="radio" name="` + name + `-level" value="none"/>none</label>&nbsp;
            <label><input type="radio" name="` + name + `-level" value="suggestion"/>suggestion</label>&nbsp;
            <label><input type="radio" name="` + name + `-level" value="warning"/>warning</label>&nbsp;
            <label><input type="radio" name="` + name + `-level" value="error"/>error</label>&nbsp;
        </div>`;
    
        if(hasLevel){
            text += levelText;
        }
        

        return '<div class="editor-config-ex">' + text + '</div>';
    }
    
    function addListenerForCheckboxes(){
        $('input[name="csharp_new_line_before_open_brace"]').change(function(){
            if ($(this).val() == 'select') {
                var boxes = getCheckboxOptions($(this).parents('table').next().next().find('tbody').find('tr').eq(0).find('td').eq(0).text());        
                $(this).parents('div').eq(0).append(boxes);
            }
            else{
                $('#selectBoxes').remove();
            }
        });
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
    
    function createResultBox(){
        var box=`
        <div class="editor-config-ex-results">
            <input type="file" id="fileInput"/>
            <button id="applyFileButton" disabled>Apply</button><br>
            <button id="resultButton">Get Results</button><br>
        </div>
        `
        $('body').prepend(box);      
        addResultBoxListeners();
    }
    
    function addResultBoxListeners(){
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
            
                if(defaultSettings[0] != resultValue || defaultSettings[1] != resultLevel){
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
                }
            });
        });
        return result;
    }
    
    function parseText(text){
        var lines = text.split('\n');
        $.each(lines, function(index, value){
            var line = value.trim();
            if(!line.startsWith('//') && line.length !=0){
                var parts = line.split("=");
                var name = parts[0];
                var values = parts[1].split(":");
                if(name == 'csharp_new_line_before_open_brace' && values[0] != 'none' && values[0] != 'all'){
                    $('input[name="' + name +'"][value="select"]').click();
                    var checkedValues = values[0].split(',');
                    $.each(checkedValues, function(index, value){
                        $('input[name="' + name +'-select"][value="' + checkedValues[index] + '"]').prop('checked', true);
                    })               
                }
                $('input[name="' + name +'"][value="' + values[0] + '"]').prop('checked', true);
            
                if(values[1] != undefined){
                    $('input[name="' + name +'-level"][value="' + values[1] + '"]').prop('checked', true);
                }           
            }
        });
    }
})()