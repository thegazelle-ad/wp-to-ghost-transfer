import json

file = open('wordPressTags.json', 'r')
dic = json.loads(file.read())
file.close()
output = {}
last = None
array = []
for key in dic:
  print(len(array), key)
  array.append(key)
  if len(array) >= 60:
    indices = list(map(int, input('gimme those indices: ').split()))
    for index in indices:
      k = array[index]
      output[k] = dic[k]
    array = []
    print(output)
    print("\n\n\n\n\n\n\n\nNew Page:\n")
print(json.dumps(output))
file = open('wordPressTagsOut.json', 'w')
file.write(json.dumps(output))
file.close()
