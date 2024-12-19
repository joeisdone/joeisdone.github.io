import os
import re
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Set your OpenAI API key

# Path to the large text file
input_file = "CR.txt"

# Read the entire text file
with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# Split the text into roughly 12,000-word chunks
words = text.split()
chunk_size = 10000
chunks = []
for i in range(0, len(words), chunk_size):
    chunk_text = " ".join(words[i:i+chunk_size])
    chunks.append(chunk_text)

print(len(chunks))

# Prepare lists to accumulate results
all_unclear_justifications = []
all_outright_waste = []

# The user prompt template for each chunk
# Note: We request a JSON output to make parsing easier.
user_prompt_template = """You are Dr. Rand Paul and you are compiling your annual Festivus list with a prior year's continuing resolution. 

You are to take note of not only spending you might consider extraneous or incredulous to the public, but you are also to take note of any amendments (not nessarily related to money) that might be considered ... ahem, let's say lower priority. Such as replacing offender with justice-involved individual. 

Please output the results in **valid JSON** format with the following structure - do not put out any additional markup language around it, the message should be able to be parsed as JSON in its fullest:

{{
  "festivus_amendments": [
    {{
      "item": "Example (e.g., replaces offender with justice-involved individual) (include Section number)",
      "rationale": "Why it qualifies for Festivus",
    }}
  ],
  "festivus_money": [
    {{
      "item": "Example item description (include Section number)",
      "amount": "X dollars",
      "rationale": "Why it qualifies for Festivus",
    }}
  ]
}}

If no items match a category, return an empty list for that category.

TEXT CHUNK:
{chunk}"""


# Iterate over chunks and query the model
print(len(chunks))
chunk_count = 0
for chunk in chunks:
    # Construct the user message
    chunk_count += 1

    user_message = user_prompt_template.format(chunk=chunk)

    # Call the model (no system prompt, user prompt only, as requested)
    response = client.chat.completions.create(model="gpt-4o",
    messages=[
        {"role": "user", "content": user_message}
    ])

    # The model's reply should be JSON. Parse it.
    # If the model doesn't return JSON or there's a parsing error, handle it gracefully.
    content = response.choices[0].message.content.strip()
    start = 0
    for c in content: 
        if c != '{':
            start += 1
        else:
            break

    end = len(content)
    for c in content[::-1]:
        if c != '}':
            end = end - 1
        else:
            break
    content = content[start:end]

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        # If JSON decoding fails, you might choose to log the error or try a fallback parsing step.
        # For now, assume well-formed JSON is always returned as requested.
        print(content)
        print("Error at chunk %s" % chunk_count)
        data = {
            "festivus_amendments": [],
            "festivus_money": []
        }

    print(data)
    # Append results to the ongoing lists
    all_unclear_justifications.extend(data.get("festivus_amendments", []))
    all_outright_waste.extend(data.get("festivus_money", []))

# Now we have three large lists: all_unclear_justifications, all_outright_waste, all_remedies
# Next, start another conversation to summarize and compute totals.

# Convert the aggregated data to JSON for the next prompt
final_input_json = {
    "festivus_amendments": all_unclear_justifications,
    "festivus_money": all_outright_waste,
}
final_input_str = json.dumps(final_input_json, indent=2)

# Prompt for the summarization step:
summary_prompt = f"""You are Dr. Rand Paul and you are provided with a set of categorized items from a continuing resolution for your consideration in Festivus.

The data is in JSON format:

{final_input_str}

I want you to:

1. Sum up all amounts in the 'festivus_money' category and provide a total amount.
2. Crunch the festivus_amendments list for the most incredulous entries. 
3. Provide a consolidated summary that lists all the key points and total amounts, that a Festivus reader would like.  
4. Appendix - Individual Items (individual breakout of 'festivus_amendments' category and ('festivus_money' category)) 


Return your final answer in Markdown format. Include a section for each of the above requests, using headings:
- ## Festivus Spending
- ## Festivus Entries
- ## Consolidated Summary
- ## Appendix - Individual Items
"""

summary_response = client.chat.completions.create(model="o1-preview",
messages=[
    {"role": "user", "content": summary_prompt}
])

final_markdown = summary_response.choices[0].message.content.strip()

# Write the final markdown output to a file
with open("final_summary.md", "w", encoding="utf-8") as f:
    f.write(final_markdown)

print("Process complete. See 'final_summary.md' for the final output.")
