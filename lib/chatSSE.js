import { getToken } from "./apiFetch";

/**
 * ChatSSE — Implementasi SSE menggunakan fetch agar bisa menyisipkan Bearer Token.
 * Memberikan pengalaman real-time yang tangguh dengan auto-reconnect.
 *
 * Keamanan: sender_id TIDAK dikirim lewat URL — backend mengambilnya
 * langsung dari Bearer Token sehingga tidak bisa dimanipulasi.
 * Hanya receiver_id yang perlu dikirim sebagai query param.
 */
export class ChatSSE {
  constructor(url, options = {}) {
    this.baseUrl = url.includes('/stream') ? url : url + '/stream';
    this.onMessage = options.onMessage || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    
    this.retryCount = 0;
    this.maxRetries = options.maxRetries || 15;
    this.lastId = 0;
    this.controller = null;
    this.isDeliberatelyClosed = false;
  }

  async connect() {
    this.isDeliberatelyClosed = false;
    this.onStatusChange('connecting');

    try {
      const token = getToken();
      const connectorUrl = new URL(this.baseUrl, window.location.origin);
      if (this.lastId > 0) connectorUrl.searchParams.set('last_id', this.lastId);
      
      this.controller = new AbortController();
      const response = await fetch(connectorUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream'
        },
        signal: this.controller.signal
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      this.onStatusChange('connected');
      this.retryCount = 0;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n\n");
        buffer = lines.pop(); // Simpan baris terakhir yang mungkin belum selesai

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              if (data.id) this.lastId = data.id;
              this.onMessage(data);
            } catch (e) {
              console.error("SSE Parse Error:", e);
            }
          }
        }
      }

    } catch (error) {
      if (!this.isDeliberatelyClosed) {
        console.warn("SSE Connection lost:", error.message);
        this.scheduleReconnect();
      }
    }
  }

  scheduleReconnect() {
    this.onStatusChange('reconnecting');
    if (this.retryCount >= this.maxRetries) {
      this.onStatusChange('failed');
      return;
    }

    const delay = Math.min(1000 * Math.pow(1.5, this.retryCount), 30000);
    this.retryCount++;

    setTimeout(() => {
      if (!this.isDeliberatelyClosed) this.connect();
    }, delay);
  }

  disconnect() {
    this.isDeliberatelyClosed = true;
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    this.onStatusChange('disconnected');
  }
}
