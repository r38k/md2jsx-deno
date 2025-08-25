# Syntax Highlighting Test

## JavaScript Example

```javascript
// This is a comment
const greeting = "Hello, World!";
const count = 42;

function greet(name) {
  console.log(`Hello, ${name}!`);
  return name.length;
}

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  introduce() {
    return `My name is ${this.name} and I'm ${this.age} years old.`;
  }
}

const person = new Person("Alice", 30);
console.log(person.introduce());
```

## CSS Example

```css
/* Basic styles */
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

#header {
  background-color: #007bff;
  color: white;
  padding: 1rem;
}

a:hover {
  color: #0056b3;
  text-decoration: underline;
}

@media (max-width: 768px) {
  body {
    padding: 10px;
  }
}
```

## HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Page</title>
</head>
<body>
  <div class="container">
    <h1 id="title">Welcome</h1>
    <p>This is a <strong>test</strong> page.</p>
    <a href="https://example.com" target="_blank">Visit Example</a>
  </div>
  
  <!-- This is a comment -->
  <script>
    console.log("Page loaded");
  </script>
</body>
</html>
```