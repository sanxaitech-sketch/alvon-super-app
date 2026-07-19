/**
 * Alvon Real-time Database (RTDB) Emulator Logic
 * Mimics the exact developer API and logical flow of the official Firebase Real-time Database SDK.
 * Enables reactive pub-sub message delivery and state synchronization.
 */

export interface DatabaseReference {
  path: string;
}

export interface DataSnapshot {
  val: () => any;
  exists: () => boolean;
  key: string | null;
}

export type QueryValueCallback = (snapshot: DataSnapshot) => void;

class FirebaseRTDBEmulator {
  private state: { [key: string]: any } = {};
  private listeners: { [path: string]: QueryValueCallback[] } = {};

  constructor() {
    this.initializeData();
  }

  // Seed default conversations if localStorage is empty
  private initializeData() {
    const saved = localStorage.getItem('alvon_rtdb_emulator');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        return;
      } catch (e) {
        console.error('Failed to parse RTDB cache, re-initializing...', e);
      }
    }

    // Seed dynamic WhatsApp-like chat history
    this.state = {
      'presence': {
        'alvon_bot': { status: 'online', lastActive: Date.now() },
        'sharma_ji': { status: 'online', lastActive: Date.now() - 50000 },
        'chloe_s': { status: 'away', lastActive: Date.now() - 600000 },
        'alex_r': { status: 'offline', lastActive: Date.now() - 3600000 }
      },
      'chats': {
        'alvon_bot': {
          'meta': {
            name: 'Alvon True5G AI Bot 🤖',
            avatar: 'AI',
            role: 'Official Assistant',
            phone: '+91 1800-ALVON-5G',
            verified: true,
            status: 'online'
          },
          'messages': {
            'm1': {
              id: 'm1',
              sender: 'system',
              text: 'Welcome to Alvon Social Chat! Fast, end-to-end simulated secure chats powered by Alvon RTDB logic.',
              timestamp: Date.now() - 1000 * 60 * 60,
              status: 'read'
            },
            'm2': {
              id: 'm2',
              sender: 'alvon_bot',
              text: 'Namaste! I am your Alvon AI assistant. Ask me anything about our supercharged 5G recharges, e-commerce catalog, local CSC services, or general study topics. I am online 24/7! 📶⚡',
              timestamp: Date.now() - 1000 * 60 * 50,
              status: 'read'
            }
          }
        },
        'sharma_ji': {
          'meta': {
            name: 'Sharma Ji Kirana Store 🛒',
            avatar: 'SK',
            role: 'Alvon Mart Partner',
            phone: '+91 91112 22333',
            verified: true,
            status: 'online'
          },
          'messages': {
            'm1': {
              id: 'm1',
              sender: 'sharma_ji',
              text: 'Aadarniya customer, your Alvon Mart order #ALV-9902 for 5kg Basmati and organic Ghee has been packed! 🌾📦',
              timestamp: Date.now() - 1000 * 60 * 120,
              status: 'read'
            },
            'm2': {
              id: 'm2',
              sender: 'sharma_ji',
              text: 'Our delivery agent is leaving the shop. Please keep Alvon Pay barcode or Cash-In coins ready.',
              timestamp: Date.now() - 1000 * 60 * 115,
              status: 'read'
            }
          }
        },
        'chloe_s': {
          'meta': {
            name: 'Chloe Simmons 🥑',
            avatar: 'CS',
            role: 'Seattle Influencer',
            phone: '+1 (555) 901-2182',
            verified: false,
            status: 'away'
          },
          'messages': {
            'm1': {
              id: 'm1',
              sender: 'chloe_s',
              text: 'Hey there! Loved your latest post on Alvon Social. Those 5G router speeds are absolutely mind-blowing!',
              timestamp: Date.now() - 1000 * 60 * 360,
              status: 'read'
            }
          }
        },
        'alex_r': {
          'meta': {
            name: 'Alex Rivera 📶',
            avatar: 'AR',
            role: 'GigaNetwork Engineer',
            phone: '+1 (555) 124-9981',
            verified: true,
            status: 'offline'
          },
          'messages': {
            'm1': {
              id: 'm1',
              sender: 'alex_r',
              text: 'Hey! We just completed the high-speed cell tower optimization near CP block. Rechecking signal telemetry now.',
              timestamp: Date.now() - 1000 * 60 * 720,
              status: 'read'
            }
          }
        }
      }
    };
    this.persist();
  }

  private persist() {
    localStorage.setItem('alvon_rtdb_emulator', JSON.stringify(this.state));
  }

  // Traverses object tree using slash-separated path
  private getValueByPath(path: string): any {
    const parts = path.split('/').filter(p => p !== '');
    let current = this.state;
    for (const part of parts) {
      if (current === null || typeof current !== 'object') return undefined;
      current = current[part];
    }
    return current;
  }

  // Sets value at path and notifies listeners
  private setValueByPath(path: string, value: any) {
    const parts = path.split('/').filter(p => p !== '');
    if (parts.length === 0) {
      this.state = value;
      this.notifyAll();
      this.persist();
      return;
    }

    let current = this.state;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    if (value === null) {
      delete current[lastPart];
    } else {
      current[lastPart] = value;
    }

    this.notifyAll();
    this.persist();
  }

  private notifyAll() {
    Object.keys(this.listeners).forEach(path => {
      const value = this.getValueByPath(path);
      const snapshot: DataSnapshot = {
        val: () => value,
        exists: () => value !== undefined && value !== null,
        key: path.split('/').pop() || null
      };
      this.listeners[path].forEach(cb => cb(snapshot));
    });
  }

  // Developer APIs
  public ref(path: string): DatabaseReference {
    return { path };
  }

  public onValue(reference: DatabaseReference, callback: QueryValueCallback) {
    const path = reference.path;
    if (!this.listeners[path]) {
      this.listeners[path] = [];
    }
    this.listeners[path].push(callback);

    // Immediate execution with initial value
    const value = this.getValueByPath(path);
    const snapshot: DataSnapshot = {
      val: () => value,
      exists: () => value !== undefined && value !== null,
      key: path.split('/').pop() || null
    };
    callback(snapshot);
  }

  public off(reference: DatabaseReference, callback?: QueryValueCallback) {
    const path = reference.path;
    if (!this.listeners[path]) return;
    if (callback) {
      this.listeners[path] = this.listeners[path].filter(cb => cb !== callback);
    } else {
      delete this.listeners[path];
    }
  }

  public set(reference: DatabaseReference, value: any): Promise<void> {
    return new Promise((resolve) => {
      this.setValueByPath(reference.path, value);
      resolve();
    });
  }

  public push(reference: DatabaseReference, value: any = null): { ref: DatabaseReference; key: string } {
    const pushKey = '-RTDB_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const itemPath = `${reference.path}/${pushKey}`;
    const newRef = this.ref(itemPath);
    if (value !== null) {
      this.setValueByPath(itemPath, value);
    }
    return { ref: newRef, key: pushKey };
  }

  public update(reference: DatabaseReference, values: { [key: string]: any }): Promise<void> {
    return new Promise((resolve) => {
      const currentPath = reference.path;
      Object.keys(values).forEach(key => {
        const fullPath = currentPath === '' ? key : `${currentPath}/${key}`;
        this.setValueByPath(fullPath, values[key]);
      });
      resolve();
    });
  }
}

export const rtdb = new FirebaseRTDBEmulator();

// Mock standard export aliases for seamless codebase transitions
export function getDatabase() {
  return rtdb;
}

export function ref(db: any, path: string): DatabaseReference {
  return rtdb.ref(path);
}

export function onValue(reference: DatabaseReference, callback: QueryValueCallback) {
  rtdb.onValue(reference, callback);
  // Return unsubscribe handler
  return () => rtdb.off(reference, callback);
}

export function set(reference: DatabaseReference, value: any): Promise<void> {
  return rtdb.set(reference, value);
}

export function push(reference: DatabaseReference, value: any = null) {
  return rtdb.push(reference, value);
}

export function update(reference: DatabaseReference, values: { [key: string]: any }): Promise<void> {
  return rtdb.update(reference, values);
}
