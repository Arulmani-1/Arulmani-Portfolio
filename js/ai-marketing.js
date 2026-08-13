document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. Scroll-Scrubbed Video Canvas Engine
    // ----------------------------------------------------------------------
    const container = document.getElementById('scroll-video-container');
    const video = document.getElementById('scrub-video');
    const canvas = document.getElementById('scrub-canvas');
    
    if (container && video && canvas) {
        const ctx = canvas.getContext('2d');
        let isVideoReady = false;
        let currentVideoTime = 0;
        let targetVideoTime = 0;
        let animationFrameId;

        // Function to handle canvas sizing with Device Pixel Ratio (DPR)
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            
            ctx.scale(dpr, dpr);
            
            // Draw immediately if ready, else wait for loop
            if (isVideoReady) {
                drawFrame();
            }
        };

        window.addEventListener('resize', resizeCanvas);

        const drawFrame = () => {
            if (!isVideoReady || !video.videoWidth) return;

            // Object-fit: cover math
            const canvasRatio = canvas.offsetWidth / canvas.offsetHeight;
            const videoRatio = video.videoWidth / video.videoHeight;
            
            let drawWidth = canvas.offsetWidth;
            let drawHeight = canvas.offsetHeight;
            let drawX = 0;
            let drawY = 0;

            if (canvasRatio > videoRatio) {
                drawHeight = drawWidth / videoRatio;
                drawY = (canvas.offsetHeight - drawHeight) / 2;
            } else {
                drawWidth = drawHeight * videoRatio;
                drawX = (canvas.offsetWidth - drawWidth) / 2;
            }

            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
        };

        // When the video can be played, start everything
        video.addEventListener('loadeddata', () => {
            isVideoReady = true;
            resizeCanvas();
            container.classList.add('video-ready');
            
            // Start the render loop
            const renderLoop = () => {
                // Linear interpolation (lerp factor 0.12)
                currentVideoTime += (targetVideoTime - currentVideoTime) * 0.12;
                
                // Only update the video's currentTime if it's significantly different
                if (Math.abs(currentVideoTime - video.currentTime) > 0.01) {
                    video.currentTime = currentVideoTime;
                }
                
                // Draw current frame
                drawFrame();
                
                animationFrameId = requestAnimationFrame(renderLoop);
            };
            
            renderLoop();
        });

        // Some browsers need this to actually load the video data when it's paused
        video.load();

        // Calculate scroll progress to set target time
        const updateScrollProgress = () => {
            // How far we can scroll
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            
            // Normalized scroll progress [0, 1]
            let scrollProgress = 0;
            if (maxScroll > 0) {
                scrollProgress = currentScroll / maxScroll;
            }
            
            // Clamp
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));
            
            // Map scroll progress to video duration
            if (video.duration) {
                targetVideoTime = scrollProgress * video.duration;
            }
        };

        window.addEventListener('scroll', updateScrollProgress, { passive: true });
    }

    // ----------------------------------------------------------------------
    // 2. Staggered IntersectionObserver Reveal
    // ----------------------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal-element');
    
    if (revealElements.length > 0) {
        const revealOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Viewport intersection threshold
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Get custom delay if any
                    const delay = entry.target.getAttribute('data-delay') || '0ms';
                    entry.target.style.transitionDelay = delay;
                    
                    // Add active class
                    entry.target.classList.add('reveal-active');
                    
                    // Unobserve after revealing for performance
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }
});
