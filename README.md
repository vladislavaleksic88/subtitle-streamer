# Subtitle Streamer
> The TypeScript library for displaying subtitles on a page. It uses the SRT subtitle format. You can use it to show subtitles for a video or for displaying any text that is changing over time.\
> This library uses RxJS Observables for updating events. You can use the usual RxJS methods for modifying the streams.

## Installation

Add package to you project
```sh
// Yarn
yarn add subtitle-streamer

// NPM
npm install subtitle-streamer
```

## Usage

### Init player object

```ecmascript 6
import { Player } from "subtitle-streamer";

const player = new Player();
```

### Load the subtitles

```ecmascript 6
const subtitle = `
1
00:00:01,000 --> 00:00:04,000
Hello World
`;
player.loadSubtitles(subtitle);
```

### Load the subtitles from file

```ecmascript 6
fetch('subtitle.srt')
  .then(response => response.text())
  .then(subtitle => {
    player.loadSubtitles(subtitle);
  });
```

### Listen to the stream

```ecmascript 6
player.stream$.subscribe(sub => {
  // Show subtitles
});
```
Example of showing subtitle in div tag
```html
<div id="subtitles"></div>
```
```ecmascript 6
const el = document.getElementById('subtitles');
player.stream$.subscribe(sub => {
  el.innerText = sub;
});
```
### Unsubscribe from stream
```ecmascript 6
const stream = player.stream$.subscribe(sub => {...});
stream.unsubscribe();
```

### Listen to the time stream

```ecmascript 6
player.timeStream$.subscribe(time => {
  // Show time in milliseconds
});
```

### Listen to the event stream

```ecmascript 6
import { events } from 'subtitle-streamer'

player.eventStream$.subscribe(event => {
  if (event === events.STOP) {
    // Do something on stop
  }
});
/* Events:
events.PLAY
events.STOP
events.PAUSE
events.REWIND
events.FORWARD
events.JUMP_TO
 */
```

### Available methods
```ecmascript 6
player.play();
player.pause();
player.stop();
player.forward(); // 5000 milliseconds default
player.forward(10000);
player.rewind(); // 5000 milliseconds default
player.jumpTo(1000);
```

### Available informations

```ecmascript 6
player.isPlaying // boolean
player.endTime // number in milliseconds
```

### Available events
```ecmascript 6
player.isPlaying // boolean
player.endTime // number in milliseconds
```

### React to the events from Video tag

```ecmascript 6
const video = document.querySelector('video');

video.addEventListener('play', (event) => {
  player.jumpTo(video.currentTime * 1000);
});
```
