# Mahjong - 

Converting mahjong to polymer 3 / lit-html.

The documentation for polymer 3 does not apply to elements
written with lit-html/lit-element.  Everything about property
declaration and data binding and so on is not present.  But
what is present is a whole new way of constructing pages.

The idea is that you write a _render(props) {} function which
returns an html`` literal that renders your element, or your 
page, based on the properties of the object that is your element
or page.  The literal can be one literal string, or an array of 
literal strings, or anything which can be flattened to an array 
of literal strings.  The literal can interpolate a javascript expr
as ${ expr }, and the expr can be any javascript expression.  So
you render your page using the object properties to compute the
proper values to interpolate, and the html`` literal handler parses
it all out into constants and potential variable expressions.  When
you actually request a render it checks to find what actually changed
and renders that which is necessary.

Now I am considering how to reorganize mahjong to make this work
better.  I currently have many sub-identifiers which could be pushed
into a custom element scope.

I also need to figure out how to trigger a rendering, since I'm not getting
any at this point.
