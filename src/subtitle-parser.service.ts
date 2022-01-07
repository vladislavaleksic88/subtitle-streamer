export class SubtitleParserService {
  subtitle: string = '';
  pattern = /(\d+)\r?\n([\d:,]+)\s+-{2}\>\s+([\d:,]+)\r?\n([\s\S]*?(?=\n{2}|$))/gm;

  constructor(subtitle: string) {
    this.subtitle = subtitle;
  }

  getParsed(): [number, string][] {
    if (!this.subtitle) {
      return [];
    }
    return [...this.subtitle.matchAll(this.pattern)]
      .map((sub): [[number, string], [number, string]] => [
        [
          this.toMilliseconds(sub[2]),
          sub[4]
        ],
        [
          this.toMilliseconds(sub[3]),
          ''
        ],
      ])
      .flat();
  }

  toMilliseconds(time: string): number {
    const msSplit = time.split(',');
    const milliseconds = parseInt(msSplit[1], 10);
    const otherSplit = msSplit[0].split(':');
    const hours = parseInt(otherSplit[0], 10);
    const minutes = parseInt(otherSplit[1], 10);
    const seconds = parseInt(otherSplit[2], 10);

    return milliseconds
      + seconds * 1000
      + minutes * 60 * 1000
      + hours * 60 * 1000;
  }
}