import Observe from "https://raw.githubusercontent.com/duart38/Observe/master/Observe.ts";
/**
 * TODO: add printing with verbosity support
 */
export class Watcher {
  private hash: Observe<string>;
  private dir: string;

  constructor(dir: string) {
    this.hash = new Observe(this.newHash());
    this.dir = dir;
    this.init();
  }

  /**
   * Gets a new random hash
   */
  private newHash(): string {
    return crypto.getRandomValues(new Uint32Array(2)).join("");
  }

  /**
   * top-level await seems to misbehave in constructor..
   * @param x path to watch
   */
  private async init() {
    const watcher = Deno.watchFs(this.dir);
    for await (const event of watcher) {
      this.hash.setValue(this.newHash());
    }
  }

  /**
   * Get the observable value attached to this instance.
   * @see https://github.com/duart38/Observe
   */
  public getObservable(): Observe<string> {
    return this.hash;
  }

  public getHash(): string {
    return this.hash.getValue();
  }

  public directory(): string {
    return this.dir;
  }
}
