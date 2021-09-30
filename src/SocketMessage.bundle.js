function chunkUp32(num) {
    const parts = [
        0,
        0,
        0,
        0
    ];
    parts[0] = (num & 2130706432) >> 32;
    parts[1] = (num & 16711680) >> 16;
    parts[2] = (num & 65280) >> 8;
    parts[3] = num & 255;
    return parts;
}
var Events1;
(function(Events) {
    Events["BROADCAST"] = "#$_BC";
    Events["OBJ_SYNC"] = "#$_OBJ_SYNC";
    Events["ERROR"] = "#$_ERR";
})(Events1 || (Events1 = {
}));
class SocketMessage1 {
    raw;
    _sizeOfAll;
    _sizeOfEvent;
    _event;
    _payload;
    dv;
    constructor(incoming){
        this.raw = incoming;
        this.dv = new DataView(incoming.buffer);
    }
    get event() {
        if (this._event) return this._event;
        this._event = new TextDecoder().decode(this.raw.slice(5, 5 + this.sizeOfEvent));
        return this._event;
    }
    get sizeOfMessage() {
        if (this._sizeOfAll) return this._sizeOfAll;
        this._sizeOfAll = this.dv.getUint32(0);
        return this._sizeOfAll;
    }
    get sizeOfEvent() {
        if (this._sizeOfEvent) return this._sizeOfEvent;
        this._sizeOfEvent = this.dv.getUint8(4);
        return this._sizeOfEvent;
    }
    get payload() {
        if (this._payload) return this._payload;
        this._payload = JSON.parse(new TextDecoder().decode(this.raw.slice(5 + this.sizeOfEvent)));
        return this._payload;
    }
    static encode(data) {
        const encoder = new TextEncoder();
        const event = encoder.encode(data.event);
        const payload = encoder.encode(JSON.stringify(data.payload));
        const temp = new Uint8Array(5 + event.length + payload.length);
        temp.set(chunkUp32(temp.length), 0);
        temp[4] = event.length;
        temp.set(event, 5);
        temp.set(payload, 5 + event.length);
        return temp;
    }
    static fromRaw(data) {
        return new SocketMessage1(data);
    }
    static fromBuffer(data) {
        return new SocketMessage1(new Uint8Array(data));
    }
}
export { Events1 as Events };
export { SocketMessage1 as SocketMessage };
