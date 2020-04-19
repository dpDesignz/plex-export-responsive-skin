# plex-export-responsive-skin

A responsive skin for use the with the [Plex-Export](https://github.com/Dachande663/Plex-Export) script from Dachande663, with some slight changes and fixes in the `plex.js` file. It is highly recommended to use the new Vanilla js file where possible for performance and extended support. See below for more details.

**[View Demo](https://www.dpdesignz.co/github/demos/plex-export-responsive-skin/)**

## Installation

Simply [download a copy of this repo](https://github.com/dpDesignz/plex-export-responsive-skin/archive/master.zip) and upload the `index.html` and `assets` folder to the same location as your current export folder, overwriting the existing files.

## Dark Mode

A dark mode has also been included based on [this design by Dragos](https://github.com/themsk666/Plex-Export-Dark-Mode). Simply uncomment the `<link rel="stylesheet" href="assets/css/darkmode.css" />` line (Line 11) to use. Alternatively, check out his cool repo for a slightly different layout.

## Vanilla js

I have re-written the `plex.js` file in vanilla javascript which you are welcome to try. Simply comment out (or remove) the `<script src="assets/js/jquery.1.4.4.min.js"></script>` and `<script src="assets/js/plex.js"></script>` lines (Line 13 and Line 15) and uncomment the `<script src="assets/js/vanilla-plex.js"></script>` line (Line 16).

**IMPORTANT NOTE: As the vanilla javascript file is coded with ES6+ it will NOT work with Internet Explorer.**

I have commented as much of the code as I've completed to make it easier if you want to help debug anything.

## Contributing

Contributions are encouraged and welcome; I am always happy to get feedback or pull requests on Github! Create [Github Issues](https://github.com/dpDesignz/plex-export-responsive-skin/issues) for bugs and new features and comment on the ones you are interested in.

## License

**Plex Export Responsive Skin** is open-sourced software licensed under [GNU LGPLv3](https://www.gnu.org/licenses/lgpl-3.0.en.html).
