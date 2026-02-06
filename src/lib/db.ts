import { openDB, DBSchema } from 'idb';

interface MealRecordDB extends DBSchema {
    logs: {
        key: number;
        value: {
            id?: number;
            name: string;
            calories: number;
            protein: number;
            timestamp: number;
            dateStr: string;
        };
        indexes: { 'by-date': string };
    };
    settings: {
        // Key-value store approach: 'dailyCalorieTarget' -> 2000
        key: string;
        value: number;
    };
}

const DB_NAME = 'meal-record-db';
const DB_VERSION = 1;

export async function initDB() {
    return openDB<MealRecordDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('logs')) {
                const store = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
                store.createIndex('by-date', 'dateStr');
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings');
            }
        },
    });
}

export async function addLog(entry: Omit<MealRecordDB['logs']['value'], 'id'>) {
    const db = await initDB();
    return db.add('logs', entry);
}

export async function getLogsByDate(dateStr: string) {
    const db = await initDB();
    return db.getAllFromIndex('logs', 'by-date', dateStr);
}

export async function getTodaySummary(dateStr: string) {
    const logs = await getLogsByDate(dateStr);
    return logs.reduce(
        (acc, log) => ({
            calories: acc.calories + log.calories,
            protein: acc.protein + log.protein,
        }),
        { calories: 0, protein: 0 }
    );
}

export async function getSettings() {
    const db = await initDB();
    const calories = await db.get('settings', 'dailyCalorieTarget');
    const protein = await db.get('settings', 'dailyProteinTarget');

    return {
        dailyCalorieTarget: calories ?? 2000,
        dailyProteinTarget: protein ?? 150,
    };
}

export async function updateSettings(settings: { dailyCalorieTarget?: number; dailyProteinTarget?: number }) {
    const db = await initDB();
    const tx = db.transaction('settings', 'readwrite');

    const promises = [];
    if (settings.dailyCalorieTarget !== undefined) {
        promises.push(tx.store.put(settings.dailyCalorieTarget, 'dailyCalorieTarget'));
    }
    if (settings.dailyProteinTarget !== undefined) {
        promises.push(tx.store.put(settings.dailyProteinTarget, 'dailyProteinTarget'));
    }

    await Promise.all(promises);
    await tx.done;
}
