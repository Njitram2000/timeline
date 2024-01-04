# Timeline
## Features
- Timeline that highlights date and some info text but mainly ment for viewing images
- Shortcut to months at top
- Gallery on clicking image in timeline
- Lightbox with zoom on clicking image in gallery (or skip gallery if there is only one image for the date)
- Responsive design
## Managing content
- Title can be managed in the <h1> element in the html 
- data.json5 allows all other content management. Per event:
  - date
  - description
  - location (currently not implemented)
  - images OR imagesRange (range allows sequentially named images in a folder to easily be added)
    - Each image has:
    - thumb url
    - src url
    - alt text