import re

with open('app/schema.py', 'r') as f:
    code = f.read()

code = re.sub(r'example=([^,\)]+)', r'json_schema_extra={"example": \1}', code)
code = code.replace('class Config:', 'model_config = {')
code = code.replace('schema_extra = {', '"json_schema_extra": {')

with open('app/schema.py', 'w') as f:
    f.write(code)
