import json

file = open('jsonData/posts.json', 'r')
jsonData = json.loads(file.read())

posts = jsonData['data']['posts']

posts.sort(key = lambda x: x['slug'])

i = 1
while i < len(posts):
  if posts[i]['slug'] == posts[i-1]['slug']:
    print(json.dumps(posts[i], indent=4))
    print('\n\n\nNext')
    print(json.dumps(posts[i-1], indent=4))
    post1 = posts[i]
    post2 = posts[i-1]
    if post1['html'] == post2['html']:
      print("html equal")
    if post1['markdown'] == post2['markdown']:
      print("markdown equal")
    a = input('first slug: ')
    if a != '':
      if a == 'delete':
        del posts[i]
        print("deleted")
        continue
      posts[i]['slug'] = a
    a = input('second slug: ')
    if a != '':
      if a == 'delete':
        del posts[i-1]
        print("deleted")
        input('next?')
        print('\n\n\n\n')
        continue
      posts[i-1]['slug'] = a
    print('\n\n\n\n')
    print(json.dumps(posts[i], indent=4))
    print(json.dumps(posts[i-1], indent=4))
    input('next?')
  i += 1

# posts.sort(key = lambda x: x['title'])
# i = 1
# while i < len(posts):
#   if posts[i]['title'] == posts[i-1]['title']:
#     print(json.dumps(posts[i], indent=4))
#     print('\n\n\nNext')
#     print(json.dumps(posts[i-1], indent=4))
#     post1 = posts[i]
#     post2 = posts[i-1]
#     if post1['html'] == post2['html']:
#       print("html equal")
#     if post1['markdown'] == post2['markdown']:
#       print("markdown equal")
#     a = input('first title: ')
#     if a != '':
#       if a == 'delete':
#         del posts[i]
#         print("deleted")
#         continue
#       posts[i]['title'] = a
#     a = input('second title: ')
#     if a != '':
#       if a == 'delete':
#         del posts[i-1]
#         print("deleted")
#         input('next?')
#         print('\n\n\n\n')
#         continue
#       posts[i-1]['title'] = a
#     print('\n\n\n\n')
#     print(json.dumps(posts[i], indent=4))
#     print(json.dumps(posts[i-1], indent=4))
#     input('next?')
#   i += 1


file.close()
file = open('jsonData/posts.json', 'w')
file.write(json.dumps(jsonData, indent=4))
file.close()
