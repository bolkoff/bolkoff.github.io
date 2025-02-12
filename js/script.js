class SpriteCover {
    constructor(spriteElement, container, frameWidth, frameHeight, frameCount) {
        this.sprite = spriteElement;
        this.container = container;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.currentFrame = 0;
        this.totalFrames = frameCount;
        this.scale = 1;
        this.xCenter = 0;
        this.yCenter = 0;

        this.resizeObserver = new ResizeObserver(() => this.updateSize());
        this.resizeObserver.observe(container);
        
        this.initSprite();
        this.updateSize();
    }

    destroy() {
        this.resizeObserver.disconnect();
    }

    initSprite() {
        // Установка исходных размеров спрайта
        this.sprite.parentElement.parentElement.style.width = `${this.frameWidth * this.totalFrames}px`;
        this.sprite.parentElement.parentElement.style.height = `${this.frameHeight}px`;
        
        
        // Начальная позиция первого кадра
        //this.updateTransform();
    }

    updateSize() {
        const containerWidth = Math.abs(this.container.clientWidth);
        const containerHeight = Math.abs(this.container.clientHeight);

        if (containerWidth > containerHeight) {
            this.scale = containerWidth / this.frameWidth;
            console.log("containerWidth =", containerWidth, "this.frameWidth= ", this.frameWidth);
            this.yCenter = - this.frameHeight * (((containerWidth - containerHeight)/2)/containerWidth);
            this.xCenter = 0;
        }
        else if (containerHeight > containerWidth){
            this.scale = containerHeight / this.frameHeight;
            console.log("containerHeight =", containerHeight, "this.frameHeight= ", this.frameHeight);
            this.xCenter = - this.frameWidth * (((containerHeight - containerWidth)/2)/containerHeight);
            this.yCenter = 0;
        }
        else {
            this.scale = containerHeight / this.frameHeight;
            this.xCenter = 0;
            this.yCenter = 0;
        }

        this.sprite.parentElement.parentElement.style.transform = `scale(${this.scale})`;
        
        this.updateTransform();
    }

    updateTransform() {
        const xOffset = -this.currentFrame * this.frameWidth + this.xCenter;
        this.sprite.style.transform = `translateX(${xOffset}px) translateY(${this.yCenter}px)`;
    }

    setFrame(index) {
        this.currentFrame = index;
        this.updateTransform();
    }
}

// Список текстов с таймингами {время в секундах: текст}
const textTimeline = [
    { time: 0, text: "первого погружения с аквалангом в Красном море" },
    { time: 0.99, text: "романтического ужина на пляже Мальдив" },
    { time: 1.88, text: "полета на воздушном шаре над Каппадокией" },
    { time: 2.66, text: "купания со слонами в Таиланде" },
    { time: 3.38, text: "завтрака в бассейне на вилле в Дубае" },
    { time: 4.04, text: "первого урока серфинга на Бали" },
    { time: 4.67, text: "прогулки на яхте по побережью Дубая" },
    { time: 5.29, text: "первого заплыва с черепахами на Мальдивах" },
    { time: 5.91, text: "посещения термальных источников Памуккале" },
    { time: 6.55, text: "дегустации местной кухни в Стамбуле" },
    { time: 7.24, text: "рыбалки на закате в Индийском океане" },
    { time: 7.98, text: "первого урока дайвинга в бассейне" },
    { time: 8.82, text: "спа-ритуала с видом на океан" },
    { time: 9.75, text: "хаммама в лучших традициях Турции" },
    { time: 10.8, text: "тайского массажа на пляже" },
    ];

