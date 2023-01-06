'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AudioTrack = require('./audiotrack');
var mixinLocalMediaTrack = require('./localmediatrack');
var LocalMediaAudioTrack = mixinLocalMediaTrack(AudioTrack);
/**
 * A {@link LocalAudioTrack} is an {@link AudioTrack} representing audio that
 * your {@link LocalParticipant} can publish to a {@link Room}. It can be
 * enabled and disabled with {@link LocalAudioTrack#enable} and
 * {@link LocalAudioTrack#disable} or stopped completely with
 * {@link LocalAudioTrack#stop}.
 * @extends AudioTrack
 * @property {Track.ID} id - The {@link LocalAudioTrack}'s ID
 * @property {boolean} isMuted - Whether or not the audio source has stopped sending samples to the
 *   {@link LocalAudioTrack}; This can happen when the microphone is taken over by another application,
 *   mainly on mobile devices; When this property toggles, then <code>muted</code> and <code>unmuted</code>
 *   events are fired appropriately
 * @property {boolean} isStopped - Whether or not the {@link LocalAudioTrack} is
 *   stopped
 * @property {NoiseCancellation?} noiseCancellation - When a LocalAudioTrack is created
 *   with {@link NoiseCancellationOptions}, this property provides interface
 *   to enable or disable the noise cancellation at runtime.
 * @emits LocalAudioTrack#disabled
 * @emits LocalAudioTrack#enabled
 * @emits LocalAudioTrack#muted
 * @emits LocalAudioTrack#started
 * @emits LocalAudioTrack#stopped
 * @emits LocalAudioTrack#unmuted
 */
var LocalAudioTrack = /** @class */ (function (_super) {
    __extends(LocalAudioTrack, _super);
    /**
     * Construct a {@link LocalAudioTrack} from a MediaStreamTrack.
     * @param {MediaStreamTrack} mediaStreamTrack - An audio MediaStreamTrack
     * @param {LocalTrackOptions} [options] - {@link LocalTrack} options
     */
    function LocalAudioTrack(mediaStreamTrack, options) {
        var _this = this;
        var noiseCancellation = (options === null || options === void 0 ? void 0 : options.noiseCancellation) || null;
        _this = _super.call(this, mediaStreamTrack, options) || this;
        Object.defineProperties(_this, {
            noiseCancellation: {
                enumerable: true,
                value: noiseCancellation,
                writable: false
            },
        });
        return _this;
    }
    LocalAudioTrack.prototype.toString = function () {
        return "[LocalAudioTrack #" + this._instanceId + ": " + this.id + "]";
    };
    LocalAudioTrack.prototype.attach = function (el) {
        el = _super.prototype.attach.call(this, el);
        el.muted = true;
        return el;
    };
    /**
     * @private
     */
    LocalAudioTrack.prototype._end = function () {
        return _super.prototype._end.apply(this, arguments);
    };
    /**
     * @private
     */
    LocalAudioTrack.prototype._reacquireTrack = function (constraints) {
        var _this = this;
        this._log.debug('_reacquireTrack: ', constraints);
        if (this.noiseCancellation) {
            return this.noiseCancellation.reacquireTrack(function () {
                return _super.prototype._reacquireTrack.call(_this, constraints);
            });
        }
        return _super.prototype._reacquireTrack.call(this, constraints);
    };
    /**
     * @private
     */
    LocalAudioTrack.prototype._restartDefaultDevice = function () {
        var _this = this;
        var constraints = Object.assign({}, this._constraints);
        var restartConstraints = Object.assign({}, constraints, { deviceId: this._currentDefaultDeviceInfo.deviceId });
        return this.restart(restartConstraints).then(function () {
            // NOTE(mmalavalli): Since we used the new default device's ID while restarting the LocalAudioTrack,
            // we reset the constraints to the original constraints so that the default device detection logic in
            // _maybeRestartOnDefaultDeviceChange() still works.
            _this._constraints = constraints;
            _this._maybeRestartOnDefaultDeviceChange();
        });
    };
    /**
     * Disable the {@link LocalAudioTrack}. This is equivalent to muting the audio source.
     * @returns {this}
     * @fires LocalAudioTrack#disabled
     */
    LocalAudioTrack.prototype.disable = function () {
        return _super.prototype.disable.apply(this, arguments);
    };
    /**
     * Enable the {@link LocalAudioTrack}. This is equivalent to unmuting the audio source.
     * @returns {this}
     * @fires LocalAudioTrack#enabled
    */ /**
     * Enable or disable the {@link LocalAudioTrack}. This is equivalent to unmuting or muting
     * the audio source respectively.
     * @param {boolean} [enabled] - Specify false to disable the
     *   {@link LocalAudioTrack}
     * @returns {this}
     * @fires LocalAudioTrack#disabled
     * @fires LocalAudioTrack#enabled
     */
    LocalAudioTrack.prototype.enable = function () {
        return _super.prototype.enable.apply(this, arguments);
    };
    /**
     * Restart the {@link LocalAudioTrack}. This stops the existing MediaStreamTrack
     * and creates a new MediaStreamTrack. If the {@link LocalAudioTrack} is being published
     * to a {@link Room}, then all the {@link RemoteParticipant}s will start receiving media
     * from the newly created MediaStreamTrack. You can access the new MediaStreamTrack via
     * the <code>mediaStreamTrack</code> property. If you want to listen to events on
     * the MediaStreamTrack directly, please do so in the "started" event handler. Also,
     * the {@link LocalAudioTrack}'s ID is no longer guaranteed to be the same as the
     * underlying MediaStreamTrack's ID.
     * @param {MediaTrackConstraints} [constraints] - The optional <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints" target="_blank">MediaTrackConstraints</a>
     *   for restarting the {@link LocalAudioTrack}; If not specified, then the current MediaTrackConstraints
     *   will be used; If <code>{}</code> (empty object) is specified, then the default MediaTrackConstraints
     *   will be used
     * @returns {Promise<void>} Rejects with a TypeError if the {@link LocalAudioTrack} was not created
     *   using an one of <code>createLocalAudioTrack</code>, <code>createLocalTracks</code> or <code>connect</code>;
     *   Also rejects with the <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Exceptions" target="_blank">DOMException</a>
     *   raised by <code>getUserMedia</code> when it fails
     * @fires LocalAudioTrack#stopped
     * @fires LocalAudioTrack#started
     * @example
     * const { connect, createLocalAudioTrack } = require('twilio-video');
     *
     * // Create a LocalAudioTrack that captures audio from a USB microphone.
     * createLocalAudioTrack({ deviceId: 'usb-mic-id' }).then(function(localAudioTrack) {
     *   return connect('token', {
     *     name: 'my-cool-room',
     *     tracks: [localAudioTrack]
     *   });
     * }).then(function(room) {
     *   // Restart the LocalAudioTrack to capture audio from the default microphone.
     *   const localAudioTrack = Array.from(room.localParticipant.audioTracks.values())[0].track;
     *   return localAudioTrack.restart({ deviceId: 'default-mic-id' });
     * });
     */
    LocalAudioTrack.prototype.restart = function () {
        return _super.prototype.restart.apply(this, arguments);
    };
    /**
     * Calls stop on the underlying MediaStreamTrack. If you choose to stop a
     * {@link LocalAudioTrack}, you should unpublish it after stopping.
     * @returns {this}
     * @fires LocalAudioTrack#stopped
     */
    LocalAudioTrack.prototype.stop = function () {
        if (this.noiseCancellation) {
            this.noiseCancellation.stop();
        }
        return _super.prototype.stop.apply(this, arguments);
    };
    return LocalAudioTrack;
}(LocalMediaAudioTrack));
/**
 * The {@link LocalAudioTrack} was disabled, i.e. the audio source was muted by the user.
 * @param {LocalAudioTrack} track - The {@link LocalAudioTrack} that was
 *   disabled
 * @event LocalAudioTrack#disabled
 */
