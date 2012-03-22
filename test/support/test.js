//
// Sample Javascript test code
//
//


// = Case: Arithmetic (1)
var x = 1 + 1;  // 0

// = Case: Arithmetic (2)
var x = 1 +     // 0
        1;              // 1

// = Case: Arithmetic (3)
var x = 1 +     // 0
        1 +             // 1
        1;              // 1

// = Case: Object (2)
var x = { y : y, z : z },        // 0
    w;                                      // 0

// = Case: Object (1)
var x = {               // 0
    // comment      // 1
    y : y,  // 1
    z : z           // 1
};                       // 0

// = Case: Object (2)
var x = {               // 0
    // comment      // 1
    y : {           // 1
        z: z, // 2
        w: w  // 2
    },              // 1
    t: t            // 1
};                      // 0

/*
 * this is a comment
 */

var a = 1,
    b = 'test',
    c = 'hello',
    d = new Date(),
    f = function(x) { console.log(x); };

var e = function(z) { 
    var y = z;
};

$('.myclass', function(test) {
    var f = function() { console.log('hello'); };
    $('a').on('hello', function(goodbye) {
        console.log(goodbye);
    });
});

var l = list
   .map(function(x) { return x - 10; })
   .filter(function(x) { return x % 2 === 0; })
   .take(10);

list
   .map(function(x) { return x - 10; })
   .filter(function(x) { return x % 2 === 0; })
   .take(10);

var fun = function(x, y) {
    return x + y;
};

function hola (arg) {
    return 'yea';
}

f3(f2(fun.add(function(x, y, z) {
    if (x === y) {
        return x + y - z;
    } else {
        return x + y + z;
    }
})));

bright.mul(function(arg) {
    console.log(arg);
});

var f1 = function(x, y, z) {
    console.log(x,
        y,
        z,
        w);
};

function hello (arg) {
    var foo = function(arg2) {
        var bar = function(arg3) {
            return arg + arg2 + arg3;
        };
    };
}

// Case: Function (1)
function $blah() {      // 0
    var a = x + 1;                      // 1
    var b = y;                      // 1
}                               // 0

// Case: Function (2)
var $blah = function() {        // 0
    var a = x + 1;                      // 1
    var b = y;                      // 1
};                                       // 0

// Case: Function(3)
var x = {                               // 0
    $blah: function() {     // 1
        var k = y;                      // 2
    }                               // 1
};                                       // 0

// Case: Function(4)
function $blah(         // 0
    x,              // 1
    y,              // 1
    z ) {   // 1
}                       // 0

// Case: Function (5)
function $blah(         // 0
    x,              // 1
    y,              // 1
    z ) {   // 1
    var k;              // 1
}                      // 0



// = Case: if (1)
if ( x ) {      // 0
    var a = x;      // 1
}               // 0

// = Case: if (2)
if(x) {  // 0  
    console.log(x);      // 1
} else {
    console.log(y);              // 0
}

// = Case: if (3)
if(x)   // 0
{               // 0
    console.log(x);      // 1
}               // 0

// = Case: if (4)
if( x === y &&   // 0
    y === z ||       // 1
    z === w) {       // 1
    console.log(x);              // 1
}                       // 0

// = Case: if (4a)
if( x === y &&   // 0
    y === z ||       // 1
    z === w)         // 1
{                       // 0
    console.log(x);
}                       // 0


// = Case: if (5)
if(x) {          // 0
    // comment      // 1
    a(y);              // 1
    b(x);                      // 0
}


// = Case: if else (1)
if ( x ) {      // 0
    a(x);      // 1
} else {        // 0
    b(y);      // 1
}               // 0  

// = Case: if else (2)
if ( x ) {        // 0
    a(x);      // 1
}
else {           // 0
    b(y);      // 1
}

// = Case: if else(3)
if(x)   // 0
{               // 0
    a(x);      // 1
}               // 0
else            // 0
{               // 0
    b(y);      // 1
}               // 0

// = Case: if elseif else (1)
if ( x ) {      // 0
    a(x);      // 1
} else if ( y ) {       // 0
    a(y);      // 1
} else {        // 0
    a(z);      // 1
}               // 0

// = Case: if elseif else (2)
if ( x ) {       // 0
    a(x);      // 1
}
else if ( y ) {  // 0
    a(y);      // 1
}
else {   // 0
    a(z);      // 1
}

// = Case: if elseif else (3)
if(x)   // 0
{               // 0
    a(x);      // 1
}               // 0
else if(y)      // 0
{               // 0
    a(y);      // 1
}               // 0
else    // 0
{               // 0
    a(z);      // 1
}               // 0

// = Case: for (1)
for (var i = 0; i < blah.length; i++) {         // 0
    blah[i];                                        // 1
};                                                      // 0

// = Case: for (2)
for (var i = 0; i < blah.length; i++)   // 0
    blah[i];                                        // 1
x;                                                      // 0

// = Case: switch
switch(x) {     // 0
  case "y":               // 0
    y;              // 1
    break;  // 1

  case "z":               // 0
    z;              // 1
    break;  // 1

  default:                // 0
    w;              // 1
    break;  // 1
}              

