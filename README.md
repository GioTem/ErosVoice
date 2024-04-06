# Eros's Voice
![originale](https://github.com/GioTem/ErosVoice/assets/30293839/59e52f5a-f4e0-4331-b9c2-8f7a9a94d612)

Synthesized AAC voice with custom keyboard designed for use on a 7-inch tablet (in landscape orientation only).

## Description

This project was born with the purpose of giving voice to a mute boy named Eros, hence Eros's Voice. I have been working as a software engineer since 2019, and I had an old tablet lying around gathering dust, which made me realize that each of us, in our own small way, can have a positive impact on the lives of others. Currently, it's a simple and somewhat rudimentary project, but in my spare time, I will continue to develop and improve it to reach as many people as possible.

## Tablet Specifications
- Android 4.4 or higher
- 7" display (1024x600) or higher
- Have [Simple HTTP Server](https://play.google.com/store/apps/details?id=com.phlox.simpleserver&hl=en_US&pli=1) installed (If you want to use it completely offline)
- Have Google Chrome installed
- TTS updated to the latest version

## Installation
- Take the contents of this repo and place them in the root of the device
- Simple HTTP Server:
  1. Set the "root folder" to the folder containing our content
  2. Check the "Autostart on boot" box
  3. Finally, press "start"
- Google Chrome:
  1. Open the link http://127.0.0.1:8080
  2. Select the three vertical dots in the top right corner and select "Add to home screen"
- Have fun with this

## Customizations
- In the main.js file, you can change the writing method (Currently only SINGLE_TAP_KEY and TAP_AND_HOLD_KEY) and the time expressed in ms that represents how long to hold down the keys in TAP_AND_HOLD_KEY mode
- In the quickWords file, you can update the #quickWords variable by adding new quickwords

## Coming soon
- Migration to TypeScript (Perhaps with some framework)
- Enhance and refine quickword management, possibly utilizing JSON, and improve search functionality
- Adopt a better TTS (Text-to-Speech) solution than the system's default
- Explore a faster writing method

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](LICENSE).

### Attribution
If you use or adapt this project, you must give appropriate credit by providing a link to the original repository and indicating if changes were made. You must also include a copy of the license.

### Non-Commercial Use
You are free to use this project for non-commercial purposes only. Any commercial use is prohibited.

For more details, please see the [LICENSE](LICENSE) file.