/**
 * The {@link LocalAudioTrack} was enabled, i.e. the audio source was unmuted by the user.
 * @param {LocalAudioTrack} track - The {@link LocalAudioTrack} that was enabled
 * @event LocalAudioTrack#enabled
 */
/**
 * The {@link LocalAudioTrack} was muted because the audio source stopped sending samples, most
 * likely due to another application taking said audio source, especially on mobile devices.
 * @param {LocalAudioTrack} track - The {@link LocalAudioTrack} that was muted
 * @event LocalAudioTrack#muted
 */
/**
 * The {@link LocalAudioTrack} started. This means there is enough audio data to
 * begin playback.
 * @param {LocalAudioTrack} track - The {@link LocalAudioTrack} that started
 * @event LocalAudioTrack#started
 */
/**
 * The {@link LocalAudioTrack} stopped, either because {@link LocalAudioTrack#stop}
 * or {@link LocalAudioTrack#restart} was called or because the underlying
 * MediaStreamTrack ended.
 * @param {LocalAudioTrack} track - The {@link LocalAudioTrack} that stopped
 * @event LocalAudioTrack#stopped
 */
/**
 * The {@link LocalAudioTrack} was unmuted because the audio source resumed sending samples,
 * most likely due to the application that took over the said audio source has released it
 * back to the application, especially on mobile devices. This event is also fired when
 * {@link LocalAudioTrack#restart} is called on a muted {@link LocalAudioTrack} with a
 * new audio source.
 * @param {LocalAudioTrack} track - The {@link LocalAudioTrack} that was unmuted
 * @event LocalAudioTrack#unmuted
 */
module.exports = LocalAudioTrack;
//# sourceMappingURL=localaudiotrack.js.map