// = Case: try (1)
try {           // 0
    x;              // 1
}                       // 0

// = Case: try (2)
try                     // 0
    x;              // 1
y;                      // 0

// = Case: try (3)
try                     // 0
{                       // 0
    x;              // 1
}                       // 0

// = Case: try catch (1)
try {           // 0
    x;              // 1
} catch(e) {    // 0
    y;              // 1
}                       // 0

// Case: try catch (2)
try                     // 0
{                       // 0
    x;              // 1
}                       // 0
catch(e)                // 0
{                       // 0
    y;              // 1
}                       // 0

// Case: try catch (3)
try                     // 0
    x;              // 1
catch(e)                // 0
    y;              // 1


// Case: try catch finally (1)
try {           // 0
    x;              // 1
    y;              // 1
} catch(e) {    // 0
    x;              // 1
    y;              // 1
} finally {     // 0
    x;              // 1
    y;              // 1
}

// = Case: try catch finally (2)
try             // 0
    x;      // 1
catch(e)        // 0
    y;      // 1
finally         // 0
    z;      // 1

// = Case: try catch finally (3)
try          {           // 0
    // comment      // 1
    x;              // 1
}
catch(e)   {             // 0
    // comment      // 1
    y;              // 1
}
finally {                // 1
    // comment      // 1
    z;              // 1

    // = Case: Anonymous Function (1)
    (function(x) {  // 0
        x;              // 1
        y;              // 1
    })(x);          // 0

    // = Case: Anonymous Function (2)
    (function(x)    // 0
        {                       // 0
            x;              // 1
            y;              // 1
        })(x);          // 0

        // = Case: Anonymous Function (2)
        (function(x)    // 0
            {                       // 1
                x;              // 1
                y;              // 1
            }                       // 0
        )(x);           // 0

        // = Case: Anonymous Function (1)
        (function(x) {  // 0
            x;              // 1
            y;              // 1
        }                       // 0
    )(x);           // 0

    // = Case: Multi Line Invocation (1)
    $(document).bind('click', function() {  // 0
    });                                                     // 0

    // = Case: Multi Line Invocation (2)
    $(document).bind('click', function() {  // 0
        x;                                              // 1
        y;                                              // 1
    });                                                     // 0
}

// = Case: COMPLEX
(function(window, undefined) {                          // 0
    // = Class: Test                                                // 1
    //                                                              // 1
    // = Description: This is a                             // 1
    //   test class.                                                // 1
    //                                                              // 1
    var Test = new Class({                                  // 1
        initialize: function() {                        // 2
            this.test = test;                       // 3
        },                                                      // 2

        // = Method: test                               // 2
        //                                                      // 2
        // = Description:                               // 2
        //                                                      // 2
        test: function(blah) {                          // 2
            if(blah) {                                      // 3
                return "blah";                  // 4
            } else if(blah === undefined)   // 3
                return "blahblah";              // 4
            else {                                  // 3
                // another comment.             // 4
                return "blahblahblah";          // 4
            }                                               // 3

            var x = {                                       // 3
                y: function() {                         // 4
                    for (var i = 0; i < blah.length; i++) {         // 5
                        blah[i];                // 6
                    };                              // 5
                }                                       // 4
            };                                              // 3

            return new function() {                 // 3
            };                                              // 3
        },                                                      // 2

        // = Method: blah                               // 2
        //                                                      // 2
        // = Description: description           // 2
        //                                                      // 2
        blah: function(haha) {                          // 2
            return this.test;                       // 3
        }                                                       // 2
    });                                                             // 1
})(this);                                                               // 0


// Case: SKELETON CODE
(function(window, undefined) {                          // 0
    var Skeleton = new Class({                              // 1
    });                                                             // 1

    var Skeleton2 = new Class({                             // 1
        Extends: Skeleton                               // 2
    });                                                             // 1

    var Skeleton3 = new Class({                             // 1
        skeleton: function() {                          // 2
        },                                                      // 2

        objects: function() {                           // 2
            var x, y;                                       // 3

            x = {};                                         // 3
            y = [];                                         // 3

            x = {                                   // 3
            };                                              // 3

            y =  [                                  // 3
            ];                                              // 3

        },                                                      // 2

        contrls: function() {                           // 2
            while(true) {                           // 3
            }                                               // 3

            do {                                            // 3
            } while(true);                          // 3

            with(x) {                                       // 3
            }                                               // 3

            if (true) {                             // 3
            } else if(true) {                       // 3
            } else {                                        // 3
            }                                               // 3

            for (var i = 0; i < blah.length; i++) {         // 3
            }                                                       // 3

            switch(true) {                          // 3
              case 'case1': break;                    // 3
              case 'case2': break;                    // 3
              default:                                        // 3
            }                                               // 3

            try {                                   // 3
            } catch (e) {                           // 3
            } finally {                             // 3
            }                                               // 3
        }                                                       // 2
    });                                                             // 1
})(this);                                                               // 0
