(function(){
    
    // overload base create element
    var baseCreateElement = document.createElement.bind(document);
    
    document.createElement = function(tagName) {
        var newTag = baseCreateElement(tagName);
        var def = $('tag[name="' + tagName + '"] template');
        if(def.length > 0) {
            $(newTag).append(def.html());
            $(newTag).attr('x-template','expanded');
        }
        return newTag;
    };
    
    // helper to expand new instances of a given tag
    function expandTagInstance(tagName) {
       var content = $('tag[name="'+tagName+'"] template').html();
       // we need to find all tags that haven't already been expanded
       var unexpandedTags = $(tagName+'[x-template!="expanded"]');
       unexpandedTags.html(content);
       // mark as expanded, so we don't expand again
       unexpandedTags.attr('x-template','expanded');
    }

    // do imports--this is how we get custom tags, by importing them
    $(function() {
        // initialize basic styling to hide tag definition containers
        $('head').append('<style>tags,newtags{display:none}</style>')
        
        // setup containers for tag definitions
        $('body').prepend('<tags></tags><newtags></newtags>');
        
        // load tag libraries
        $('link[rel="import"]').each(function(index,link) {
            if(undefined != link.href) {
                $.get(link.href,function(html) {
                   $('newtags').append(html);
                   
                    // integrate any common Less styling into each tag's style element,
                    // if the style element is a Less element
                    if($('newtags less').length > 0) {
                        var sharedLess = $('newtags less').text();
                        
                        // ensure any Less styles include shared information
                        $('newtags style[type="text/less"]').each(function(index,style){
                            $(style).text($(style).text() + "\n" + sharedLess);
                        });
                    }

                    // copy any link elements into head
                    $('newtags tag link').each(function(index,link){
                       $('head').append(link); 
                    });
                    
                    // refresh styles built with Less, if it's available
                    if(window.hasOwnProperty('less') && window.less.hasOwnProperty('refreshStyles')) {
                        window.less.refreshStyles();
                    }
                    
                    // replace the content of custom tags with their template
                    $('newtags tag').each(function(index,tag) {
                       var tagName = $(tag).attr('name');
                       expandTagInstance(tagName);
                    });
                    
                    // mark the new tag definitions as loaded
                    $('tags').append($('newtags > style'));
                    $('tags').append($('newtags > tag'));
                    $('tags').append($('newtags > script'));
                    $('newtags').empty();
                });
            }
        });
    });
})();
