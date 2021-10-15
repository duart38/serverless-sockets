import Observe from "https://raw.githubusercontent.com/duart38/Observe/master/Observe.ts";
import { Log, LogLevel } from "../components/Log.ts";

export class Watcher {
  /**
   * Global folder hash.
   */
  private hash: Observe<string>;
  /**
   * The working directory of the watcher
   */
  private dir: string;
  /**
   * The files along with their active hashes.
   */
  private files: Map<string, string>;

  constructor(dir: string) {
    this.hash = new Observe(this.newHash());
    this.files = new Map();
    this.dir = dir;
    this.preLoadDir(this.dir);
    this.init();
  }
  /**
   * Preloads the directory hashes. this could potentially speed up the first connection as the hash has already been calculated.
   * @param dir the directory to preload from.
   */
  private preLoadDir(dir: string){
    for(const {isFile, name} of Deno.readDirSync(dir)){
      if(isFile) {
        Log.info({level: LogLevel.high, message: `[+] Generating file hash for: ${dir}/${name}`})
        const file = this._sanitizeIncoming(name);
        this.files.set(file, this.newHash());
      }else{
        this.preLoadDir(`${dir}/${name}`)
      }
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

  /**
   * Handles the filesystem event. This method deals with making new hashes for files that have changed but also removing files if the event indicates such.
   * @param ev the FSEvent.
   */
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
        this.files.delete(path);
        break;
      }
    }
  }
  /**
   * Sanitises incoming strings to ensure they are valid file names.
   * @param x the string
   * @returns the new modified string
   */
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

  /**
   * Checks if the Watchers storage contains a file.
   * @param fn the file string
   */
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