async function loadInto() {
    let controller = new AbortController(); // Контроллер для отмены
    let { signal } = controller;

    intro: try {
        let loadedProgressSteps = 0;
        const allProgressSteps = 2;

        function updateProgress(loadedCount, allCount) {
            setLoadProgress((loadedProgressSteps + loadedCount)*100/(allProgressSteps + allCount))
        }

        console.log("🔹 Step 0: get intro show flag");
        introFlags = await loadStep([
            checkIntroFlags(),
            loadCSS("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"),
            loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js")
        ],
        signal);

        console.log("🔹 Step 1: processing returned or skipped");
        if (introFlags.includes("returned")) {
            await loadStep([
                prepareSkipButtons(".slide-container.zero-slide ~ [class*='-slide']", controller),
            ],
            signal);
        }
        else if (introFlags.includes("skip")) {
            console.log("skipping intro");
            removeIntro();
            break intro;
        }

        console.log("🔹 Step 2: load zero slide css");
        await loadStep([
            loadCSS("css/zero.min.css"),
        ],
        signal);

        document.body.style.display = 'block';

        console.log("🔹 Step 3: load lazy load js");
        await loadStep([
            loadScript("https://cdn.jsdelivr.net/npm/vanilla-lazyload@19.1.3/dist/lazyload.min.js", "LazyLoad"),
        ],
        signal);

        console.log("🔹 Step 4: load zero slide resources");
        await loadStep([
            loadResources(".slide-container.zero-slide .lazy", null),
        ],
        signal);
        loadedProgressSteps++;
        updateProgress(0, allProgressSteps);

        console.log("🔹 Step 5: load main css");
        await loadStep([
            loadCSS("css/style.min.css"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/fitty/2.3.2/fitty.min.js", "fitty")
        ],
        signal);

        loadedProgressSteps++;
        updateProgress(0, allProgressSteps);

        console.log("🔹 Step 6: load intro slides resources");
        const step6Results = await loadStep([
            loadResources(".slide-container.zero-slide ~ [class*='-slide'] .lazy", updateProgress),
            loadCSS("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"),
            loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"),
            initSprite()
            //loadCSS("/css/glitch.css");
        ],
        signal);

        console.log("🔹 Step 7: waiting resources progress");
        await loadStep([
            waitForProgressCompete(),
        ],
        signal);

        
        //loadCSS("/css/glitch.css");
        loadCSS("css/element-icons.css");

        console.log("🔹 Step 8: blue part animation");
        await loadStep([
            showBluePartAnimation(),
        ],
        signal);

        console.log("🔹 Step 9: hide zero slide and begin slideshow");
        await loadStep([
            removeSlide(document.querySelector(".slide-container.zero-slide")),
            startSlidesCycle(".slide-container.zero-slide ~ [class*='-slide']", step6Results[3])
        ],
        signal);
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("⏩ Loading skipped by user");
        } else {
            console.error("❌ Error loading page:", error);
        }
    }

    controller = new AbortController();
    signal = controller.signal;

    try {
        console.log("🔹 Step 10: loading main page scripts");
        await loadStep([
            loadScript("https://cdn.jsdelivr.net/npm/vanilla-lazyload@19.1.3/dist/lazyload.min.js", "LazyLoad"),
            loadCSS("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"),
            loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js")
        ],
        signal);

        console.log("🔹 Step 11: loading main page resources");
        await loadStep([
            loadCSS("css/style.min.css"),
            loadResources(".video-banner-poster-lazy")
        ],
        signal);

        console.log("🔹 Step 12: showing page and lazyload remaining resources");
        await loadStep([
            initLazyLoad(),
            enableMainPage(),
            showMainPage(),
            loadCSS("css/element-icons.css")
        ],
        signal);
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("⏩ Loading skipped by user");
            await showMainPage();
        } else {
            console.error("❌ Error loading page:", error);
        }
    }
}

async function loadStep(promises, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
        }

        const onAbort = () => {
            reject(new DOMException("Aborted", "AbortError"));
        };

        signal?.addEventListener("abort", onAbort, { once: true });
        
        const validPromises = promises.filter(p => p instanceof Promise);
        
        const results = Promise.all(validPromises)
            .then(resolve)
            .catch(reject)
            .finally(() => {
                signal?.removeEventListener("abort", onAbort);
            });

        return results.length === 1 ? results[0] : results;
    });
}

async function loadCSS(href) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`link[href="${href}"]`)) {
            console.log("Loaded css: " + href);
            return resolve(); // CSS уже загружен
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = () => {console.log("Loaded css: " + href);resolve();};
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

function loadScript(src, globalVar = null, checkInterval = 10, timeout = 5000) {
    function loadScriptInternal(src, globalVar = null, checkInterval = 10, timeout = 5000) {
        return new Promise((resolve, reject) => {
            // Если скрипт уже загружен и глобальная переменная доступна — сразу резолвим
            if (document.querySelector(`script[src="${src}"]`)) {
                if (!globalVar || window[globalVar]) return resolve(window[globalVar]);
            }

            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                
                if (!globalVar) {
                    console.log("Loaded script: " + src);
                    resolve();
                    return;
                }

                // Ждем появления глобального объекта
                const startTime = Date.now();
                const checkVar = setInterval(() => {
                    if (window[globalVar]) {
                        clearInterval(checkVar);
                        console.log("Loaded script: " + src);
                        resolve(window[globalVar]);
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(checkVar);
                        reject(new Error(`Timeout: ${globalVar} не появился после ${timeout} мс`));
                    }
                }, checkInterval);
            };

            script.onerror = () => reject(new Error(`Ошибка загрузки: ${src}`));
            document.head.appendChild(script);
        });
    }

    return new Promise((resolve, reject) => {
        function attempt(remainingAttempts) {
            loadScriptInternal(src)
                .then(resolve)
                .catch((err) => {
                    if (remainingAttempts > 0) {
                        setTimeout(() => attempt(remainingAttempts - 1), 1000);
                    } else {
                        reject(err);
                    }
                });
        }
        attempt(3);
    });
}
    

