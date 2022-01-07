import { concatMap, delay, from, interval, of, Subject, Subscription } from "rxjs";
import { SubtitleParserService } from "./subtitle-parser.service";
import { events } from './constants/events';

export class Player {
  stream$: Subject<string>;
  timeStream$: Subject<number>;
  eventStream$: Subject<string>;
  subtitles: [number, string][] = [];
  endTime: number = 0;
  pausedAt: number = 0;
  isPlaying = false;
  private startTime: number;
  private subtitleStream: Subscription;
  private timeStream: Subscription;

  constructor() {
    this.stream$ = new Subject<string>();
    this.timeStream$ = new Subject<number>();
    this.eventStream$ = new Subject<string>();
    this.updateStartTime();
  }

  play() {
    this.updateStartTime();
    if (this.isAtTheEnd()) {
      return;
    }
    this.refreshStreams();
    this.subscribeToSubtitleStream();
    this.subscribeToTimeStream();
    this.emitEvent(events.PLAY);
    this.isPlaying = true;
  }

  updateStartTime() {
    if (this.isPaused()) {
      this.startTime = Date.now() - this.pausedAt;
      this.pausedAt = 0;
    } else {
      this.startTime = Date.now();
    }
  }

  isPaused(): boolean {
    return this.pausedAt > 0;
  }

  isAtTheEnd(): boolean {
    return this.currentTime >= this.endTime;
  }

  refreshStreams() {
    this.stream$.next('');
    const time = this.isPaused() ? this.pausedAt : this.currentTime;
    this.timeStream$.next(time);
  }

  subscribeToSubtitleStream() {
    this.subtitleStream = this.createSubtitleStream().subscribe({
      next: sub => this.stream$.next(sub),
      complete: () => this.stop(),
      error: () => this.stop(),
    });
  }

  subscribeToTimeStream() {
    this.timeStream = interval(1000).subscribe(() => {
      this.timeStream$.next(this.currentTime);
    });
  }

  emitEvent(event: string) {
    this.eventStream$.next(event);
  }

  loadSubtitles(subtitle) {
    this.subtitles = (new SubtitleParserService(subtitle)).getParsed();
    this.setEndTime();
  }

  stop() {
    this.unsubscribeFromSubtitleStream();
    this.refreshStreams();
    this.emitEvent(events.STOP);
    this.isPlaying = false;
  }

  pause() {
    this.updatePausedAt(this.currentTime);
    this.unsubscribeFromSubtitleStream();
    this.emitEvent(events.PAUSE);
    this.isPlaying = false;
  }

  rewind(ms: number = 5000) {
    this.jumpTo(this.currentTime - ms, events.REWIND);
  }

  forward(ms: number = 5000) {
    this.jumpTo(this.currentTime + ms, events.FORWARD);
  }

  jumpTo(ms: number, event?: string) {
    if (!ms) {
      return;
    }
    this.updatePausedAt(ms);
    this.unsubscribeFromSubtitleStream();
    this.emitEvent(event || events.JUMP_TO);
    this.resume();
  }

  resume() {
    if (this.isPlaying && !this.isAtTheEnd()) {
      this.play();
    } else if (this.isPlaying && this.isAtTheEnd()) {
      this.stop();
    } else {
      this.refreshStreams();
    }
  }

  updatePausedAt(startFrom: number) {
    if (startFrom < 0) {
      this.pausedAt = 0;
    } else if (startFrom >= this.endTime) {
      this.pausedAt = this.endTime;
    } else {
      this.pausedAt = startFrom;
    }
  }

  unsubscribeFromSubtitleStream() {
    if (this.subtitleStream) {
      this.subtitleStream.unsubscribe();
    }
    if (this.timeStream) {
      this.timeStream.unsubscribe();
    }
  }

  setEndTime() {
    const lastSubtitle = this.subtitles.length ? this.subtitles[this.subtitles.length - 1] : null;
    this.endTime = lastSubtitle ? lastSubtitle[0] : 0;
    this.refreshStreams();
  }

  createSubtitleStream() {
    const currentTime = this.currentTime;

    return from(this.subtitles.filter(subtitle => subtitle[0] > currentTime))
      .pipe(
        concatMap(sub => {
          return of(sub[1]).pipe(delay(sub[0] - this.currentTime))
        })
      );
  }

  get currentTime(): number {
    return Date.now() - this.startTime;
  }
}
