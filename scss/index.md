#Peerio CSS Style Guide


Welcome to the Peerio styleguide. Herein lies the method to our CSS madness.

##Structure

Peerio styles are loosely bases on the [SMACSS](https://smacss.com/) CSS architecture. Styles are divided into:

- **Base Styles**
- **Components**
- **Layouts**
- **Themes**

####Base Styles
Base styles are any styles that are applied to a single HTML element. 
Base styles should be self-sustaining and should not depend on nesting.

This is an example of a base style: 

```
a {
  color: color(p-blue);
}
```

This is not: 

```
#sidebar a {
  color: color(p-blue);
}
```

Base styles are currently categorized into the following files: 

```
  |-base/
    |- base_elements (Styles that are applied to HTML tags)
    |- buttons
    |- fonts
    |- icons
    |- inputs
    |- typography
```
