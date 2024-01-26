### BackSlash

- 0x5C `\`
- When inside a **Quote**:
  - Used to input an **Escaped BackSlash** or **Escaped DoubleQuote**

### DoubleQuote

- 0x22 `"`
- Used to begin and end a **Quote**

### Escaped BackSlash

- When inside a **Quote**:
  - `\\` (**BackSlash** followed by another **BackSlash**)
  - Signals the parser to include a single **BackSlash** in the final output

### Escaped DoubleQuote

- When inside a **Quote**:
  - `\"` (**BackSlash** followed by a **DoubleQuote**)
  - Signals the parser to include a single **DoubleQuote** in the final output

### Slash

- 0x2F `/`

### LineFeed

- 0x0A (LF, NL, Line Feed, New Line)

### WhiteSpace

- 0x09 (Tab)
- 0x0C (FF, NP, Form Feed, New Page)
- 0x0D (CR, Carriage Return)
- 0x20 (Space)

### String

- A group of characters, excluding:
  - **BackSlash**
  - **DoubleQuote**
  - **WhiteSpace**

### Quote

- A group of **String**s, **Escaped BackSlash**es, **Escaped DoubleQuote**s, and **WhiteSpace** that are surrounded by a pair of **DoubleQuote**s

### Line

- A group of **String**s and **Quote**s that are surrounded by **LineFeed**s and/or the boundaries of the input data (ie. there are no more characters to process before or after)

### Comment

- A **Line** that starts with two **Slash**es (`//`)
- Will be completely ignored by Doto
