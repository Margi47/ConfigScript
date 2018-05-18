// ==UserScript==
// @name EditorConfig Script
// @description Helps to define .NET coding convention settings for EditorConfig file.
// @version 1
// @namespace https://github.com/Margi47/EditorConfigScript
// @match https://docs.microsoft.com/en-us/visualstudio/ide/editorconfig-code-style-settings-reference
// @run-at document-end
// ==/UserScript==

(function() {
    $(document).ready(function(){  
        addExternalScripts();       
        addRadioboxesForOptions();   
        createResultBox();   
    });
    
    function addExternalScripts(){
        $('head').append(`<script src="https://cdn.rawgit.com/eligrey/FileSaver.js/5ed507ef8aa53d8ecfea96d96bc7214cd2476fd2/FileSaver.min.js"></script> 
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
        return $('#main').children('h4');
    }
    
    function getSectionTableRows(header){
        return header.nextUntil('h4','.table-scroll-wrapper').eq(0).find('table tbody tr');
    }
    
    function getConfigOptionName(row){
        return row.find('td:first').text();
    }
    
    function getDefaultColumnIndex(header){
        var i;
        var tableHeaders = header.nextUntil('h4','.table-scroll-wrapper').eq(0).find('table thead tr:first th');
        $.each(tableHeaders, function(index, value){
            if(tableHeaders.eq(index).text().startsWith('Visual Studio default'))
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
            case 'for_non_interface_members':
                values.push('always','for_non_interface_members','never');
                break;
            default :
                values.push(defaultVal[0]);
                break;
        }
        return values;
    }
    
    function getRadioButtonsForOptions(name, values, hasLevel){
        var text;
        if(values.length > 1){
            var options ="";
            $.each(values, function(index, value){
                options += '<label><input type="radio" name="' + name + '" value="' + value + '"/>' + value + '</label>&nbsp;';
            });
    
            text =`
                <div class="editor-config-ex-value">
                    <label>Value:</label>&nbsp;` + options + `
                </div>`;
        }
        else{
            var rows;
            if(name == 'csharp_preferred_modifier_order'){
                rows = 2;
            }
            else{
                rows = 5;
            }
            text = `
            <div class="editor-config-ex-value">
                <label>Value:</label>
            </div>
            <div>
                <textarea name="` + name + `" cols="60" rows="` + rows + `" style="resize: none;">` + values[0] + `</textarea>
            </div>
            `
        }
        if(hasLevel){
            text += getLevelText(name);
        }
        
        return '<div class="editor-config-ex">' + text + '</div>';
    }

    function getLevelText(name){
        var levelText =`
        <div class="editor-config-ex-value">
            <label>Severity:</label>&nbsp;
            <label><input type="radio" name="` + name + `-level" value="none"/>none</label>&nbsp;
            <label><input type="radio" name="` + name + `-level" value="suggestion"/>suggestion</label>&nbsp;
            <label><input type="radio" name="` + name + `-level" value="warning"/>warning</label>&nbsp;
            <label><input type="radio" name="` + name + `-level" value="error"/>error</label>&nbsp;
        </div>`
        return levelText;
    }
      
    function addListenerForCheckboxes(){
        $('input[name="csharp_new_line_before_open_brace"]').change(function(){
            if ($(this).val() == 'select') {
                var boxes = getCheckboxOptions($(this).parents('.table-scroll-wrapper').nextUntil('.codeHeader','.table-scroll-wrapper').find('table tbody tr:first td:first').text());        
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
        
        if(values[0].length > 1){
            $('input[name="' + name +'"][value="' + values[0] + '"]').prop('checked', true);
        }

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
            console.log(text);
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
            $('#applyFileButton').attr("disabled", "disabled");
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

                var resultLevel = $('input[name="' + name +'-level"]:checked').val();
                var resultValue;
                var newValue = false;
                if(name == 'csharp_preferred_modifier_order' || name == 'visual_basic_preferred_modifier_order'){
                    resultValue = $('textarea[name="' + name +'"]').val();
                    if(defaultSettings[0].replace(/ /g,'') != resultValue.replace(/ /g,'') 
                        || defaultSettings[1] != resultLevel){
                        newValue = true;
                    }
                }
                else{
                    resultValue = $('input[name="' + name +'"]:checked').val();
                    if(defaultSettings[0] != resultValue || defaultSettings[1] != resultLevel){
                        newValue = true;
                    }
                }
                
                if(newValue){
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

                if(name == 'csharp_preferred_modifier_order' || name == 'visual_basic_preferred_modifier_order'){
                    $('textarea[name="' + name +'"]').val(values[0]);
                }
                else if(name == 'csharp_new_line_before_open_brace' && values[0] != 'none' && values[0] != 'all'){
                        $('input[name="' + name +'"][value="select"]').click();
                        var checkedValues = values[0].split(',');
                        $.each(checkedValues, function(index, value){
                            $('input[name="' + name +'-select"][value="' + checkedValues[index] + '"]').prop('checked', true);
                        })               
                }
                else{
                    $('input[name="' + name +'"][value="' + values[0] + '"]').prop('checked', true);
                }
                
                if(values[1] != undefined){
                    $('input[name="' + name +'-level"][value="' + values[1] + '"]').prop('checked', true);
                }           
            }
        });
    }
})()