async function loadResources(selector, updateProgress) {
    console.log("starting loading resources for: ", selector);
    return new Promise((resolve, reject) => {
        let elementsCount = 0;
        const lazyLoad = new LazyLoad({
            elements_selector: selector,
            callback_loaded: (elem) => {
                if (!elementsCount) {
                    elementsCount = lazyLoad.toLoadCount + 1;
                }
                if (updateProgress) {
                    updateProgress ((elementsCount - lazyLoad.toLoadCount), elementsCount);
                }
            },
            callback_finish: (lazyInstance) => {
                lazyInstance.destroy();
                elementsCount = 0;
                if (updateProgress) {
                    updateProgress(elementsCount, elementsCount);
                }
                resolve();
            }
        });
        lazyLoad.loadAll();
    });
}

async function checkIntroFlags() {
    return new Promise((resolve, reject) => {
        const MAX_SKIP_COUNT = 3;
        let visitCount = getLocalStorageValue('siteVisits');
        let skipCount = getLocalStorageValue('skipIntro');
        incrementLocalStorageValue('siteVisits');
        
        console.log("visitCount = ", visitCount, "skipCount =", skipCount);
        if (skipCount >= MAX_SKIP_COUNT) {
            resolve("skip");
        } else if (visitCount === 1) {
            resolve("first_visit");
        } else {
            resolve("returned");
        }
    });
}

function getLocalStorageValue(key) {
    let value = localStorage.getItem(key) 
        ? parseInt(localStorage.getItem(key), 10) || 0 
        : 0;
    return value;
}

function incrementLocalStorageValue(key) {
    let value = getLocalStorageValue(key);
    localStorage.setItem(key, (value+1).toString());
}

async function prepareSkipButtons(slidesSelector, controller) {
    return new Promise((resolve, reject) => {
        let slides = document.querySelectorAll(slidesSelector);
        if (slides) {
            slides.forEach((slide) => {
                let skipButton = slide.querySelector('.btn-skip');
                if (skipButton) {
                    skipButton.style.display = 'block';
                    skipButton.addEventListener('click', () => {
                        incrementLocalStorageValue('skipIntro');
                        console.log("⏩ User clicked skip");
                        controller.abort();
                        skipIntro();
                    });
                }
                else {
                    reject("no skip buttons found");
                }
            });
        }
        resolve("ok");
    });
    
}

let currentProgress = 0;
let animationQueue = [];
let isAnimating = false;
let startTime = 0;


function setLoadProgress(targetProgress) {
    if (!startTime) {
        console.error("DOM not loaded");
        return;
    }

    if (isAnimating) {
        animationQueue.push(targetProgress);
        return;
    }

    if (targetProgress > 0 && targetProgress <101) {
        logo = document.querySelector(".lazy.logo").contentDocument;
        if (!logo) return;

        const maskRect = logo.getElementById('maskRect');
        if (maskRect) {
            // Рассчитываем разницу и длительность
            const diff = Math.abs(targetProgress - currentProgress); // Разница в процентах
            const duration = (diff / 100) * 1; // Длительность пропорциональна разнице (например, 1 секунда для 100%)
            let elapsedTime = (performance.now() - startTime) / 1000; // Прошедшее время в секундах
            
            const animateY = createSVGAnimation(maskRect, "animate", "animateY", "y", `${100 - currentProgress}%`, `${100 - targetProgress}%`, `${duration}s`, `${elapsedTime}s`);
            const animateHeight = createSVGAnimation(maskRect, "animate", "animateHeight", "height", `${currentProgress}%`, `${targetProgress}%`, `${duration}s`, `${elapsedTime}s`);
            console.log(`progress update ${currentProgress} -> ${targetProgress} duration ${duration}`);
            isAnimating = true;

            function onAnimationEnd() {
                isAnimating = false;
                currentProgress = targetProgress;
    
                if (animationQueue.length > 0) {
                    const nextProgress = animationQueue.shift();
                    if (nextProgress > targetProgress) {
                        setLoadProgress(nextProgress);
                    }
                }
                else {
                    // Убираем обработчик после выполнения
                    animateY.removeEventListener("endEvent", onAnimationEnd);
                }
            }
    
            animateY.addEventListener("endEvent", onAnimationEnd);
        }
    }
}

