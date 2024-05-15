> [!IMPORTANT]
> This extension was a cool POC but has not been updated in a while and won't be in the foreseeable future. I'm officially archiving it 😉

# 🔮‍ Hocus Pocus

![][logo-hocus-pocus]

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)
[![Build Status](https://travis-ci.org/nicoespeon/hocus-pocus.svg?branch=master)](https://travis-ci.org/nicoespeon/hocus-pocus)
![](https://img.shields.io/badge/it%27s-magic-purple.svg)

[> Give a feedback][create-new-issue]

Hocus Pocus is a Visual Studio Code extension that creates useful things for you, in JavaScript and TypeScript.

Our goal is to make you more productive by creating boilerplate code faster.

![Gif showing what the extension can do][demo-extension]

Related projects:

- [Abracadabra][abracadabra], a VS Code extension that does automated refactorings in JavaScript and TypeScript

## Features

All features are available through VS Code [VS Code Quick Fixes][vscode-quick-fixes].

Click on the lightbulb that appears next to the code 💡 or use the shortcut `Alt ↵`.

### Create Function

Create a function declaration from its call expression.

If you're the kind of developer who writes a function call as you'd like it exist, before implementing the function, then you'll love this. It's called [program by wishful thinking][wishful-thinking]. It's very common when you practice outside-in TDD.

![][demo-create-function]

### Create Variable

Create a variable declaration from its identifier.

Just like "Create Function", this can be very useful if you tend to write variable usage before declaring the variable.

![][demo-create-variable]

### Create Class

Create a class declaration from its identifier.

Just like "Create Function", this can be very useful if you tend to write class usage before declaring the class.

![][demo-create-class]

### Create Switch Cases

Create all missing cases of a switch statement made over an union type or an enum.

Very convenient when you need to generate a switch statement to handle each scenario. If some cases are already present, it will complete the remaining ones.

![][demo-create-switch-cases]

## Release Notes

[Have a look at our CHANGELOG][changelog] to get the details of all changes between versions.

### Versioning

We follow [SemVer][semver] convention for versionning.

That means our releases use the following format:

```
<major>.<minor>.<patch>
```

- Breaking changes bump `<major>` (and reset `<minor>` & `<patch>`)
- Backward compatible changes bump `<minor>` (and reset `<patch>`)
- Bug fixes bump `<patch>`

## Contributing

### [Contributing Guide][contributing]

Read our [contributing guide][contributing] to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to Hocus Pocus.

### [Good First Issues][good-first-issues]

To help you get your feet wet and become familiar with our contribution process, we have a list of [good first issues][good-first-issues] that contains things with a relatively limited scope. This is a great place to get started!

## Contributors

Thanks goes to these wonderful people ([emoji key][all-contributors-emoji]):

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://nicoespeon.com"><img src="https://github.com/nicoespeon.png" width="100px;" alt="Nicolas Carlo"/><br /><sub><b>Nicolas Carlo</b></sub></a><br /><a href="#question-nicoespeon" title="Answering Questions">💬</a> <a href="https://github.com/nicoespeon/hocus-pocus/commits?author=nicoespeon" title="Code">💻</a> <a href="https://github.com/nicoespeon/hocus-pocus/commits?author=nicoespeon" title="Documentation">📖</a><br /><a href="#review-nicoespeon" title="Reviewed Pull Requests">👀</a> <a href="#ideas-nicoespeon" title="Ideas">🤔</a></td>
    <td align="center"><a href="https://github.com/automatensalat"><img src="https://github.com/automatensalat.png" width="100px;" alt="Tobias Hann"/><br /><sub><b>Tobias Hann</b></sub></a><br /><a href="https://github.com/nicoespeon/hocus-pocus/commits?author=automatensalat" title="Code">💻</a> <a href="#ideas-automatensalat" title="Ideas">🤔</a><a href="https://github.com/nicoespeon/hocus-pocus/issues?q=author%3Aautomatensalat" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://nickebbitt.github.io/"><img src="https://github.com/nickebbitt.png" width="100px;" alt=""/><br /><sub><b>Nick Ebbitt</b></sub></a><br /><a href="https://github.com/nicoespeon/hocus-pocus/commits?author=nickebbitt" title="Code">💻</a> <a href="#ideas-nickebbitt" title="Ideas">🤔</a></td>
    <td align="center"><a href="https://github.com/grandsong"><img src="https://github.com/grandsong.png" width="100px;" alt=""/><br /><sub><b>GrandSong</b></sub></a><br /><a href="https://github.com/nicoespeon/hocus-pocus/issues?q=author%3Agrandsong" title="Bug reports">🐛</a></td>
  </tr>
</table>
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

This project follows the [all-contributors][all-contributors] specification.

Contributions of any kind are welcome!

## License

💁 [MIT][license]

<!-- Links -->

[abracadabra]: https://marketplace.visualstudio.com/items?itemName=nicoespeon.abracadabra
[vscode-quick-fixes]: https://code.visualstudio.com/docs/editor/refactoring#_code-actions-quick-fixes-and-refactorings
[changelog]: https://github.com/nicoespeon/hocus-pocus/blob/master/CHANGELOG.md
[contributing]: https://github.com/nicoespeon/hocus-pocus/blob/master/CONTRIBUTING.md
[license]: https://github.com/nicoespeon/hocus-pocus/blob/master/LICENSE.md
[good-first-issues]: https://github.com/nicoespeon/hocus-pocus/issues?q=is%3Aissue+is%3Aopen+label%3A%22%3Awave%3A+Good+first+issue%22
[semver]: http://semver.org/
[all-contributors]: https://allcontributors.org
[all-contributors-emoji]: https://allcontributors.org/docs/en/emoji-key
[create-new-issue]: https://github.com/nicoespeon/hocus-pocus/issues/new/choose
[wishful-thinking]: https://wiki.c2.com/?WishfulThinking

<!-- Demos -->

[demo-extension]: https://github.com/nicoespeon/hocus-pocus/blob/master/assets/showcase.gif?raw=true
[demo-create-function]: https://github.com/nicoespeon/hocus-pocus/blob/master/assets/features/create-function.gif?raw=true
[demo-create-variable]: https://github.com/nicoespeon/hocus-pocus/blob/master/assets/features/create-variable.gif?raw=true
[demo-create-class]: https://github.com/nicoespeon/hocus-pocus/blob/master/assets/features/create-class.gif?raw=true
[demo-create-switch-cases]: https://github.com/nicoespeon/hocus-pocus/blob/master/assets/features/create-switch-cases.gif?raw=true

<!-- Logo -->

[logo-hocus-pocus]: https://github.com/nicoespeon/hocus-pocus/blob/master/assets/logo/banner.png?raw=true
