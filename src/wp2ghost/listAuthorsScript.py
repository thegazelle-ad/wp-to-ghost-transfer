file = open('thegazelle.wordpress.2016-06-22.xml', 'r')
text = file.read()
authors = []
start = text.find("<wp:author_display_name>")
length = len("<wp:author_display_name>")
end = text.find("</wp:author_display_name")
authors.append(text[start+length+len("<![CDATA["):end-len("]]>")])
while text.find("<wp:author_display_name>", start+1) != -1:
  start = text.find("<wp:author_display_name>", start+1)
  end = text.find("</wp:author_display_name>", end+1)
  authors.append(text[start+length+len("<![CDATA["):end-len("]]>")])
authors.sort()
for author in authors:
  print(author)

for i in range(len(authors)-1):
  if (authors[i] == authors[i+1]):
    print(authors[i], "was double counted")

print(len(authors))