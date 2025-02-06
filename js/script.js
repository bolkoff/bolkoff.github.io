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
            this.yCenter = - this.frameHeight * (((containerWidth - containerHeight)/2)/containerHeight);
            this.xCenter = 0;
        }
        else {
            this.scale = containerHeight / this.frameHeight;
            console.log("containerHeight =", containerHeight, "this.frameHeight= ", this.frameHeight);
            this.xCenter = - this.frameWidth * (((containerHeight - containerWidth)/2)/containerWidth);
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
    { time: 1.2, text: "романтического ужина на пляже Мальдив" },
    { time: 2.39, text: "полета на воздушном шаре над Каппадокией" },
    { time: 3.55, text: "купания со слонами в Таиланде" },
    { time: 4.69, text: "завтрака в бассейне на вилле в Дубае" },
    { time: 5.78, text: "первого урока серфинга на Бали" },
    { time: 6.82, text: "прогулки на яхте по побережью Дубая" },
    { time: 7.79, text: "первого заплыва с черепахами на Мальдивах" },
    { time: 8.69, text: "посещения термальных источников Памуккале" },
    { time: 9.5, text: "дегустации местной кухни в Стамбуле" },
    { time: 10.22, text: "рыбалки на закате в Индийском океане" },
    { time: 10.83, text: "первого урока дайвинга в бассейне" },
    { time: 11.33, text: "спа-ритуала с видом на океан" },
    { time: 11.83, text: "хаммама в лучших традициях Турции" },
    { time: 12.33, text: "тайского массажа на пляже" },
    ];

async function loadInto() {
    try {
        const controller = new AbortController(); // Контроллер для отмены
        const { signal } = controller;

        let loadedProgressSteps = 0;
        const allProgressSteps = 2;

        function updateProgress(loadedCount, allCount) {
            setLoadProgress((loadedProgressSteps + loadedCount)*100/(allProgressSteps + allCount))
        }

        console.log("🔹 Step 0: get intro show flag");
        introFlags = await loadStep([
            checkIntroFlags(),
        ],
        signal);

        console.log("🔹 Step 1: prepare buttons for returned");
        if (introFlags.includes("returned")) {
            await loadStep([
                prepareSkipButtons(".slide-container.zero-slide ~ [class*='-slide']", controller),
            ],
            signal);
        }
        else if (introFlags.includes("skip")) {
            removeIntro();
            showMainPage();
            return;
        }

        console.log("🔹 Step 2: load zero slide css");
        await loadStep([
            loadCSS("css/zero.css"),
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
            loadCSS("css/style.css"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/fitty/2.3.2/fitty.min.js", "fitty")
        ],
        signal);

        loadedProgressSteps++;
        updateProgress(0, allProgressSteps);

        console.log("🔹 Step 6: load intro slides resources");
        const step6Results = await loadStep([
            loadResources(".slide-container.zero-slide ~ [class*='-slide'] .lazy", updateProgress),
            loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"),
            initSprite()

        ],
        signal);

        console.log("step6Results =", step6Results);

        console.log("🔹 Step 7: waiting resources progress");
        await loadStep([
            waitForProgressCompete(),
        ],
        signal);

        loadCSS("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");
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
            startSlidesCycle(".slide-container.zero-slide ~ [class*='-slide']", step6Results[2])
        ],
        signal);

        loadMainPageResources();
        enableMainPage();
        console.log(introFlags);
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("⏩ Loading skipped by user");
            showMainPage();
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
        
    
        const results = Promise.all(promises)
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
            return resolve(); // CSS уже загружен
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

function loadScript(src, globalVar = null, checkInterval = 10, timeout = 5000) {
    return new Promise((resolve, reject) => {
        // Если скрипт уже загружен и глобальная переменная доступна — сразу резолвим
        if (document.querySelector(`script[src="${src}"]`)) {
            if (!globalVar || window[globalVar]) return resolve(window[globalVar]);
        }

        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            
            if (!globalVar) {
                resolve();
                return;
            }

            // Ждем появления глобального объекта
            const startTime = Date.now();
            const checkVar = setInterval(() => {
                if (window[globalVar]) {
                    clearInterval(checkVar);
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
                console.log("callback_loaded for: ", elem.classList);
                if (updateProgress) {
                    updateProgress ((elementsCount - lazyLoad.toLoadCount), elementsCount);
                }
            },
            callback_finish: (lazyInstance) => {
                //clearTimeout(timeoutId);
                lazyInstance.destroy();
                elementsCount = 0;
                if (updateProgress) {
                    updateProgress(elementsCount, elementsCount);
                }
                console.log("callback_finish for: ", selector);
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
        
        console.log("visitCount = ", visitCount);
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
    console.log("starting progress update = ", targetProgress)
    if (!startTime) {
        console.error("DOM not loaded");
        return;
    }

    if (isAnimating) {
        console.log("added to queue = ", targetProgress)
        animationQueue.push(targetProgress);
        return;
    }

    if (targetProgress > 0 && targetProgress <101) {
        logo = document.querySelector(".lazy.logo").contentDocument
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
                console.log("ended progress update = ", targetProgress);
                isAnimating = false;
                currentProgress = targetProgress;
    
                if (animationQueue.length > 0) {
                    const nextProgress = animationQueue.shift();
                    console.log("nextProgress = ", nextProgress);
                    if (nextProgress > targetProgress) {
                        console.log(`${nextProgress} > ${targetProgress}`);
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
            console.log("waitForProgressCompete currentProgress = ", currentProgress);
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

        window.addEventListener('resize', () => {calcTextRows();});
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
            const firstRow = container.querySelector('.text-row');
            if (!firstRow) return;
    
            const letterIndex = firstRow.textContent.indexOf(letter);
            if (letterIndex === -1) {
                return;
            }
    
            const range = document.createRange();
            const textNode = firstRow.firstChild;
            range.setStart(textNode, letterIndex);
            range.setEnd(textNode, letterIndex + 1);
    
            const rect = range.getBoundingClientRect();
            
            // Вычисляем координаты относительно родителя
            const originX = rect.left + rect.width/2;
            const originY = 0 + rect.height/2;
    
            // Устанавливаем transform-origin
            container.parentElement.style.transformOrigin = `${originX}px ${originY}px`;
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

async function loadMainPageResources() {
    await loadScript("https://cdn.jsdelivr.net/npm/vanilla-lazyload@19.1.3/dist/lazyload.min.js", "LazyLoad");
    await loadCSS("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");
    await loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js");
    await loadCSS("css/style.css");
    await loadResources(".video-banner-poster-lazy")
        .then (() => loadResources(".video-banner-video"));
    
    const lazyLoad = new LazyLoad({
            elements_selector: ".lazy-main",
            use_native: "true"
            });

    loadCSS("css/element-icons.css");
    //loadCSS("/css/glitch.css");
}

async function enableMainPage() {
    document.body.style.display = 'block';
    document.body.style.overflow = 'auto';
}

async function showMainPage() {
    loadMainPageResources();
    enableMainPage();
    
    const mainPage = document.querySelector(".main-page");
    const navbar = document.getElementById("mainNavbar");
    const roundButton = document.getElementById('round-center-button');
    
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

    
    
}

window.addEventListener('load', () => {
    if (!startTime) {
        startTime = performance.now();
    }
    
    //loadInto();
    (async () => { await loadInto(); })();
    

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
            const videoBannerVideo = document.querySelector(".video-banner-video");
            
            videoBannerVideo.style.display = "block";
            poster.style.display = "none";
            video.play();
            console.log("Started video play");
        }, { once: true });
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
