import json

def filterFile(fileName):
  print("HANDLING THE FOLLOWING FILE:", fileName)
  print()
  file = open('jsonData/' + fileName + '.json', 'r')
  data = json.loads(file.read())
  file.close()
  output = []
  for row in data:
    print("Do you want to include (answer no to edit):")
    for key in row:
      print(key+":", row[key])
    ans = input('(y/n):\n')
    while not (ans[0] == 'y' or ans[0] == 'n'):
      ans = input('only input y, n, yes or no:\n')
    if ans[0] == 'y':
      output.append(row)
    else:
      ans = input('Do you want to delete it? If you answer no you will instead edit it\n(y/n):\n')
      while not (ans[0] == 'y' or ans[0] == 'n'):
        ans = input('only input y, n, yes or no:\n')
      if ans[0] == 'n':
        for key in row:
          while True:
            print('original is: ', key + ':', row[key])
            newValue = input('new value: ')
            ans = input('do you confirm the following as your new value: ' + newValue + '\n(y/n):\n')
            while not (ans[0] == 'y' or ans[0] == 'n'):
              ans = input('only input y, n, yes or no:\n')
            if ans[0] == 'y':
              row[key] = newValue
              break
          
  file = open('jsonData/filtered' + fileName.capitalize() + '.json', 'w')
  file.write(json.dumps(output))
  file.close()
  print()
  print()

filterFile('categories')
filterFile('authors')