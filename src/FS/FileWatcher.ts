import Observe from "https://raw.githubusercontent.com/duart38/Observe/master/Observe.ts";
/**
 * TODO: add printing with verbosity support
 */
export class Watcher {
  private hash: Observe<string>;
  private dir: string;
  private files: Map<string, string>;

  constructor(dir: string) {
    this.hash = new Observe(this.newHash());
    this.files = new Map();
    this.dir = dir;
    this.preLoadDir(this.dir);
    this.init();
  }
  private preLoadDir(dir: string){
    for(const {isFile, name} of Deno.readDirSync(dir)){
      if(isFile) {
        const file = this._sanitizeIncoming(name);
        this.files.set(file, this.newHash());
      }
      // TODO: pre-load sub-directories
    }
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
    for await (const _event of watcher) {
      this.hash.setValue(this.newHash());
      this.handleFsEvent(_event);
    }
  }
  private handleFsEvent(ev: Deno.FsEvent){
    const path = ev.paths[0].replace(Deno.realPathSync(this.dir), "");
    switch(ev.kind){
      case "modify": {
        // OSX file deletion patch
        Deno.stat(ev.paths[0]).catch(()=> this.files.delete(path));
        this.files.set(path, this.newHash());
        break;
      }
      case "create": 
      case "remove": {
        // TODO: does not seem to work on OSX
        this.files.delete(path);
        break;
      }
    }
  }
  private _sanitizeIncoming(x:string){
    return `${x.startsWith("/") ? "" : "/"}${x}${x.endsWith(".ts") ? "" : ".ts"}`
  }

  /**
   * Get the observable value attached to this instance.
   * @see https://github.com/duart38/Observe
   */
  public getObservable(): Observe<string> {
    return this.hash;
  }

  /**
   * Gets the hash of the entire filewatcher. this hash is updated every time any event happens
   */
  public getHash(): string {
    return this.hash.getValue();
  }

  /**
   * Gets the hash of a single file
   * @param file the name of the file (including prepended directory pathway)
   */
  public getFileHash(file: string): string {
    file = `${file.startsWith("/") ? "" : "/"}${file}${file.endsWith(".ts") ? "" : ".ts"}`
    return this.files.get(file) || this.getHash();
  }

  /**
   * Returns the path, as is, to the directory that this fileWatcher is register to watch.
   */
  public directory(): string {
    return this.dir;
  }

  public containsFile(fn: string){
    return this.files.has(this._sanitizeIncoming(fn));
  }

  /**
   * Returns the full path to the directory this fileWatcher is register to watch.
   * @see {Deno.realPathSync}
   */
  public fullDirectory(): string {
    return Deno.realPathSync(this.dir);
  }
}
