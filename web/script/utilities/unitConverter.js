var unitConverterDiv="utilities";var unitConverterInnerDiv="unitConverterInner";var loadedunitConverter;var unitWindowClosed=true;var initUnitConverterWin=function(){if(document.getElementById(unitConverterDiv)==null){alert("Error: Access Denied");return}openUnitConverter()};function openUnitConverter(){unitConverterWindow=internalWindow.open("unitWindowDiv","iframe","unitconverter/unitConverter.jsp","Unit Converter","width=625px,height=425px,right=400px,top=50px,center=1,resize=1,scrolling=1,keepOpen=1");unitWindowClosed=false}initUnitConverterWin();