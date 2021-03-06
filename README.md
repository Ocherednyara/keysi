# keysi

A simple typing game to practice with - supports random words and quotes.

<img width="994" alt="image" src="https://user-images.githubusercontent.com/19497414/179441616-6d9244e0-698b-438b-ad59-11f1f2ab8b61.png">

### Requirements

- Node.js v16+

### Installation

    $ npm install -g keysi

### Usage

    $ keysi
    
### Known issues

#### Why does Ctrl+Backspace not work?
Limitation/bug in Node.js `process.stdin` where backspace key does not register whether Ctrl modifier is pressed. Hopefully will address this issue once I invariably rewrite the project in Rust - until then don't make mistakes in your typing.

#### Why does it flicker?
Some terminals work far better than others, I have no idea why and I'm unlikely to investigate it as I don't know the first thing about terminal emulation. Recommended terminals that I've tested are iTerm (macOS), Terminal (macOS) and Command Prompt (Windows).

#### Why does it look different on my machine?
How the application looks will depend on the terminal's font.
