/** @file preloader.js
 *  Automatic image preloader - extracts all images from story and preloads them
 */

/**
 * Preload all images defined in the story
 * @param {import('./engine/story-format.js').Story} story
 * @returns {Promise<void>}
 */
export async function preloadStoryAssets(story) {
    const imageUrls = new Set();

    // Collect all background images
    if (story.places) {
        Object.values(story.places).forEach(url => {
            if (url) imageUrls.add(url);
        });
    }

    // Collect all character images
    if (story.characters) {
        Object.values(story.characters).forEach(character => {
            if (character.poses) {
                Object.values(character.poses).forEach(url => {
                    if (url) imageUrls.add(url);
                });
            }
        });
    }

    const totalImages = imageUrls.size;

    if (totalImages === 0) {
        console.log('No images to preload');
        return;
    }

    console.log(`Preloading ${totalImages} images...`);

    // Create promises for all images
    const loadPromises = Array.from(imageUrls).map((url, index) => {
        return loadImage(url, index + 1, totalImages);
    });

    // Wait for all images to load
    await Promise.all(loadPromises);

    console.log('✓ All images preloaded successfully!');
}

/**
 * Load a single image
 * @param {string} url
 * @param {number} current
 * @param {number} total
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(url, current, total) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            console.log(`  [${current}/${total}] Loaded: ${url}`);
            resolve(img);
        };

        img.onerror = () => {
            console.warn(`  [${current}/${total}] Failed to load: ${url}`);
            // Resolve anyway to not block other images
            resolve(null);
        };

        img.src = url;
    });
}

/**
 * Show a loading screen while preloading
 * @param {HTMLElement} container - The container element to show loading screen in
 * @param {import('./engine/story-format.js').Story} story
 * @returns {Promise<void>}
 */
export async function preloadWithLoadingScreen(container, story) {
    // Create loading screen
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-screen';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <h2>Loading...</h2>
            <div class="loading-bar-container">
                <div class="loading-bar" id="loading-bar"></div>
            </div>
            <p id="loading-text">Preparing assets...</p>
        </div>
    `;
    container.appendChild(loadingDiv);

    const imageUrls = new Set();

    // Collect all images
    if (story.places) {
        Object.values(story.places).forEach(url => {
            if (url) imageUrls.add(url);
        });
    }

    if (story.characters) {
        Object.values(story.characters).forEach(character => {
            if (character.poses) {
                Object.values(character.poses).forEach(url => {
                    if (url) imageUrls.add(url);
                });
            }
        });
    }

    const totalImages = imageUrls.size;
    let loadedImages = 0;

    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');

    const updateProgress = () => {
        const percent = (loadedImages / totalImages) * 100;
        loadingBar.style.width = percent + '%';
        loadingText.textContent = `Loading assets... ${loadedImages}/${totalImages}`;
    };

    if (totalImages === 0) {
        loadingDiv.remove();
        return;
    }

    // Load all images with progress tracking
    const loadPromises = Array.from(imageUrls).map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                loadedImages++;
                updateProgress();
                resolve(img);
            };

            img.onerror = () => {
                loadedImages++;
                updateProgress();
                console.warn(`Failed to load: ${url}`);
                resolve(null);
            };

            img.src = url;
        });
    });

    await Promise.all(loadPromises);

    // Show complete message briefly
    loadingText.textContent = 'Complete!';
    await new Promise(resolve => setTimeout(resolve, 300));

    // Remove loading screen
    loadingDiv.remove();
}
