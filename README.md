# Markdown editor with GET/PUT support

This is a Markdown editor that allows users to load and store Markdown files via GET and PUT requests.
This works great with Solid and 
the [Solid Authentication browser extension](https://github.com/KNowledgeOnWebScale/solid-authentication-browser-extension/).

## Features
- Load Markdown files via GET requests.
- Store Markdown files via PUT requests.
- Show WebID of user if user has logged in with the Solid Authentication browser extension.
- WebID and browser extension are not needed when working with public resources.
- Show urls of most recent files. The urls are stored in the browser storage.

## Usage

1. Install dependencies via `npm i`.
2. Start server via `npm start`.
3. Browse to <http://localhost:8080>.

## Sequence diagram

You find a sequence diagram of how the app works with the browser extension [here](./sequence-diagram.png).

## Editor

We use [EasyMDE](https://github.com/Ionaru/easy-markdown-editor) as Markdown editor.

## License
This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/) and
released under the [MIT license](http://opensource.org/licenses/MIT).
