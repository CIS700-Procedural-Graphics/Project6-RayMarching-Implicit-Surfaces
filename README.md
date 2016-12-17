# Procedural Graphics Course Infrastructure
Because I desire not to have to maintain data and information in multiple places, I've set up some infrastructure so that we can keep everything in this Bitbucket but then selectively build and deploy assignments and course website updates to github pages.

## Publish Targets
`npm run publish <directory>` will allow us to publish a subdirectory to github. If you need to add or edit any targets, just edit `tools/targets.js`

## Assignments
The idea is that we'll keep base implementations at `hw/hwxx/base` and reference implementations at `hw/hwxx/reference`. I know Adam uses different names. We could use those too, whatever. The `base` folder will be added as a publish target so that changes and updates to our base code can be directly deployed to github.

## Course Website
Relevant files:
 - website/webpack.config.js
 - website/src/\*\*/\*.md
 - website/src/routes.jsx
 - website/src/style/*.scss
 - website/src/components/Template.jsx

__Add a page to the navbar__

 The template for the course page (so basically the navbar) is located in `website/src/components/Template.jsx`. If you need to add anything, you should be able to look at existing links like `<Link to="/resources/javascript-basics">Javascript Basics</Link>` and add stuff appropriately. That will get the link to show up in the navbar.

 __Create a new page__

 To create a new page, create a new markdown file for it in whatever folder you feel appropriate. Then, you'll need to add a route to it in `website/src/routes.jsx` so that the build system will actually compile it. For the most part, you should be able to just follow the template of the other pages. If you notice, the homework pages actually reference the README.md in the hw folder. This will end up being an exact clone of the github's README, but I can't imagine we'd want anything else here.

__Developing__

First run `npm install`

As with the assignments for this class, running `npm start` in the root of the `website` directory will start a server to build the website on the fly and serve it up at `localhost:8080`. Unfortunately this one does not auto-refresh on update.

 __Deploying Updates__

 Run `npm run build` in the root of the `website directory`. Commit your changes. Run `npm run publish website <comment>` at the root of this repository.