function waitForProgressCompete() {
    return new Promise((resolve, reject) => {
        // **Дожидаемся завершения анимации через событие `endEvent`**
        function onAnimationEnd() {
            //console.log("waitForProgressCompete currentProgress = ", currentProgress);
            if (currentProgress > 99) {
                resubscribeAllAnimates(true);
                resolve();
            }
            resubscribeAllAnimates(false);
        }
        logo = document.querySelector(".lazy.logo").contentDocument
        
        function resubscribeAllAnimates(unsubscrubeOnly) {
            animates = logo.querySelectorAll('[id="animateY"]');
            animates.forEach((animate) => {
                animate.removeEventListener("endEvent", onAnimationEnd);
                if (!unsubscrubeOnly) {
                    animate.addEventListener("endEvent", onAnimationEnd);
                }
                
            });
        }
        resubscribeAllAnimates(false);
        
    });
}

function showBluePartAnimation() {
    return new Promise((resolve, reject) => {
        let elapsedTime = (performance.now() - startTime) / 1000; // Прошедшее время в секундах
        const logoDoc = document.querySelector(".lazy.logo").contentDocument;
        const bluePath = logoDoc.getElementById("bluePath");
        createSVGAnimation(bluePath, "animate", "bluePathStroke", "stroke-dashoffset", `1000`, `0`, `0.7s`, `${elapsedTime}s`, "spline", "0.42 0 0.58 1");
        
        const blueFill = logoDoc.getElementById("blueFill");
        createSVGAnimation(blueFill, "animate", "blueFillOpacity", "fill-opacity", `0`, `1`, `0.3s`, `${elapsedTime + 0.7}s`);

        const bluePart = logoDoc.getElementById("bluePart");
        createSVGAnimation(bluePart, "animateTransform", "animateScaleUp", "transform", "1 1", "1.1 1.1", "0.2s", `${elapsedTime + 1.2}s`, 0, 0, type="scale");
        createSVGAnimation(bluePart, "animateTransform", "animateScaleDown", "transform", `1.1 1.1`, `1 1`, `0.3s`, `${elapsedTime + 1.5}s`, 0, 0, type="scale");

        // setTimeout(() => {resolve();}, 1500);
        function onAnimationEnd() {
            //removeSlide(document.querySelector(".slide-container.zero-slide"));
            resolve(); 
        }
        const animateScaleDown = logoDoc.getElementById("animateScaleDown");
        animateScaleDown.addEventListener("endEvent", onAnimationEnd);
        console.log("waiting for animation of blue part to finish");
    });

    
}

function createSVGAnimation(parentElement, newElementType, id, attributeName, from, to, duration, begin = 0, calcMode = 0, keySplines = 0, type = 0) {
    const animate = document.createElementNS("http://www.w3.org/2000/svg", newElementType);
    animate.setAttribute("id", id);
    animate.setAttribute("attributeName", attributeName);
    if (calcMode) {animate.setAttribute("calcMode", calcMode);}
    if (keySplines) {animate.setAttribute("keySplines", keySplines);}
    if (type) {animate.setAttribute("type", type);}
    animate.setAttribute("from", from);
    animate.setAttribute("to", to);
    animate.setAttribute("dur", `${duration}`);
    animate.setAttribute("begin", `${begin}`);
    animate.setAttribute("fill", "freeze");
    
    parentElement.appendChild(animate);
    return animate;


}

function removeSlide(slide) {
    return new Promise((resolve, reject) => {
        if (!slide) return;  
        slide.style.display = "none";  // Скрываем слайд
        resolve();
    });
}

function removeIntro() {
    const introSlides = document.querySelectorAll("body > [class*='-slide']");
    if (introSlides) {
        introSlides.forEach(slide => {
            removeSlide(slide);
        });
    }
}

function skipIntro() {
    const slides = document.querySelectorAll("body > [class*='-slide']");
    slides.forEach((slide) => {removeSlide(slide);});
}

