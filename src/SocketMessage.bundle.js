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
let EventType1;
(function(EventType) {
    EventType[EventType["MESSAGE"] = 0] = "MESSAGE";
    EventType[EventType["BROADCAST"] = 1] = "BROADCAST";
    EventType[EventType["AUTH"] = 2] = "AUTH";
    EventType[EventType["SYNC"] = 3] = "SYNC";
    EventType[EventType["ERROR"] = 4] = "ERROR";
    EventType[EventType["NOT_FOUND"] = 5] = "NOT_FOUND";
    EventType[EventType["CUSTOM_1"] = 6] = "CUSTOM_1";
    EventType[EventType["CUSTOM_2"] = 7] = "CUSTOM_2";
    EventType[EventType["CUSTOM_3"] = 8] = "CUSTOM_3";
    EventType[EventType["CUSTOM_4"] = 9] = "CUSTOM_4";
    EventType[EventType["CUSTOM_5"] = 10] = "CUSTOM_5";
})(EventType1 || (EventType1 = {
}));
class SocketMessage1 {
    raw;
    _eventType;
    _sizeOfAll;
    _sizeOfEvent;
    _event;
    _payload;
    dv;
    constructor(incoming){
        this.raw = incoming;
        this.dv = new DataView(incoming.buffer);
    }
    get eventType() {
        if (this._eventType) return this._eventType;
        this._eventType = this.dv.getUint8(4);
        return this._eventType;
    }
    get event() {
        if (this._event) return this._event;
        this._event = new TextDecoder().decode(this.raw.slice(6, 6 + this.sizeOfEvent));
        return this._event;
    }
    get sizeOfMessage() {
        if (this._sizeOfAll) return this._sizeOfAll;
        this._sizeOfAll = this.dv.getUint32(0);
        return this._sizeOfAll;
    }
    get sizeOfEvent() {
        if (this._sizeOfEvent) return this._sizeOfEvent;
        this._sizeOfEvent = this.dv.getUint8(5);
        return this._sizeOfEvent;
    }
    get payload() {
        if (this._payload) return this._payload;
        this._payload = JSON.parse(new TextDecoder().decode(this.raw.slice(6 + this.sizeOfEvent)));
        return this._payload;
    }
    free() {
        Object.keys(this).forEach((k)=>this[k] = null
        );
    }
    _resetGetters() {
        this._eventType = undefined;
        this._sizeOfAll = undefined;
        this._sizeOfEvent = undefined;
        this._event = undefined;
        this._payload = undefined;
    }
    syncIncoming(msg) {
        const message = SocketMessage1.fromRaw(msg);
        if (message.eventType === EventType1.SYNC) {
            const incomingPayload = message.payload;
            const sizeDifference = incomingPayload[0][0];
            incomingPayload.shift();
            const hasNewSize = sizeDifference !== 0;
            const newRaw = hasNewSize ? new Uint8Array(this.raw.length + sizeDifference) : this.raw;
            if (hasNewSize) {
                newRaw.set(this.raw.slice(0, newRaw.length < this.raw.length ? newRaw.length : this.raw.length), 0);
            }
            incomingPayload.forEach((instr)=>{
                const pos = instr.shift();
                newRaw.set(instr, pos);
            });
            if (hasNewSize) {
                this.raw = newRaw;
                this.dv = new DataView(newRaw.buffer);
            }
            this._resetGetters();
        }
    }
    static encode(data) {
        const encoder = new TextEncoder();
        const event = encoder.encode(data.event);
        const payload = encoder.encode(JSON.stringify(data.payload));
        const temp = new Uint8Array(6 + event.length + payload.length);
        temp.set(chunkUp32(temp.length), 0);
        temp[4] = data.type || EventType1.MESSAGE;
        temp[5] = event.length;
        temp.set(event, 6);
        temp.set(payload, 6 + event.length);
        return temp;
    }
    static fromRaw(data) {
        return new SocketMessage1(data);
    }
    static fromBuffer(data) {
        return new SocketMessage1(new Uint8Array(data));
    }
}
export { EventType1 as EventType,  };
export { SocketMessage1 as SocketMessage };
