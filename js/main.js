document.addEventListener("DOMContentLoaded", (event) => {
    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // 2. Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (window.matchMedia('(pointer: fine)').matches) {
        gsap.set([cursorDot, cursorOutline], { xPercent: -50, yPercent: -50 });

        window.addEventListener('mousemove', (e) => {
            gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
            gsap.to(cursorOutline, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power3.out' });
        });

        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursorOutline, { scale: 1.5, opacity: 0.5, duration: 0.3 });
                gsap.to(cursorDot, { scale: 0, opacity: 0, duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursorOutline, { scale: 1, opacity: 1, duration: 0.3 });
                gsap.to(cursorDot, { scale: 1, opacity: 1, duration: 0.3 });
            });
        });
    }

    // 3. Navbar Scroll Effect & Mobile Menu Logic
    const navbar = document.querySelector('.custom-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse) {
        // Prevent background scrolling when menu is open
        navbarCollapse.addEventListener('show.bs.collapse', () => {
            document.body.style.overflow = 'hidden';
            if (lenis) lenis.stop(); // Stop Lenis scroll
        });
        navbarCollapse.addEventListener('hide.bs.collapse', () => {
            document.body.style.overflow = '';
            if (lenis) lenis.start(); // Start Lenis scroll
        });

        // Close menu when a link is clicked
        const navLinks = navbarCollapse.querySelectorAll('.nav-link, .btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            });
        });
    }

    // 4. Hero Image 3D Tilt Effect
    const heroImageWrapper = document.querySelector('.hero-image-wrapper');
    const heroImage = document.querySelector('.hero-image');
    if (heroImageWrapper && window.matchMedia('(pointer: fine)').matches) {
        heroImageWrapper.addEventListener('mousemove', (e) => {
            const rect = heroImageWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xRotation = ((y / rect.height) - 0.5) * -20;
            const yRotation = ((x / rect.width) - 0.5) * 20;
            
            gsap.to(heroImageWrapper, {
                rotationX: xRotation,
                rotationY: yRotation,
                transformPerspective: 1000,
                ease: "power2.out",
                duration: 0.4
            });
            
            // Add extra depth to the image inside
            gsap.to(heroImage, {
                x: -yRotation,
                y: xRotation,
                scale: 1.05,
                ease: "power2.out",
                duration: 0.4
            });
        });
        
        heroImageWrapper.addEventListener('mouseleave', () => {
            gsap.to(heroImageWrapper, {
                rotationX: 0,
                rotationY: 0,
                ease: "elastic.out(1, 0.5)",
                duration: 1.5
            });
            gsap.to(heroImage, {
                x: 0,
                y: 0,
                scale: 1,
                ease: "elastic.out(1, 0.5)",
                duration: 1.5
            });
        });
    }

    // 5. GSAP Scroll Animations
    // Hero Load
    const tl = gsap.timeline();
    tl.fromTo('.hero-image', 
        { scale: 1.08, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 2, ease: 'power3.out' }
    )
    .fromTo('.hero-text-line span',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: 'power3.out' },
        "-=1.5"
    )
    .fromTo('.hero-subtitle',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' },
        "-=1"
    )
    .fromTo('.hero-cta .btn',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'power2.out' },
        "-=0.8"
    );

    // Hero Parallax
    gsap.to('.hero-content', {
        y: -100, scale: 0.95, opacity: 0,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-image', {
        y: -50,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // About Reveal
    gsap.utils.toArray('.about-text, .about-heading').forEach(el => {
        gsap.fromTo(el, { y: 40, opacity: 0 }, {
            y: 0, opacity: 1, duration: 1.5, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Experience (Role) Timeline
    const roleTimeline = gsap.timeline({
        scrollTrigger: { trigger: '.role-layout', start: 'top 70%', end: 'bottom 20%', scrub: 1 }
    });
    roleTimeline.to('.role-line-fill', { scaleY: 1, ease: 'none' });

    gsap.utils.toArray('.role-card').forEach(card => {
        gsap.fromTo(card, { x: 50, opacity: 0 }, {
            x: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 80%' }
        });
    });
    gsap.utils.toArray('.role-dot').forEach(dot => {
        gsap.fromTo(dot, { scale: 0, opacity: 0 }, {
            scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: dot, start: 'top 80%' }
        });
    });

    // Education, Skills, Services Grid Animation
    const staggerSections = ['.edu-card', '.skill-category', '.service-card'];
    staggerSections.forEach(selector => {
        gsap.utils.toArray(selector).forEach(el => {
            gsap.fromTo(el, { y: 50, opacity: 0 }, {
                y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        });
    });

    // Philosophy Reveal
    gsap.fromTo('.phil-word', 
        { y: 100, opacity: 0, rotateX: -45 },
        { y: 0, opacity: 1, rotateX: 0, stagger: 0.15, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.philosophy', start: 'top 60%' } }
    );
    gsap.fromTo('.phil-text', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power2.out', scrollTrigger: { trigger: '.philosophy', start: 'top 60%' } }
    );

    // Certifications Typewriter Effect
    const certTitles = document.querySelectorAll('.cert-title');
    certTitles.forEach(title => {
        const text = title.innerText.trim();
        // Clear text but keep the space so layout doesn't shift
        title.innerHTML = '&nbsp;'; 
        
        ScrollTrigger.create({
            trigger: title,
            start: 'top 90%',
            onEnter: () => {
                let i = 0;
                title.innerHTML = '';
                
                // Create blinking cursor element
                const cursor = document.createElement('span');
                cursor.innerHTML = '|';
                cursor.style.animation = 'blink 1s step-end infinite';
                cursor.style.color = 'var(--accent-1)';
                cursor.style.fontWeight = 'bold';
                
                title.appendChild(cursor);
                
                const typeInterval = setInterval(() => {
                    cursor.insertAdjacentText('beforebegin', text.charAt(i));
                    i++;
                    if (i === text.length) {
                        clearInterval(typeInterval);
                        // Optional: remove cursor after typing or leave it blinking
                        setTimeout(() => cursor.remove(), 2000); 
                    }
                }, 40); // typing speed
            },
            once: true
        });
    });

    // Add blink keyframes dynamically if not present
    if (!document.querySelector('#typewriter-style')) {
        const style = document.createElement('style');
        style.id = 'typewriter-style';
        style.innerHTML = `@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`;
        document.head.appendChild(style);
    }

    // Contact Reveal
    gsap.fromTo('.contact-wrapper', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out', scrollTrigger: { trigger: '.contact', start: 'top 80%' } }
    );

    // Footer Wave Text
    const waveText = document.querySelector('.wave-text');
    if (waveText) {
        const text = waveText.innerText;
        waveText.innerHTML = '';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.innerText = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${i * 0.05}s`;
            span.classList.add('wave-char');
            waveText.appendChild(span);
        });
    }

    // Navbar ScrollSpy
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    });
});