function fixSlideshowVideoSources(selector) {
    return new Promise((resolve, reject) => {
        const slideshowVideo = document.querySelector(selector);

        if (!slideshowVideo) {
            reject();
            return;
        }

        const sources = Array.from(slideshowVideo.querySelectorAll("source"));

        // Проверяем поддержку MP4 (H.264)
        const supportsMP4 = document.createElement("video").canPlayType("video/mp4") !== "";
        let bestSourceMP4 = null;
        let bestSourceWebM = null;

        sources.forEach(source => {
            const type = source.getAttribute("type");
            const media = source.getAttribute("media") || "";

            let matchesMedia = !media || window.matchMedia(media).matches;

            if (matchesMedia) {
                if (type === "video/mp4") {
                    bestSourceMP4 = source;
                } else if (type === "video/webm") {
                    bestSourceWebM = source;
                }
            }
        });

        // Выбираем MP4, если поддерживается, иначе WebM
        const bestSource = supportsMP4 ? bestSourceMP4 || bestSourceWebM : bestSourceWebM;

        if (bestSource) {
            console.log(`Выбрано видео: ${bestSource.getAttribute("data-src")}`);
            slideshowVideo.setAttribute("data-src", bestSource.getAttribute("data-src"));
            slideshowVideo.querySelectorAll("source").forEach(source => source.remove());
            //slideshowVideo.load();
            resolve();
        }
        reject();
    });
}

function initSprite () {
    return new Promise((resolve, reject) => {
        const sprite = document.getElementById('sprite');
        const viewport = document.querySelector('.viewport');
        const img = document.querySelector('.viewport img');

        if (sprite.complete) {
            resolve(createSpriteControler(sprite, viewport));
        } else {
            img.addEventListener("load", () => {resolve(createSpriteControler(sprite, viewport));}, { once: true });
        }
    });
    
    function createSpriteControler(sprite, viewport) {
        const controller = new SpriteCover(
            sprite,
            viewport,
            sprite.naturalHeight, // Ширина одного кадра
            sprite.naturalHeight,  // Высота одного кадра
            textTimeline.length
        );
        return controller;
    }
}

// Запуск цикла показа слайдов
function startSlidesCycle(slidesSelector, spriteControler) {
    function runSlideshow() {
        let currentIndex = 0;
        const fourthslideText = document.querySelector('.fourth-slide .text-block h2 span');
        const fourthSlideTextColumn = document.querySelector('.slide-container.fourth-slide .text-column-fill')
        let current = 0;

        function nextFrame(spriteControler) {
            console.log("current =", current);
            if (spriteControler) {
                if (current >= textTimeline.length) {console.log("nextFrame exit"); return;} // Выход из рекурсии, если достигнут конец

                console.log("current =", current);
                spriteControler.setFrame(current);

                current++;
                
                
                if (current < textTimeline.length) {
                    let delay = (textTimeline[current].time - textTimeline[current - 1].time) * 1000;
                    setTimeout(() => {
                        nextFrame(spriteControler);
                        //console.log("current =", current, "textTimeline[current].time =", textTimeline[current].time);
                    },
                    delay); // Запускаем следующий кадр
                     
                }
            }
        }

        fourthSlideTextColumn.addEventListener('animationend', (event) => {
            if (event.animationName === 'zoomInText') {
                nextFrame(spriteControler);
            }
        });
    }

    function runIntroSlidesAnimation(){
        const animElements = document.querySelectorAll(".pending-animation:not(.animation)");
        animElements.forEach((elem) => {
            console.log(`Starting animation for ${elem.classList}`);
            elem.classList.add("animation");
        });
    }

    return new Promise((resolve, reject) => {
        const slides = document.querySelectorAll(slidesSelector);//".slide-container.zero-slide ~ [class*='-slide']"
        slidesCount = slides.length;
        runIntroSlidesAnimation();
        runSlideshow();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(calcTextRows, 100);
        });

        calcTextRows();

        if (slidesCount) {
            slides.forEach((slide) => {
                console.log(`subscribing slide for animationend ${slide.classList}`)
                slide.addEventListener('animationend', (event) => {
                    if (event.animationName === 'showHideSlide') {
                        console.log(`Завершена анимация скрытия слайда ${slide.classList}`);
                        removeSlide(slide);
                        slidesCount--;
                        console.log("slidesCount = ", slidesCount);
                        if (!slidesCount) {
                            resolve();
                        }
                    }
                });
            });
        }
        else {
            reject("no intro slides flound");
        }
    });
}

