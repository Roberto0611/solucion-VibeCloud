import * as THREE from 'three'

function latLongToVector3(lat, lon, radius, height = 0) {
    const phi = lat * Math.PI / 180;
    const theta = (lon - 180) * Math.PI / 180;
    const r = radius + height;
    const x = -(r) * Math.cos(phi) * Math.cos(theta);
    const y = (r) * Math.sin(phi);
    const z = (r) * Math.cos(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
}

// Robust loader: resolves density-data.json relative to this module (works with Vite)
export async function loadDensityMarkers(options = {}) {
    const {
        url = './density-data.json', // relative to this file
        earth: earthObj = typeof earth !== 'undefined' ? earth : null,
        scene: sceneObj = typeof scene !== 'undefined' ? scene : null,
    } = options;

    // Compute radius after destructuring to avoid referencing `options` inside defaults.
    // Default to RADIUS global if present, otherwise use provided option or sensible default 1.
    const radius = (typeof RADIUS !== 'undefined') ? RADIUS : (options && options.radius) ? options.radius : 1;

    if (!earthObj) {
        console.warn('loadDensityMarkers: `earth` not provided or not found in global scope. Markers will not be added.');
    }

    try {
        const dataUrl = new URL(url, import.meta.url);
        const res = await fetch(dataUrl.href);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log('Cargados', data.length, 'puntos de datos');

        // Helper: try multiple candidate keys on an object and return first found
        const pick = (obj, candidates) => {
            for (const k of candidates) {
                if (k in obj) return obj[k]
                // try case-insensitive
                const found = Object.keys(obj).find(kk => kk.toLowerCase() === k.toLowerCase())
                if (found) return obj[found]
            }
            return undefined
        }

        data.forEach((row) => {
            // Support two row formats:
            // 1) Array: [name, lat, lon, population]
            // 2) Object: { Name, PWC_Lat, PWC_Lon, Pop, ... }
            let name, lat, lon, pop
            if (Array.isArray(row)) {
                name = row[0]
                lat = Number(row[1])
                lon = Number(row[2])
                pop = Number(row[3]) || 0
            } else if (row && typeof row === 'object') {
                name = pick(row, ['Name', 'name', 'country', 'Country', 'ISO']) || ''
                const latRaw = pick(row, ['PWC_Lat', 'pwc_lat', 'lat', 'Lat', 'latitude', 'Latitude'])
                const lonRaw = pick(row, ['PWC_Lon', 'pwc_lon', 'lon', 'Lon', 'longitude', 'Longitude'])
                const popRaw = pick(row, ['Pop', 'pop', 'Population', 'population', 'POP'])
                lat = latRaw !== undefined ? Number(latRaw) : NaN
                lon = lonRaw !== undefined ? Number(lonRaw) : NaN
                pop = popRaw !== undefined ? Number(popRaw) : 0
            } else {
                return
            }

            if (isNaN(lat) || isNaN(lon)) return; // skip invalid coords

            // Calculate height - balanced approach
            const minHeight = 0.005 * radius;
            const maxHeight = 2 * radius;
            const normalized = pop / 10000000; // Normalize by 1M
            const raw = Math.pow(normalized, 1 / 3) * 0.02 * radius;
            const height = Math.max(minHeight, Math.min(maxHeight, raw));

            // Calculate position on sphere surface + height offset
            const basePos = latLongToVector3(lat, lon, radius, 0);
            const topPos = latLongToVector3(lat, lon, radius, height);

            // Marker cross-section size (width/depth) scaled to radius; keep small
            const markerSize = Math.max(0.01 * radius, 0.02 * radius);

            // Create box marker with width, height, depth (depth along Z)
            const markerGeo = new THREE.BoxGeometry(markerSize, markerSize, height);
            const markerMat = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0x440000
            });
            const marker = new THREE.Mesh(markerGeo, markerMat);

            // Position at midpoint between base and top
            marker.position.lerpVectors(basePos, topPos, 0.5);

            // Rotate to point outward from globe center: look away from center along the radial
            // Use basePos multiplied to get an outward target direction
            const outwardTarget = basePos.clone().multiplyScalar(2);
            marker.lookAt(outwardTarget);

            marker.userData = { name, pop }; // store data for interaction
            if (earthObj && typeof earthObj.add === 'function') {
                earthObj.add(marker); // add to earth so it rotates with the globe
            } else if (sceneObj && typeof sceneObj.add === 'function') {
                sceneObj.add(marker);
            }
        });

        return data;
    } catch (err) {
        console.error('Error cargando density-data.json:', err);
        const infoEl = document.getElementById('info');
        if (infoEl) infoEl.textContent = 'Error: no se pudo cargar density-data.json';
        throw err;
    }
}

