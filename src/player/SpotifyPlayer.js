export class SpotifyPlayer {
  constructor(auth, playerName = "iPod") {
    this.auth = auth;
    this.playerName = playerName;
    this.player = null;
    this.deviceId = null;
    this.isReady = false;
    this.eventHandlers = new Map();
  }

  async initialize() {
    if (this.player) {
      console.log("Player already initialized");
      return;
    }

    try {
      const token = await this.auth.getValidToken();

      if (!window.Spotify) {
        throw new Error("Spotify SDK not loaded");
      }

      this.player = new Spotify.Player({
        name: this.playerName,
        getOAuthToken: async (cb) => {
          const token = await this.auth.getValidToken();
          cb(token);
        },
        volume: 0.5,
      });

      // Setup listeners before connecting
      this.setupEventListeners();

      // Connect to the player
      const connected = await this.player.connect();
      if (!connected) {
        throw new Error("Failed to connect to Spotify SDK");
      }
    } catch (error) {
      this.player = null;
      console.error("Player initialization failed:", error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.player) return;

    // Device Ready
    this.player.addListener("ready", ({ device_id }) => {
      this.deviceId = device_id;
      this.isReady = true;
      this.emit("ready", { device_id });
    });

    // Device Offline
    this.player.addListener("not_ready", ({ device_id }) => {
      this.isReady = false;
      this.emit("not_ready", { device_id });
    });

    // Error handling
    this.player.addListener("initialization_error", ({ message }) => {
      this.emit("error", { type: "initialization", message });
    });

    this.player.addListener("authentication_error", ({ message }) => {
      this.emit("error", { type: "authentication", message });
    });

    this.player.addListener("account_error", ({ message }) => {
      this.emit("error", { type: "account", message });
    });

    // Playback status
    this.player.addListener("player_state_changed", (state) => {
      this.emit("state_changed", state);
    });
  }

  on(eventName, callback) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName).add(callback);
  }

  emit(eventName, data) {
    if (this.eventHandlers.has(eventName)) {
      this.eventHandlers.get(eventName).forEach((callback) => callback(data));
    }
  }

  getDeviceId() {
    return this.deviceId;
  }
}
