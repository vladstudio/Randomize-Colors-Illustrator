/**

Randomize colors (fill and stroke) of selected objects in Adobe Illustrator.
Select some objects, and run script from menu File > Scripts > Other script...
Set strength of randomizing from 0 to 10.
Tested on CS5 and CC.

Author: Vlad Gerasimov, vladstudio@gmail.com
(C) 2015

*/

/*
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/*
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}



///////////////////////////

function randomize_number(n, strength, min, max)
{
    // change randomly, 
	n += (Math.random() - 0.5) *  ( Math.random() * strength * strength_multiplicator);

    // limit, apply min and max
	n = Math.min(Math.max(n, min), max);
	return n;
}




function randomize_color(obj)
{

    // RGB to HSL
    var new_color = rgbToHsl(
        obj.red,
        obj.green,
        obj.blue
    );

    // randomize H, S and L
    new_color[0] = randomize_number( new_color[0], strength_h, 0, 1 );  // h
    new_color[1] = randomize_number( new_color[1], strength_s, 0, 1 );  // s
    new_color[2] = randomize_number( new_color[2], strength_l, 0, 1 );  // l

    // back to RGB
    new_color = hslToRgb( new_color[0], new_color[1], new_color[2] );

    obj.red = new_color[0];
    obj.green = new_color[1];
    obj.blue = new_color[2]; 

}


// find type of object, and process it
function process_unknown_object(obj)
{
    if(obj.typename == 'PathItem')
    {
        process_path_item(obj);
    } else  
    if(obj.typename == 'CompoundPathItem')
    {
        process_compound_path(obj);
    } else 
    if(obj.typename == 'GroupItem')
    {
        process_group(obj);
    }
}

function process_path_item(obj)
{
    // just randomize the color; that's all
    if (obj.filled)
    {
        randomize_color(obj.fillColor);   
    }
    if (obj.stroked)
    {
        randomize_color(obj.strokeColor);   
    }
}

function process_compound_path(ob){
    for(var i = 0; i < ob.pathItems.length; i++)
    {
        process_unknown_object(ob.pathItems[i]);
    }
}


function process_group(obj){
    for(var i = 0; i < obj.pageItems.length; i++)
    {
        process_unknown_object(obj.pageItems[i]);
    }
}


// global variables
var strength_h = 4;
var strength_s = 4;
var strength_l = 4;
var strength_multiplicator = 0.1;


////// main function
function run()
{
    strength_h = Number(prompt ("How random is Hue? (0 to 10)", 4));  
    strength_s = Number(prompt ("How random is Saturation? (0 to 10)", 4));  
    strength_l = Number(prompt ("How random is Lightness? (0 to 10)", 4));  

    var selectedObjects = app.activeDocument.selection;
    for (var i = 0; i < selectedObjects.length; i++)
    {
        process_unknown_object(selectedObjects[i]);
    }    
}



// check and run
if( app.documents.length == 0)
{
    alert('Open any document!');
}
else if ( app.activeDocument.selection.length == 0)
{
    alert('Select something!');
}
else if (app.activeDocument.documentColorSpace != "DocumentColorSpace.RGB")
{
    alert('Sorry, your document is not RGB.');
}
else
{
    run();
}