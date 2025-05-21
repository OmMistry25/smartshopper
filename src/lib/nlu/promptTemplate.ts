// Sample prompt template for extracting shopping attributes from user input

export const extractAttributesPrompt = `
You are a shopping assistant. Extract the following attributes from the user's message:
- category
- style
- color
- size
- priceMax

If an attribute is not mentioned, return null for that field.

Example 1:
User: Looking for red dresses under $100
Output:
{
  category: "dress",
  style: null,
  color: "red",
  size: null,
  priceMax: 100
}

Example 2:
User: I want baggy black pants, size M
Output:
{
  category: "pants",
  style: "baggy",
  color: "black",
  size: "M",
  priceMax: null
}
` 