function fitTextToContainer(containerSelector) {
    const container = document.querySelector(containerSelector);
    
    if (!container) {
        return;
    }
    
    const rows = Array.from(container.querySelectorAll(".text-row"));
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    let currentWidth = containerWidth;
    let lastWidth = currentWidth;
    let iterations = 0;
    let fittedRows = null;
    const MAX_ITERATIONS = 10;
    const MIN_WIDTH = 100;
    const MAX_WIDTH = containerWidth * 1; // Уменьшили максимальную ширину
    
    function cleanupFitty(instances) {
        instances?.forEach(instance => instance?.unsubscribe());
    }
  
    function updateTextAndCheckHeight() {
        if (iterations >= MAX_ITERATIONS || currentWidth < MIN_WIDTH) {
            return;
        }

        function setTransformOriginToLetter(container, letter) {
            const rows = Array.from(container.querySelectorAll('.text-row'));
            let totalOffsetY = 0;
            
            for (const row of rows) {
                if (row.textContent.includes('впечатлений')) {
                    const letterIndex = row.textContent.indexOf(letter);
                    if (letterIndex === -1) {
                        totalOffsetY += row.getBoundingClientRect().height;
                        continue;
                    }
                    
                    const range = document.createRange();
                    const textNode = row.firstChild;
                    range.setStart(textNode, letterIndex);
                    range.setEnd(textNode, letterIndex + 1);
                    
                    const rect = range.getBoundingClientRect();
                    const parentRect = container.parentElement.getBoundingClientRect();
                    
                    // Рассчитываем координаты относительно родительского элемента
                    const originX = rect.left - parentRect.left + (rect.width / 2);
                    const originY = rect.top - parentRect.top + (rect.height / 2);
                    
                    // Устанавливаем transform-origin
                    container.parentElement.style.transformOrigin = `${originX}px ${originY}px`;
                    break;
                }
                totalOffsetY += row.getBoundingClientRect().height;
            }
        }

  
        cleanupFitty(fittedRows);
        fittedRows = rows.map((row, index) => {return fitty(row);});
        requestAnimationFrame(() => {
            const totalHeight = rows.reduce((sum, row) => sum + row.scrollHeight, 0);
            
            if (totalHeight > containerHeight) {
                // Более плавное уменьшение
                const scaleFactor = Math.max(0.6, containerHeight / totalHeight);
                currentWidth *= scaleFactor;
                currentWidth = Math.max(currentWidth, MIN_WIDTH);
            } else if (totalHeight < containerHeight * 0.9) {
                // Более осторожное увеличение
                const scaleFactor = Math.min(1.4, (containerHeight * 0.95) / totalHeight);
                currentWidth = Math.min(currentWidth * scaleFactor, MAX_WIDTH);
            } 
    
            if (Math.abs(currentWidth - lastWidth) > 1) {
                container.style.width = `${currentWidth}px`;
                //rows.forEach((row, i, rows) => row.style.width += `${currentWidth}px`);
                lastWidth = currentWidth;
                iterations++;
                updateTextAndCheckHeight();
            } else if (containerSelector.includes("fourth-slide")){
                setTransformOriginToLetter(container, "т");
            }
        });
    }

    let beforeWidth = containerWidth;
    updateTextAndCheckHeight();
    requestAnimationFrame(() => { setTimeout(() => {
        let afterWidth = container.offsetWidth;
        }, 300)
    });
}

function calcTextRows() {
    resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
            //fitTextToContainer('.text-column.second-slide');
            (async () => {
                setTimeout(() => fitTextToContainer('.text-column.second-slide'), 100);
                setTimeout(() => fitTextToContainer('.text-column.third-slide'), 200);
                setTimeout(() => fitTextToContainer('.text-column.fourth-slide'), 300);
                setTimeout(() => fitTextToContainer('.text-column.main-page'), 400);
            })();
      });
    },
    100);
    return resizeTimeout;
}

async function initLazyLoad() {
    return new Promise((resolve, reject) => {
        const lazyLoad = new LazyLoad({
            elements_selector: ".lazy-main",
            use_native: "true"
        });
        resolve();
    });
}

async function enableMainPage() {
    return new Promise((resolve, reject) => {
        document.body.style.display = 'block';
        document.body.style.overflow = 'auto';
        resolve();
    });
}

