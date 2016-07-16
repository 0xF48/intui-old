# intui
----
desktop based react ui component library, documentation coming soon.
right now untui is designed specifically for dekstop browser single page apps



The goal of the library is to create a fully animated desktop browser experience on the lowest level possible, the component library provides an easy, straightforward, and standard way to create a single static applicaiton layout with no actual dom element switching or removing. As the application scales, so the does the UI in a recursive and standard manner. This results in a new level of user experience and a whole new world of design possibilities within a standard and proven layout/ux pattern.

To achive this, each dom layout element is replaced, or rather wrapped, with a "Slide" component. Each slide can be recursively nested in other slides, sliding to spcific indicies when appropriate information is needed to be displayed. Sliding of components is set with props so is declarative and its up to the developer to decide how and when they want to slide. 

Slides can ofcourse be detached / attached by toggling their rendering through react render. But is not recommended in most cases as that would defeat the purpose of the library.

resizing slides is somewhat supported but is not (yet) a completly fluid experience. Ofcourse, intui does not actually animate the size vairables as that its highly impractical, but does cheat its through transitions so that it appears in a more fluid way.

The library provides a way to render your react view in a very static way, transitioning when appropriate.