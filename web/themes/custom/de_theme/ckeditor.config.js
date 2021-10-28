CKEDITOR.on( 'dialogDefinition', function( ev )
{
   // Take the dialog name and its definition from the event
   // data.
   var dialogName = ev.data.name;
   var dialogDefinition = ev.data.definition;

   // Check if the definition is from the dialog we're
   // interested on (the "Table" dialog).
   if ( dialogName == 'table' )
   {
       // Get a reference to the "Table Info" tab.
       var infoTab = dialogDefinition.getContents( 'info' );
       var txtWidth = infoTab.get( 'txtWidth' );
       if (txtWidth != null)
           txtWidth['default'] = '';
       var selHeaders = infoTab.get( 'selHeaders' );
       if (selHeaders != null)
           selHeaders['default'] = 'row';
   }
 });