async function showMainPage() {
    return new Promise((resolve, reject) => {
        const mainPage = document.querySelector(".main-page");
        const navbar = document.getElementById("mainNavbar");
        const roundButton = document.getElementById('round-center-button');
        document.body.style.backgroundColor = "var(--text-light-color-hover)";
        
        if (mainPage) {
            mainPage.style.animation = 'none';
            mainPage.style.display = 'block';
            mainPage.offsetHeight;
            mainPage.style.animation = 
                'showMainPage 100ms linear forwards, reduceHeightMainPage var(--main-page-delay) ease-out forwards';
        }
            
        if (navbar) {
            navbar.style.animation = 'none';
            navbar.offsetHeight;
            navbar.style.animation = 
                'moveDownNavBar var(--main-page-delay) ease-out 1 normal forwards';
        }

        if (roundButton) {
            roundButton.style.animation = 'none';
            roundButton.offsetHeight;
            roundButton.style.animation = 
                'fadeInButton var(--main-page-delay) ease-out 1 normal forwards';
        }

        const mainpageTextRows = mainPage.querySelectorAll(".text-row");
        mainpageTextRows.forEach(row => {
            row.style.display = 'none';  // Скрываем все слайды
            row.style.animation = 'none !important';
            row.style.transition = 'none !important';
        });

        resolve();
    });    
}

document.addEventListener('DOMContentLoaded', () => {
    if (!startTime) {
        startTime = performance.now();
    }
    
    loadInto();
    //(async () => { await loadInto(); })();
    

    const navbar = document.getElementById("mainNavbar");
    const videoBanner = document.querySelector(".video-banner");
    const toggler = document.querySelector('.navbar-toggler');
    const navbarmenu = document.querySelector('.navbar-collapse');
    const navbarCollapse = document.getElementById('navbarToggler');
    const video = document.getElementById('vid');
    const roundButton = document.getElementById('round-center-button');

    
    window.addEventListener('scroll', updateScrolledGradient);
    window.addEventListener('scroll', closeMenu);

    if (navbarCollapse) {
        navbarCollapse.addEventListener('show.bs.collapse', hideRoundButton);
        navbarCollapse.addEventListener('hide.bs.collapse', showRoundButton);
    }

    function updateScrolledGradient() {
        const videoBannerHeight = videoBanner ? videoBanner.offsetHeight : 50;
        if (navbar) {
            if (window.scrollY > videoBannerHeight) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
                navbarCollapse.classList.remove("show");
            }
        }
    }

    function showRoundButton () {
        roundButton.classList.add('show');
        roundButton.classList.remove('hide');
    }

    function hideRoundButton () {
        roundButton.classList.remove('show');
        roundButton.classList.add('hide');
    }

    function closeMenu() {
        if (navbarmenu) {
            navbarmenu.classList.remove('show');
        }
        toggler.setAttribute('aria-expanded', 'false');
    }
    if (video) {
        video.addEventListener('canplaythrough', () => {
            const poster = document.querySelector(".video-banner-poster");
            const videoBannerVideo = document.querySelector(".video-banner video");
            
            videoBannerVideo.style.display = "block";
            poster.style.display = "none";
            video.play();
        }, { once: true });
    }

    const navLinks = document.querySelectorAll('#country-tabs .nav-link');
    const cards = document.querySelectorAll('.card-column[data-country]');
    const offersSection = document.getElementById("offers"); // Раздел с табами


    function getSelectedCoutry() {
        const activeNavLink = document.querySelector('#country-tabs .nav-link.active');
        if (activeNavLink) {
            return activeNavLink.dataset.country;
        }
        return null;
    }

    function activateTabByHash(hash) {
        const country = decodeURIComponent(hash.replace("#", ""));
        console.log("Активируем таб:", country);

        const targetTab = [...navLinks].find(link => {
            return new URL(link.href).hash.replace("#", "") === country;
        });

        if (targetTab) {
            targetTab.click(); // Эмулируем клик
        }
    }

    function filterOffersByCountry(countryName) {
        cards.forEach(card => {
            if (card.dataset.country === countryName) {
                card.classList.add("show");
            }
            else {
                card.classList.remove("show");
            }
        });
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&  // Верхняя граница выше нижнего края экрана
            rect.bottom > 0                   // Нижняя граница ниже верхнего края экрана
        );
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            filterOffersByCountry(getSelectedCoutry());

            // Обновляем URL без перезагрузки
            const country = link.getAttribute("href").replace("#", "");
            history.pushState(null, null, `#${encodeURIComponent(country)}`);

            // Плавно скроллим к табам при загрузке
            setTimeout(() => {
            if (!isElementInViewport(offersSection)) {
                offersSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            }, 100);
        });
    });

    filterOffersByCountry(getSelectedCoutry());

    // Проверяем URL и эмулируем клик
    if (window.location.hash) {
        const hashCountry = decodeURIComponent(window.location.hash.substring(1));

        activateTabByHash(hashCountry);
    }

    // Слушаем изменения URL
    window.addEventListener('popstate', function (event) {
        if (window.location.hash) {
            activateTabByHash(window.location.hash);
        }
    });

    const messageInput = document.getElementById("message-text");
    const messengerButtons = document.querySelectorAll("button[data-messenger]");
    const sendMsgModal = document.getElementById('messageModal');

    // Функция для обновления состояния кнопок
    function updateButtonState() {
        const isMessageEmpty = messageInput.value.trim() === "";
        messengerButtons.forEach(button => button.disabled = isMessageEmpty);
    }
    
    function autoResize(event) {
        const textarea = event ? event.target : messageInput; // Определяем, откуда вызвана функция
        textarea.style.height = 'auto'; 
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Привязываем обработчик события ввода текста
    messageInput.addEventListener('input', autoResize);

    // Следим за вводом текста и обновляем состояние кнопок
    messageInput.addEventListener("input", updateButtonState);

    messengerButtons.forEach(button => {
        button.addEventListener("click", function () {
            const messenger = this.dataset.messenger;
            const message = encodeURIComponent(messageInput.value.trim());

            let link = "";

            if (messenger === "wa") {
                link = `https://wa.me/79219157157?text=${message}`;
            } else if (messenger === "tg") {
                link = `https://t.me/bolkoff?&text=${message}`;
            }

            if (link) {
                let modal = bootstrap.Modal.getInstance(sendMsgModal);
                if (modal) modal.hide();
                window.open(link, "_blank"); // Открыть ссылку в новой вкладке
            }
        });
    });

    updateButtonState();
    autoResize();

    if (sendMsgModal) {
        sendMsgModal.addEventListener('show.bs.modal', event => {
            const button = event.relatedTarget
            const message = button.getAttribute('data-bs-message')
            const messageInput = sendMsgModal.querySelector('#message-text')

            messageInput.value = message;
            updateButtonState();
            setTimeout(autoResize, 100);
        });
    }

});


