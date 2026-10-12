/**
 * A generic Least Recently Used (LRU) cache implementation.
 * This cache maintains a limited number of items and automatically evicts the least recently used item
 * when the cache reaches its maximum size.
 *
 * @template T The type of values to be stored in the cache
 */
export class LRUCache {
    /** Maximum number of items the cache can hold */
    maxSize;
    /** Internal map to store cache entries with their values and access timestamps */
    cache;
    /**
     * Creates a new LRUCache instance
     * @param {number} [maxSize=1000] - The maximum number of items the cache can hold
     */
    constructor(maxSize = 1000) {
        if (maxSize <= 0) {
            throw new Error('Cache size must be greater than 0');
        }
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    /**
     * Retrieves a value from the cache by its key.
     * Updates the item's position as the most recently used.
     *
     * @param {string} key - The key of the item to retrieve
     * @returns {T | undefined} The cached value, or undefined if not found
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return undefined;
        }
        // Update the timestamp to mark as recently used
        this.cache.delete(key);
        this.cache.set(key, { value: item.value, timestamp: Date.now() });
        return item.value;
    }
    /**
     * Adds or updates a value in the cache.
     * If the key already exists, updates its value and marks it as recently used.
     * If the cache is full, evicts the least recently used item.
     *
     * @param {string} key - The key under which to store the value
     * @param {T} value - The value to store in the cache
     */
    set(key, value) {
        // If key exists, remove it to update the order
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // If we've reached max size, remove the least recently used item
        else if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, { value, timestamp: Date.now() });
    }
    /**
     * Checks if a key exists in the cache.
     * Does not affect the item's position in the LRU order.
     *
     * @param {string} key - The key to check
     * @returns {boolean} True if the key exists in the cache, false otherwise
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Removes an item from the cache by its key.
     *
     * @param {string} key - The key of the item to remove
     * @returns {boolean} True if the item existed and was removed, false otherwise
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Removes all items from the cache.
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Gets the current number of items in the cache.
     *
     * @returns {number} The number of items currently in the cache
     */
    get size() {
        return this.cache.size;
    }
    /**
     * Gets the maximum number of items the cache can hold.
     *
     * @returns {number} The maximum cache size
     */
    getMaxSize() {
        return this.maxSize;
    }
    /**
     * Gets all keys in the cache, ordered from most recently used to least recently used.
     *
     * @returns {string[]} Array of cache keys in order of most to least recently used
     */
    get keys() {
        return Array.from(this.cache.entries())
            .sort((a, b) => b[1].timestamp - a[1].timestamp)
            .map(entry => entry[0]);
    }
}