// New: return an array of lightweight marker descriptors (no THREE.Mesh creation).
export async function getDensityDescriptors(options = {}) {
    const { url = './density-data.json' } = options;
    const radius = (typeof RADIUS !== 'undefined') ? RADIUS : (options && options.radius) ? options.radius : 1;

    try {
        // Handle both relative and absolute URLs
        let fetchUrl;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
            // Absolute URL or root-relative path - use directly
            fetchUrl = url;
        } else {
            // Relative URL - resolve relative to this module
            const dataUrl = new URL(url, import.meta.url);
            fetchUrl = dataUrl.href;
        }

        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();

        const pick = (obj, candidates) => {
            for (const k of candidates) {
                if (k in obj) return obj[k]
                const found = Object.keys(obj).find(kk => kk.toLowerCase() === k.toLowerCase())
                if (found) return obj[found]
            }
            return undefined
        }

        const descriptors = [];

        data.forEach((row) => {
            let name, city, country, lat, lon, delay
            if (Array.isArray(row)) {
                name = row[0]
                lat = Number(row[1])
                lon = Number(row[2])
                delay = Number(row[3]) || 0
            } else if (row && typeof row === 'object') {
                // Get city or country name
                city = pick(row, ['city', 'City', 'CITY'])
                country = pick(row, ['country_name', 'Country_Name', 'COUNTRY_NAME'])
                name = city || country || pick(row, ['Name', 'name', 'country', 'Country', 'ISO']) || ''

                // Get coordinates
                const latRaw = pick(row, ['PWC_Lat', 'pwc_lat', 'lat', 'Lat', 'latitude', 'Latitude'])
                const lonRaw = pick(row, ['PWC_Lon', 'pwc_lon', 'lon', 'Lon', 'longitude', 'Longitude'])

                // Get delay (traffic delay in minutes)
                const delayRaw = pick(row, ['average_delay', 'delay', 'Delay', 'DELAY', 'Pop', 'pop', 'Population', 'population'])

                lat = latRaw !== undefined ? Number(latRaw) : NaN
                lon = lonRaw !== undefined ? Number(lonRaw) : NaN
                delay = delayRaw !== undefined ? Number(delayRaw) : 0
            } else {
                return
            }

            if (isNaN(lat) || isNaN(lon)) return; // skip invalid coords

            // Descriptor height based on traffic delay
            const minHeight = 0.01 * radius;  // Increased minimum height
            const maxHeight = 0.5 * radius;   // Reasonable max height
            // Scale height based on delay (higher delay = taller marker)
            const normalized = Math.abs(delay) / 2.5; // Normalize by max delay ~2.5
            const raw = Math.pow(normalized, 0.5) * 0.3 * radius;
            const height = Math.max(minHeight, Math.min(maxHeight, raw));

            const basePos = latLongToVector3(lat, lon, radius, 0);
            const topPos = latLongToVector3(lat, lon, radius, height);
            const midpoint = new THREE.Vector3().lerpVectors(basePos, topPos, 0.5);
            const markerSize = Math.max(0.02 * radius, 0.03 * radius);  // Increased marker size

            // Compute quaternion/orientation so the box faces outward. Use a temporary Object3D.
            const temp = new THREE.Object3D();
            const outwardTarget = basePos.clone().multiplyScalar(2);
            temp.position.copy(midpoint);
            temp.lookAt(outwardTarget);
            const q = temp.quaternion;

            descriptors.push({
                name,
                city,
                delay,
                lat,
                lon,
                height,
                markerSize,
                position: { x: midpoint.x, y: midpoint.y, z: midpoint.z },
                quaternion: [q.x, q.y, q.z, q.w]
            });
        });

        return descriptors;
    } catch (err) {
        console.error('Error fetching descriptors:', err);
        throw err;
    }
}

// Resize handling (defensive: only attach if required globals exist)
if (typeof window !== 'undefined' && typeof container !== 'undefined' && typeof camera !== 'undefined' && typeof renderer !== 'undefined') {
    function onResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
}

// Animation loop (defensive; expects earth/controls/renderer/scene/camera globals)
if (typeof requestAnimationFrame !== 'undefined') {
    function animate() {
        requestAnimationFrame(animate);
        if (typeof earth !== 'undefined' && earth) earth.rotation.y += 0.0008; // slow auto-rotate
        if (typeof controls !== 'undefined' && controls && typeof controls.update === 'function') controls.update();
        if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') renderer.render(scene, camera);
    }
    // Start the loop only if at least renderer, scene and camera are present
    if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        animate();
    }
}

// If you include this module directly in a page that already defines globals (earth, RADIUS, etc),
// you can call `loadDensityMarkers()` without arguments. Otherwise, import and call it with an options object:
// import { loadDensityMarkers } from './processfetch'
// loadDensityMarkers({ url: './density-data.json', earth: myEarthMesh, radius: 1, scene: myScene })