const scrollLeft = document.getElementById('scrollLeft');
const scrollRight = document.getElementById('scrollRight');
const wrapper = document.getElementById('inspirationGallery');
if (scrollLeft && scrollRight) {
    function updateButtonVisibility() {
        // Скрываем кнопки, если достигли начала или конца
        scrollLeft.disabled = wrapper.scrollLeft === 0;
        scrollRight.disabled = wrapper.scrollLeft + wrapper.offsetWidth >= wrapper.scrollWidth;
    }

    // Прокрутка влево
    scrollLeft.addEventListener('click', () => {
        const elementWidth = getVisibleElementWidth(wrapper, 'left');
        wrapper.scrollBy({ left: -elementWidth, behavior: 'smooth' });
        setTimeout(updateButtonVisibility, 300); // Учитываем анимацию
    });

    // Прокрутка вправо
    scrollRight.addEventListener('click', () => {
        const elementWidth = getVisibleElementWidth(wrapper, 'right');
        wrapper.scrollBy({ left: elementWidth, behavior: 'smooth' });
        setTimeout(updateButtonVisibility, 300); // Учитываем анимацию
    });

    // Обновляем кнопки при загрузке и изменении размера окна
    window.addEventListener('resize', updateButtonVisibility);
    wrapper.addEventListener('scroll', updateButtonVisibility);
    updateButtonVisibility(); // Первый вызов при загрузке

    // Функция для определения ширины частично видимого элемента
    function getVisibleElementWidth(wrapper, direction) {
        const children = wrapper.children;
        const wrapperRect = wrapper.getBoundingClientRect();

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childRect = child.getBoundingClientRect();

            if (direction === 'left' && childRect.right > wrapperRect.left) {
            return Math.min(childRect.right - wrapperRect.left, child.offsetWidth);
            }

            if (direction === 'right' && childRect.left < wrapperRect.right) {
            return Math.min(wrapperRect.right - childRect.left, child.offsetWidth);
            }
        }

        // Если ничего не найдено, используем фиксированное значение (например, 300px)
        return 300;
    }
}
