"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var YouTubeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const youtube_sr_1 = __importDefault(require("youtube-sr"));
let YouTubeService = YouTubeService_1 = class YouTubeService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(YouTubeService_1.name);
        this.CACHE_TTL_MS = 5 * 60 * 1000;
        this.SEARCH_VARIANTS = ['karaoke', 'instrumental', 'lyrics', 'pista', 'off vocal'];
        this.searchCache = new Map();
        this.healthyInvidiousNodes = [];
        this.healthyPipedNodes = [];
        this.lastHealthCheck = 0;
        this.healthCheckPromise = null;
        const defaultInvidious = [
            'https://inv.zoomerville.com',
            'https://inv.nadeko.net',
            'https://invidious.nerdvpn.de',
            'https://invidious.f5.si',
            'https://yt.chocolatemoo53.com',
            'https://invidious.tiekoetter.com',
        ];
        const defaultPiped = [
            'https://pipedapi.kavin.rocks',
            'https://pipedapi.adminforge.de',
            'https://api.piped.yt',
            'https://pipedapi.leptons.xyz',
            'https://pipedapi.nosebs.ru',
            'https://pipedapi-libre.kavin.rocks',
            'https://piped-api.privacy.com.de',
            'https://pipedapi.drgns.space',
            'https://pipedapi.owo.si',
            'https://pipedapi.ducks.party',
            'https://piped-api.codespace.cz',
            'https://pipedapi.reallyaweso.me',
            'https://api.piped.private.coffee',
            'https://pipedapi.darkness.services',
            'https://pipedapi.orangenet.cc',
        ];
        this.INVIDIOUS_NODES = this.parseNodeList(this.configService.get('INVIDIOUS_NODES'), defaultInvidious);
        this.PIPED_NODES = this.parseNodeList(this.configService.get('PIPED_NODES'), defaultPiped);
        this.YOUTUBE_API_KEY = this.configService.get('YOUTUBE_API_KEY')?.trim();
        if (this.YOUTUBE_API_KEY) {
            this.logger.log('[YouTube Data API v3] API key configurada, disponible como fallback.');
        }
    }
    parseNodeList(value, fallback) {
        if (!value || !value.trim())
            return fallback;
        return value
            .split(',')
            .map((n) => n.trim())
            .filter((n) => n.startsWith('http'));
    }
    async onModuleInit() {
        this.checkNodes().catch(() => { });
    }
    async checkNodes() {
        if (this.healthCheckPromise)
            return this.healthCheckPromise;
        this.healthCheckPromise = (async () => {
            const now = Date.now();
            this.logger.log('[HealthCheck] Verificando nodos de rescate con búsqueda real...');
            const checkInvidiousNode = async (url) => {
                const start = Date.now();
                try {
                    const res = await fetch(`${url}/api/v1/search?q=rick+astley+never&limit=1`, {
                        signal: AbortSignal.timeout(10000),
                    });
                    if (!res.ok)
                        return { url, latency: Infinity, healthy: false };
                    const data = await res.json();
                    const hasResults = Array.isArray(data) && data.length > 0 && data[0].videoId;
                    return { url, latency: Date.now() - start, healthy: hasResults };
                }
                catch {
                    return { url, latency: Infinity, healthy: false };
                }
            };
            const checkPipedNode = async (url) => {
                const start = Date.now();
                try {
                    const res = await fetch(`${url}/search?q=rick+astley+never&filter=videos&limit=1`, {
                        signal: AbortSignal.timeout(10000),
                    });
                    if (!res.ok)
                        return { url, latency: Infinity, healthy: false };
                    const data = await res.json();
                    const hasResults = Array.isArray(data?.items) && data.items.length > 0;
                    return { url, latency: Date.now() - start, healthy: hasResults };
                }
                catch {
                    return { url, latency: Infinity, healthy: false };
                }
            };
            const [invidious, piped] = await Promise.all([
                Promise.all(this.INVIDIOUS_NODES.map((n) => checkInvidiousNode(n))),
                Promise.all(this.PIPED_NODES.map((n) => checkPipedNode(n))),
            ]);
            this.healthyInvidiousNodes = invidious
                .filter((n) => n.healthy)
                .sort((a, b) => a.latency - b.latency);
            this.healthyPipedNodes = piped
                .filter((n) => n.healthy)
                .sort((a, b) => a.latency - b.latency);
            this.lastHealthCheck = now;
            this.logger.log(`[HealthCheck] Invidious: ${this.healthyInvidiousNodes.length}/${this.INVIDIOUS_NODES.length} vivos. Piped: ${this.healthyPipedNodes.length}/${this.PIPED_NODES.length} vivos.`);
        })();
        try {
            await this.healthCheckPromise;
        }
        finally {
            this.healthCheckPromise = null;
        }
    }
    async refreshNodesFromPublicLists() {
        this.logger.log('[RefreshNodes] Consultando listas oficiales...');
        const newInvidious = [];
        const newPiped = [];
        try {
            const invRes = await fetch('https://api.invidious.io/', { signal: AbortSignal.timeout(10000) });
            if (invRes.ok) {
                const html = await invRes.text();
                const matches = html.matchAll(/href="(https?:\/\/[^"]+)"/g);
                for (const match of matches) {
                    const url = match[1].replace(/\/$/, '');
                    if (url.startsWith('http') && !url.includes('onion') && !url.includes('i2p') && !url.includes('ygg')) {
                        if (!newInvidious.includes(url))
                            newInvidious.push(url);
                    }
                }
            }
        }
        catch (e) {
            this.logger.warn('[RefreshNodes] No se pudo obtener lista Invidious:', e.message);
        }
        try {
            const pipedRes = await fetch('https://raw.githubusercontent.com/TeamPiped/documentation/main/content/docs/public-instances/index.md', { signal: AbortSignal.timeout(10000) });
            if (pipedRes.ok) {
                const text = await pipedRes.text();
                const matches = text.matchAll(/\|\s*([^|]+)\s*\|\s*(https:\/\/[^\s|]+)\s*\|/g);
                for (const match of matches) {
                    const url = match[2].replace(/\/$/, '');
                    if (url.startsWith('https://pipedapi') || url.startsWith('https://api.piped')) {
                        if (!newPiped.includes(url))
                            newPiped.push(url);
                    }
                }
            }
        }
        catch (e) {
            this.logger.warn('[RefreshNodes] No se pudo obtener lista Piped:', e.message);
        }
        if (newInvidious.length > 0) {
            this.INVIDIOUS_NODES = newInvidious;
        }
        if (newPiped.length > 0) {
            this.PIPED_NODES = newPiped;
        }
        await this.checkNodes();
        return {
            invidious: this.INVIDIOUS_NODES,
            piped: this.PIPED_NODES,
        };
    }
    async getInvidiousNodes() {
        if (this.healthyInvidiousNodes.length > 0 && Date.now() - this.lastHealthCheck < 60000) {
            return this.healthyInvidiousNodes.map((n) => n.url);
        }
        this.checkNodesWithTimeout(15000).catch(() => { });
        return this.healthyInvidiousNodes.length > 0
            ? this.healthyInvidiousNodes.map((n) => n.url)
            : this.INVIDIOUS_NODES;
    }
    async getPipedNodes() {
        if (this.healthyPipedNodes.length > 0 && Date.now() - this.lastHealthCheck < 60000) {
            return this.healthyPipedNodes.map((n) => n.url);
        }
        this.checkNodesWithTimeout(15000).catch(() => { });
        return this.healthyPipedNodes.length > 0
            ? this.healthyPipedNodes.map((n) => n.url)
            : this.PIPED_NODES;
    }
    async checkNodesWithTimeout(ms) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Health check timeout')), ms);
            this.checkNodes()
                .then(() => {
                clearTimeout(timer);
                resolve();
            })
                .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
        });
    }
    getCacheKey(query, isUnrestricted) {
        return `${query}:${isUnrestricted ? '1' : '0'}`;
    }
    getCached(query, isUnrestricted) {
        const key = this.getCacheKey(query, isUnrestricted);
        const cached = this.searchCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            this.logger.log(`[Cache] Hit para: ${query}`);
            return cached.results;
        }
        return null;
    }
    setCache(query, isUnrestricted, results) {
        const key = this.getCacheKey(query, isUnrestricted);
        this.searchCache.set(key, { results, timestamp: Date.now() });
    }
    async search(query, isUnrestricted = false) {
        if (!query?.trim())
            return [];
        const cached = this.getCached(query, isUnrestricted);
        if (cached)
            return cached;
        const results = await this.doSearch(query, isUnrestricted);
        if (results.length > 0) {
            this.setCache(query, isUnrestricted, results);
        }
        return results;
    }
    async doSearch(query, isUnrestricted) {
        const normalizedQuery = query.trim();
        let results = await this.searchWithPrimary(normalizedQuery, isUnrestricted);
        if (results.length > 0)
            return results;
        if (!isUnrestricted) {
            for (const variant of this.SEARCH_VARIANTS) {
                const variantQuery = `${normalizedQuery} ${variant}`;
                this.logger.log(`[Search] Intentando variante: ${variantQuery}`);
                results = await this.searchWithPrimary(variantQuery, true);
                if (results.length > 0)
                    return results;
            }
        }
        return [];
    }
    async searchWithPrimary(query, isUnrestricted) {
        if (this.YOUTUBE_API_KEY) {
            const apiResults = await this.searchWithYouTubeDataApi(query, isUnrestricted);
            if (apiResults.length > 0)
                return apiResults;
        }
        try {
            const searchQuery = isUnrestricted ? query : (query.toLowerCase().includes('karaoke') ? query : `${query} karaoke`);
            const videos = await youtube_sr_1.default.search(searchQuery, {
                limit: 20,
                type: 'video',
                safeSearch: !isUnrestricted
            });
            const filteredVideos = isUnrestricted ? videos : videos.filter(video => {
                const title = video.title?.toLowerCase() || '';
                return title.includes('karaoke') ||
                    title.includes('instrumental') ||
                    title.includes('pista') ||
                    title.includes('letra') ||
                    title.includes('lyrics') ||
                    title.includes('off vocal') ||
                    title.includes('backing track');
            });
            return filteredVideos.slice(0, 10).map(video => ({
                id: video.id,
                title: video.title,
                channelTitle: video.channel ? video.channel.name : '',
                duration: video.durationFormatted,
                thumbnail: video.thumbnail ? video.thumbnail.url : '',
            }));
        }
        catch (error) {
            this.logger.warn('youtube-sr fue bloqueado. Activando nodos de rescate (Invidious)...');
            return this.searchWithInvidious(query, isUnrestricted);
        }
    }
    async searchWithInvidious(query, isUnrestricted) {
        const fallbackQuery = encodeURIComponent(query);
        const nodes = await this.getInvidiousNodes();
        for (const node of nodes) {
            try {
                const response = await this.fetchWithRetry(`${node}/api/v1/search?q=${fallbackQuery}`, 2);
                if (!response.ok)
                    continue;
                const data = await response.json();
                const fallbackVideos = data.filter((item) => item.type === 'video').slice(0, 10);
                if (fallbackVideos.length > 0) {
                    this.logger.log(`¡Rescate exitoso usando ${node}!`);
                    return fallbackVideos.map((video) => {
                        const mins = Math.floor(video.lengthSeconds / 60);
                        const secs = (video.lengthSeconds % 60).toString().padStart(2, '0');
                        return {
                            id: video.videoId,
                            title: video.title,
                            channelTitle: video.author,
                            duration: `${mins}:${secs}`,
                            thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
                        };
                    });
                }
            }
            catch (fallbackError) {
                continue;
            }
        }
        const apiResults = await this.searchWithYouTubeDataApi(query, isUnrestricted);
        if (apiResults.length > 0)
            return apiResults;
        this.logger.error('Todos los métodos de búsqueda fallaron. Retornando array vacío.');
        return [];
    }
    async searchWithYouTubeDataApi(query, isUnrestricted) {
        if (!this.YOUTUBE_API_KEY)
            return [];
        try {
            const searchQuery = encodeURIComponent(query);
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${searchQuery}&key=${this.YOUTUBE_API_KEY}`;
            const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
            if (!res.ok) {
                this.logger.warn(`[YouTube Data API] Error ${res.status}: ${await res.text()}`);
                return [];
            }
            const data = await res.json();
            if (!data.items || data.items.length === 0)
                return [];
            let filtered = data.items;
            if (!isUnrestricted) {
                filtered = data.items.filter((item) => {
                    const title = item.snippet.title.toLowerCase();
                    return title.includes('karaoke') ||
                        title.includes('instrumental') ||
                        title.includes('pista') ||
                        title.includes('letra') ||
                        title.includes('lyrics') ||
                        title.includes('off vocal') ||
                        title.includes('backing track');
                });
            }
            const ids = filtered.map((item) => item.id.videoId).join(',');
            const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${this.YOUTUBE_API_KEY}`, { signal: AbortSignal.timeout(10000) });
            const detailsData = await detailsRes.json();
            const durationMap = new Map(detailsData.items?.map((d) => [d.id, d.contentDetails.duration]) ?? []);
            return filtered.slice(0, 10).map((item) => {
                const isoDuration = durationMap.get(item.id.videoId) || 'PT0S';
                const seconds = this.parseIsoDuration(isoDuration);
                const mins = Math.floor(seconds / 60);
                const secs = (seconds % 60).toString().padStart(2, '0');
                return {
                    id: item.id.videoId,
                    title: item.snippet.title,
                    channelTitle: item.snippet.channelTitle,
                    duration: `${mins}:${secs}`,
                    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
                };
            });
        }
        catch (error) {
            this.logger.error('[YouTube Data API] Error:', error.message);
            return [];
        }
    }
    parseIsoDuration(duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match)
            return 0;
        const h = parseInt(match[1] || '0', 10);
        const m = parseInt(match[2] || '0', 10);
        const s = parseInt(match[3] || '0', 10);
        return h * 3600 + m * 60 + s;
    }
    async fetchWithRetry(url, retries) {
        let lastError = null;
        for (let i = 0; i < retries; i++) {
            try {
                return await fetch(url, { signal: AbortSignal.timeout(5000) });
            }
            catch (err) {
                lastError = err;
                await this.delay(500 * (i + 1));
            }
        }
        throw lastError || new Error(`Fetch failed: ${url}`);
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async verifyVideo(videoId) {
        this.logger.log(`[Verify] Verificando video ${videoId}...`);
        const strict = this.configService.get('YOUTUBE_VERIFY_STRICT') !== 'false';
        const apiResult = await this.verifyWithYouTubeApi(videoId);
        if (apiResult)
            return { ...apiResult, method: 'youtube-data-api' };
        const healthyInvidious = await this.getInvidiousNodes();
        const invidiousResult = await this.verifyWithInvidiousNodes(videoId, healthyInvidious);
        if (invidiousResult)
            return { ...invidiousResult, method: 'invidious-healthy' };
        const healthyPiped = await this.getPipedNodes();
        const pipedResult = await this.verifyWithPipedNodes(videoId, healthyPiped);
        if (pipedResult)
            return { ...pipedResult, method: 'piped-healthy' };
        this.logger.warn(`[Verify] No hay nodos saludables. Intentando todos los nodos Invidious...`);
        const allInvidiousResult = await this.verifyWithInvidiousNodes(videoId, this.INVIDIOUS_NODES);
        if (allInvidiousResult)
            return { ...allInvidiousResult, method: 'invidious-all' };
        this.logger.warn(`[Verify] Intentando todos los nodos Piped...`);
        const allPipedResult = await this.verifyWithPipedNodes(videoId, this.PIPED_NODES);
        if (allPipedResult)
            return { ...allPipedResult, method: 'piped-all' };
        if (!strict) {
            this.logger.warn(`[Verify] Modo no estricto: permitiendo video ${videoId} sin verificación.`);
            return { available: true, method: 'permissive', reason: 'Verificación no estricta' };
        }
        return { available: false, reason: 'No se pudo verificar disponibilidad del video. Configura YOUTUBE_API_KEY o desactiva YOUTUBE_VERIFY_STRICT.' };
    }
    async verifyWithInvidiousNodes(videoId, nodes) {
        if (nodes.length === 0)
            return null;
        const results = await Promise.allSettled(nodes.map(async (node) => {
            try {
                const res = await fetch(`${node}/api/v1/videos/${videoId}`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!data.videoId)
                    throw new Error('No videoId');
                const mins = Math.floor(data.lengthSeconds / 60);
                const secs = (data.lengthSeconds % 60).toString().padStart(2, '0');
                this.logger.log(`[Verify] Invidious OK: ${node}`);
                return {
                    available: true,
                    title: data.title,
                    duration: `${mins}:${secs}`,
                };
            }
            catch (err) {
                this.logger.debug(`[Verify] Invidious falló ${node}: ${err.message}`);
                throw err;
            }
        }));
        for (const result of results) {
            if (result.status === 'fulfilled')
                return result.value;
        }
        return null;
    }
    async verifyWithPipedNodes(videoId, nodes) {
        if (nodes.length === 0)
            return null;
        const results = await Promise.allSettled(nodes.map(async (node) => {
            try {
                const res = await fetch(`${node}/streams/${videoId}`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!data.title)
                    throw new Error('No title');
                const duration = data.duration ?? 0;
                const mins = Math.floor(duration / 60);
                const secs = (duration % 60).toString().padStart(2, '0');
                this.logger.log(`[Verify] Piped OK: ${node}`);
                return {
                    available: true,
                    title: data.title,
                    duration: `${mins}:${secs}`,
                };
            }
            catch (err) {
                this.logger.debug(`[Verify] Piped falló ${node}: ${err.message}`);
                throw err;
            }
        }));
        for (const result of results) {
            if (result.status === 'fulfilled')
                return result.value;
        }
        return null;
    }
    async verifyWithYouTubeApi(videoId) {
        if (!this.YOUTUBE_API_KEY)
            return null;
        try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${this.YOUTUBE_API_KEY}`, { signal: AbortSignal.timeout(10000) });
            if (!res.ok)
                return null;
            const data = await res.json();
            if (!data.items || data.items.length === 0)
                return null;
            const item = data.items[0];
            const seconds = this.parseIsoDuration(item.contentDetails.duration);
            const mins = Math.floor(seconds / 60);
            const secs = (seconds % 60).toString().padStart(2, '0');
            this.logger.log(`[Verify] YouTube Data API OK: ${videoId}`);
            return {
                available: true,
                title: item.snippet.title,
                duration: `${mins}:${secs}`,
            };
        }
        catch (err) {
            this.logger.debug(`[Verify] YouTube Data API falló: ${err.message}`);
            return null;
        }
    }
    async getAutoplayNext(videoId) {
        const invidiousNodes = await this.getInvidiousNodes();
        for (const node of invidiousNodes) {
            try {
                const res = await this.fetchWithRetry(`${node}/api/v1/videos/${videoId}`, 2);
                if (!res.ok)
                    continue;
                const data = await res.json();
                if (data.relatedVideos && data.relatedVideos.length > 0) {
                    const filtered = data.relatedVideos.filter((v) => v.title.toLowerCase().includes('karaoke') ||
                        v.title.toLowerCase().includes('instrumental'));
                    const list = filtered.length > 0 ? filtered : data.relatedVideos;
                    const next = list[0];
                    const mins = Math.floor(next.lengthSeconds / 60);
                    const secs = (next.lengthSeconds % 60).toString().padStart(2, '0');
                    this.logger.log(`[Autoplay] Found related via Invidious (${node}): ${next.title}`);
                    return {
                        id: next.videoId,
                        title: next.title,
                        channelTitle: next.author || 'YouTube',
                        duration: `${mins}:${secs}`,
                        thumbnail: `https://i.ytimg.com/vi/${next.videoId}/mqdefault.jpg`,
                    };
                }
                if (data.title) {
                    return this.autoplaySearchFallback(data.title);
                }
            }
            catch {
                continue;
            }
        }
        const pipedNodes = await this.getPipedNodes();
        for (const node of pipedNodes) {
            try {
                const res = await this.fetchWithRetry(`${node}/streams/${videoId}`, 2);
                if (!res.ok)
                    continue;
                const data = await res.json();
                if (data.relatedStreams && data.relatedStreams.length > 0) {
                    const filtered = data.relatedStreams.filter((v) => v.title.toLowerCase().includes('karaoke') ||
                        v.title.toLowerCase().includes('instrumental'));
                    const list = filtered.length > 0 ? filtered : data.relatedStreams;
                    const next = list[0];
                    const match = next.url.match(/watch\?v=([^&]+)/);
                    const nextVideoId = match ? match[1] : null;
                    if (!nextVideoId)
                        continue;
                    const mins = Math.floor(next.duration / 60);
                    const secs = (next.duration % 60).toString().padStart(2, '0');
                    this.logger.log(`[Autoplay] Found related via Piped (${node}): ${next.title}`);
                    return {
                        id: nextVideoId,
                        title: next.title,
                        channelTitle: next.uploaderName || 'YouTube',
                        duration: `${mins}:${secs}`,
                        thumbnail: `https://i.ytimg.com/vi/${nextVideoId}/mqdefault.jpg`,
                    };
                }
                if (data.title) {
                    return this.autoplaySearchFallback(data.title);
                }
            }
            catch {
                continue;
            }
        }
        this.logger.warn(`[Autoplay] All API nodes failed for ${videoId}, trying search fallback...`);
        return this.autoplaySearchFallbackById(videoId);
    }
    async autoplaySearchFallback(videoTitle) {
        try {
            const cleanTitle = videoTitle
                .replace(/\(.*?karaoke.*?\)/gi, '')
                .replace(/\[.*?karaoke.*?\]/gi, '')
                .replace(/karaoke/gi, '')
                .replace(/instrumental/gi, '')
                .replace(/pista/gi, '')
                .replace(/letra/gi, '')
                .trim();
            if (!cleanTitle)
                return null;
            const searchQuery = `${cleanTitle} karaoke`;
            this.logger.log(`[Autoplay] Searching fallback: "${searchQuery}"`);
            const results = await youtube_sr_1.default.search(searchQuery, {
                limit: 10,
                type: 'video',
                safeSearch: false,
            });
            if (results.length === 0)
                return null;
            const pick = results[Math.floor(Math.random() * Math.min(5, results.length))];
            this.logger.log(`[Autoplay] Found via search fallback: ${pick.title}`);
            return {
                id: pick.id,
                title: pick.title,
                channelTitle: pick.channel ? pick.channel.name : 'YouTube',
                duration: pick.durationFormatted,
                thumbnail: pick.thumbnail ? pick.thumbnail.url : `https://i.ytimg.com/vi/${pick.id}/mqdefault.jpg`,
            };
        }
        catch (error) {
            this.logger.error(`[Autoplay] Search fallback failed: ${error.message}`);
            return null;
        }
    }
    async autoplaySearchFallbackById(videoId) {
        const invidiousNodes = await this.getInvidiousNodes();
        for (const node of invidiousNodes) {
            try {
                const res = await this.fetchWithRetry(`${node}/api/v1/videos/${videoId}?fields=title`, 2);
                if (!res.ok)
                    continue;
                const data = await res.json();
                if (data.title) {
                    return this.autoplaySearchFallback(data.title);
                }
            }
            catch {
                continue;
            }
        }
        const pipedNodes = await this.getPipedNodes();
        for (const node of pipedNodes) {
            try {
                const res = await this.fetchWithRetry(`${node}/streams/${videoId}`, 2);
                if (!res.ok)
                    continue;
                const data = await res.json();
                if (data.title) {
                    return this.autoplaySearchFallback(data.title);
                }
            }
            catch {
                continue;
            }
        }
        try {
            const video = await youtube_sr_1.default.getVideo(videoId);
            if (video && video.title) {
                return this.autoplaySearchFallback(video.title);
            }
        }
        catch {
        }
        this.logger.warn(`[Autoplay] All fallbacks failed for ${videoId}.`);
        return null;
    }
};
exports.YouTubeService = YouTubeService;
exports.YouTubeService = YouTubeService = YouTubeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], YouTubeService);
//# sourceMappingURL=youtube.service.js.map