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
        var headers = getSectionHeaders();   
        $.each(headers, function(index, value){
            var header = headers.eq(index);
            var defaultIndex = getDefaultColumnIndex(header);
            var rows = getSectionTableRows(header);
            $.each(rows, function(index, value){              
                var row = rows.eq(index);       
                var name = getConfigOptionName(row);
                var defaultValues = getOptionDefaultsValues(row, defaultIndex);
                var possibleValues = getOptionPossibleValues(defaultValues);
            
                row.find('td:first').append(getRadioButtonsForOptions(name, possibleValues, defaultValues[1] != undefined));
                setDefaultsToRadioBoxes(name, defaultValues);
            })
        })
        
        addListenerForCheckboxes();
    }
    
    function getSectionHeaders(){
        return $('h2:first').nextUntil($('h2:eq(2)'),'h4');
    }
    
    function getSectionTableRows(header){
        return header.nextUntil('h4','table:first').find('tbody tr');
    }
    
    function getConfigOptionName(row){
        return row.find('td:first').text();
    }
    
    function getDefaultColumnIndex(header){
        var i;
        var tableHeaders = header.nextUntil('h4','table:first').find('thead tr:first th');
        $.each(tableHeaders, function(index, value){
            if(tableHeaders.eq(index).text().startsWith('Visual Studio'))
                i = index;    
        });
        return i;
    }
    
    function getOptionDefaultsValues(row, index){
        return row.find('td').eq(index).text().split(':');
    }
    
    function getOptionPossibleValues(defaultVal){
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
    
    function getRadioButtonsForOptions(name, values, hasLevel){
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
      
    //.next().next();
    function addListenerForCheckboxes(){
        $('input[name="csharp_new_line_before_open_brace"]').change(function(){
            if ($(this).val() == 'select') {
                var boxes = getCheckboxOptions($(this).parents('table').next().next().find('tbody tr:first td:first').text());        
                $(this).parents('div:first').append(boxes);
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
      
    function setDefaultsToRadioBoxes(name, values){
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
            var text= getResultText();
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
                parseInputText(event.target.result);
            };
            fr.readAsText(file);
        });
    }
    
    function getResultText(){
        var result = "";
        var previousMainHeader = "";
        var previousMiddleHeader = "";
        var previousHeader = "";
        var headers = getSectionHeaders();
        $.each(headers, function(index, value){
            var header = headers.eq(index);
            var defaultIndex = getDefaultColumnIndex(header);
            var rows = getSectionTableRows(header);
            $.each(rows, function(index, value){
                var row = rows.eq(index);       
                var nameData = getConfigOptionName(row);
                var name = nameData.slice(0, nameData.indexOf("Value:")).trim();
                var defaultSettings = getOptionDefaultsValues(row, defaultIndex);
                var resultValue = $('input[name="' + name +'"]:checked').val();
                var resultLevel = $('input[name="' + name +'-level"]:checked').val();
            
                if(defaultSettings[0] != resultValue || defaultSettings[1] != resultLevel){
                    var mainHeader = header.prevAll('h2:first').text();
                    if(previousMainHeader != mainHeader){
                        result += '\r\n//' + mainHeader;
                        previousMainHeader = mainHeader;
                    }
                
                    var middleHeader = header.prevAll('h3:first').text();
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
    
    function parseInputText(text){
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